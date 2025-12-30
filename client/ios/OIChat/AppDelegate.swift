import Expo
import React
import ReactAppDependencyProvider
import PushKit
import WebRTC
import CallKit
import AVFoundation


@UIApplicationMain
public class AppDelegate: ExpoAppDelegate, PKPushRegistryDelegate, CXProviderDelegate, CXCallObserverDelegate {
  
  
  var window: UIWindow?

  // ✅ PKPushRegistry instance for VoIP push notifications
  var voipRegistry: PKPushRegistry?
  private var callObserver: CXCallObserver?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    let localizedAppName = Bundle.main.localizedInfoDictionary?["CFBundleDisplayName"] as? String
    let appName = Bundle.main.infoDictionary?["CFBundleDisplayName"] as! String
    RNCallKeep.setup([
      "appName": localizedAppName ?? appName,
      "supportsVideo": true,
      "includesCallsInRecents": false,
    ])
    
    // ✅ Initialize and configure PKPushRegistry for VoIP
    voipRegistry = PKPushRegistry(queue: DispatchQueue.main)
    voipRegistry?.delegate = self
    voipRegistry?.desiredPushTypes = [.voIP]
    
    // ✅ Still call the library's registration method
    RNVoipPushNotificationManager.voipRegistration()

    // Observe CallKit call state changes (works even when RNCallKeep owns the CXProvider delegate).
    // We use this to re-assert AVAudioSession config on cold-start answers where audio can be silent.
    callObserver = CXCallObserver()
    callObserver?.setDelegate(self, queue: DispatchQueue.main)

//    let options = WebRTCModuleOptions.sharedInstance()
//    options.enableMultitaskingCameraAccess = true


    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

    #if os(iOS) || os(tvOS)
      window = UIWindow(frame: UIScreen.main.bounds)
      factory.startReactNative(
        withModuleName: "main",
        in: window,
        launchOptions: launchOptions)
    #endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }

  public func providerDidReset(_ provider: CXProvider) {
    // Required by CXProviderDelegate; RNCallKeep is usually the provider delegate in practice.
  }

  // Best-practice CallKit answer handling: configure audio session and fulfill.
  public func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
    print("🟢 [AppDelegate] performAnswerCallAction uuid=\(action.callUUID.uuidString)")
    configureAudioSessionForCall(defaultToSpeaker: true)
    action.fulfill()
  }

  private func configureAudioSessionForCall(defaultToSpeaker: Bool) {
    do {
      let session = AVAudioSession.sharedInstance()
      var options: AVAudioSession.CategoryOptions = [.allowBluetooth, .allowBluetoothA2DP]
      if defaultToSpeaker {
        options.insert(.defaultToSpeaker)
      }
      try session.setCategory(.playAndRecord, mode: .voiceChat, options: options)
      try session.setActive(true, options: [])
      print("🔊 [AppDelegate] AVAudioSession configured category=\(session.category.rawValue) mode=\(session.mode.rawValue)")
    } catch {
      print("❌ [AppDelegate] Failed to configure AVAudioSession: \(error)")
    }
  }

  // handle updated push credentials
  public func provider(_ provider: CXProvider, didActivate audioSession: AVAudioSession) {
    // Re-assert category/mode; CallKit activation order during cold-start can be flaky.
    configureAudioSessionForCall(defaultToSpeaker: true)
    RTCAudioSession.sharedInstance().audioSessionDidActivate(AVAudioSession.sharedInstance())
  }

  public func provider(_ provider: CXProvider, didDeactivate audioSession: AVAudioSession) {
    RTCAudioSession.sharedInstance().audioSessionDidDeactivate(AVAudioSession.sharedInstance())
  }

  // Handle system-level end call (reject or hangup)
  func provider(_ provider: CXProvider, performEndCall action: CXEndCallAction) {
    print("🔴 System call ended: \(action.callUUID.uuidString)")
    
    // ⚠️ If the call was never accepted, WebRTC may still not be initialized,
    // but you can still deactivate the audio session or camera
    RTCAudioSession.sharedInstance().audioSessionDidDeactivate(AVAudioSession.sharedInstance())
    
    // ✅ Tell CallKit the action is completed
    action.fulfill()
  }

  // CXCallObserverDelegate-style callback (implemented on AppDelegate since we set it as delegate).
  // When a call connects, re-assert AVAudioSession to fix silent-audio on cold-start.
  public func callObserver(_ callObserver: CXCallObserver, callChanged call: CXCall) {
    if call.hasConnected && !call.hasEnded {
      print("🟢 [AppDelegate] callObserver: call connected uuid=\(call.uuid.uuidString)")
      configureAudioSessionForCall(defaultToSpeaker: true)
    }
  }

  // ✅ THIS METHOD WILL NOW BE CALLED: handle updated push credentials
  public func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate credentials: PKPushCredentials,
    for type: PKPushType
  ) {
    print("📱 [AppDelegate] VoIP push token updated")
    // Forward to the library
    RNVoipPushNotificationManager.didUpdate(credentials, forType: type.rawValue)
  }

  // ✅ THIS METHOD WILL NOW BE CALLED: handle incoming pushes (even when app is killed/backgrounded)
  public func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    print("📱 [AppDelegate] VoIP push received - app state may be backgrounded/killed")

    // process the payload
    let uuid = payload.dictionaryPayload["uuid"]
    let hasVideoValue = payload.dictionaryPayload["hasVideo"]
    let hasVideo: Bool = {
      if let boolValue = hasVideoValue as? Bool {
        return boolValue
      } else if let stringValue = hasVideoValue as? String {
        return stringValue.lowercased() == "true" || stringValue == "1"
      } else if let numberValue = hasVideoValue as? NSNumber {
        return numberValue.boolValue
      } else if let intValue = hasVideoValue as? Int {
        return intValue != 0
      }
      return false
    }()
    let handle = payload.dictionaryPayload["handle"]
    let caller = payload.dictionaryPayload["callerName"]


    RNVoipPushNotificationManager.addCompletionHandler(uuid as! String, completionHandler: completion)

    RNVoipPushNotificationManager.didReceiveIncomingPush(
        with: payload,
        forType: type.rawValue
    )

    // display the incoming call notification
    // ✅ This will show the CallKit UI even when app is killed
    RNCallKeep.reportNewIncomingCall(
      uuid as! String,
      handle: handle as! String,
        handleType: "generic",
        hasVideo: hasVideo,
      localizedCallerName: caller as! String,
        supportsHolding: true,
        supportsDTMF: true,
        supportsGrouping: true,
        supportsUngrouping: true,
        fromPushKit: true,
        payload: nil,
        withCompletionHandler: completion
    )
  }
  
  // ✅ ADD THIS: Handle push registry invalid token (optional but recommended)
  public func pushRegistry(
    _ registry: PKPushRegistry,
    didInvalidatePushTokenFor type: PKPushType
  ) {
    print("⚠️ [AppDelegate] VoIP push token invalidated - re-registering")
    // Re-register if token becomes invalid
    RNVoipPushNotificationManager.voipRegistration()
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
    #else
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
