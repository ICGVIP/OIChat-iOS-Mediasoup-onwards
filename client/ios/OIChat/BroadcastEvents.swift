import Foundation
import React

/**
 * Emits ReplayKit Broadcast Extension lifecycle events to JS.
 *
 * The Broadcast Upload Extension posts Darwin notifications:
 * - "iOS_BroadcastStarted"
 * - "iOS_BroadcastStopped"
 *
 * We listen on CFNotificationCenterGetDarwinNotifyCenter() and forward to JS.
 */
@objc(BroadcastEvents)
class BroadcastEvents: RCTEventEmitter {
  private var hasListeners = false
  private let center = CFNotificationCenterGetDarwinNotifyCenter()

  private let startedName = "iOS_BroadcastStarted" as CFString
  private let stoppedName = "iOS_BroadcastStopped" as CFString

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  override func supportedEvents() -> [String]! {
    return ["broadcastStarted", "broadcastStopped"]
  }

  override func startObserving() {
    hasListeners = true

    let started = CFNotificationName(rawValue: startedName)
    let stopped = CFNotificationName(rawValue: stoppedName)

    CFNotificationCenterAddObserver(
      center,
      UnsafeMutableRawPointer(Unmanaged.passUnretained(self).toOpaque()),
      BroadcastEvents.handleDarwinNotification,
      started.rawValue,
      nil,
      .deliverImmediately
    )

    CFNotificationCenterAddObserver(
      center,
      UnsafeMutableRawPointer(Unmanaged.passUnretained(self).toOpaque()),
      BroadcastEvents.handleDarwinNotification,
      stopped.rawValue,
      nil,
      .deliverImmediately
    )
  }

  override func stopObserving() {
    hasListeners = false
    CFNotificationCenterRemoveObserver(center, UnsafeMutableRawPointer(Unmanaged.passUnretained(self).toOpaque()), nil, nil)
  }

  private func emit(_ name: String) {
    if !hasListeners { return }
    sendEvent(withName: name, body: [:])
  }

  private static let handleDarwinNotification: CFNotificationCallback = { (_, observer, name, _, _) in
    guard let observer else { return }
    let instance = Unmanaged<BroadcastEvents>.fromOpaque(observer).takeUnretainedValue()
    guard let name else { return }

    let raw = name.rawValue as String
    if raw == "iOS_BroadcastStarted" {
      instance.emit("broadcastStarted")
    } else if raw == "iOS_BroadcastStopped" {
      instance.emit("broadcastStopped")
    }
  }
}




