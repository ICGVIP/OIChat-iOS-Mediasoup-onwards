<p align="center">
  <img src="https://www.mediasfu.com/logo192.png" width="100" alt="MediaSFU Logo">
</p>

<p align="center">
  <a href="https://twitter.com/media_sfu">
    <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter">
  </a>
  <a href="https://github.com/MediaSFU">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://www.mediasfu.com/">
    <img src="https://img.shields.io/badge/Website-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Website">
  </a>
  <a href="https://www.youtube.com/channel/UCELghZRPKMgjih5qrmXLtqw">
    <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube">
  </a>
  <a href="https://www.mediasfu.com/forums">
    <img src="https://img.shields.io/badge/Community-Forum-blue?style=for-the-badge&logo=discourse&logoColor=white" alt="Community Forum">
  </a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT">
  </a>
  <a href="https://www.npmjs.com/package/mediasfu-reactnative-expo">
    <img src="https://img.shields.io/npm/v/mediasfu-reactnative-expo.svg?style=flat-square" alt="NPM">
  </a>
  <img src="https://img.shields.io/badge/Built%20with-MediaSFU-blue?style=flat-square" alt="Built with MediaSFU">
  <img src="https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React Native">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<p align="center">
  <strong>MediaSFU React Native Expo SDK</strong> provides a comprehensive solution for building real-time communication applications. Part of the MediaSFU ecosystem with cross-platform support for iOS, Android, and Web environments, seamlessly integrating video conferencing, live streaming, and interactive media features into your mobile applications.
</p>

---

## 🚨 **BREAKING: AI Phone Agents at $0.10 per 1,000 minutes**

📞 **Call our live AI demos right now:**
- 🇺🇸 **+1 (785) 369-1724** - Mixed Support Demo  
- 🇬🇧 **+44 7445 146575** - AI Conversation Demo  
- 🇨🇦 **+1 (587) 407-1990** - Technical Support Demo  
- 🇨🇦 **+1 (647) 558-6650** - Friendly AI Chat Demo  

**Traditional providers charge $0.05 per minute. We charge $0.10 per 1,000 minutes. That's 500x cheaper.**

✅ **Deploy AI phone agents in 30 minutes**  
✅ **Works with ANY SIP provider** (Twilio, Telnyx, Zadarma, etc.)  
✅ **Seamless AI-to-human handoffs**  
✅ **Real-time call analytics & transcription**  

📖 **[Complete SIP/PSTN Documentation →](https://mediasfu.com/telephony)**

---

## Quick Reference: Component Props & UI Overrides

> **New:** UI override parity now extends across Webinar and Chat layouts, unifying customization for every MediaSFU interface.

Every primary MediaSFU UI export—`MediasfuGeneric`, `MediasfuBroadcast`, `MediasfuConference`, `MediasfuWebinar`, and `MediasfuChat`—now ships with a consistent prop surface and a powerful `uiOverrides` map, so you can bend the bundled experience to match your product without losing MediaSFU's hardened real-time logic.

### Shared component props (applies to every MediaSFU UI component)

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `PrejoinPage` | `(options) => React.ReactNode` | `WelcomePage` | Swap in a custom pre-join experience. Receives unified pre-join options so you can add branding, legal copy, or warm-up flows. |
| `localLink` | `string` | `""` | Point the SDK at your self-hosted MediaSFU server. Leave empty when using MediaSFU Cloud. |
| `connectMediaSFU` | `boolean` | `true` | Toggle automatic socket/WebRTC connections. Set to `false` when you only need the UI shell. |
| `credentials` | `{ apiUserName: string; apiKey: string }` | `{ apiUserName: "", apiKey: "" }` | Supply cloud credentials without hard-coding them elsewhere. |
| `useLocalUIMode` | `boolean` | `false` | Run the interface in local/demo mode with no remote signaling. |
| `seedData`, `useSeed` | `SeedData`, `boolean` | `{}`, `false` | Pre-populate the UI for demos, snapshot tests, or onboarding tours. |
| `imgSrc` | `string` | `https://mediasfu.com/images/logo192.png` | Default artwork used across pre-join and modal flows. |
| `sourceParameters` | `Record<string, unknown>` | `undefined` | Shared helper bag (media devices, participant helpers, layout handlers). Pair with `updateSourceParameters` to mirror the SDK's internal utilities. |
| `updateSourceParameters` | `(helpers) => void` | `undefined` | Receive the latest helper bundle so you can bridge MediaSFU logic into your own components. |
| `returnUI` | `boolean` | `true` | When `false`, mount the logic only—a perfect stepping stone to a fully bespoke interface. |
| `noUIPreJoinOptions` | `CreateMediaSFURoomOptions \| JoinMediaSFURoomOptions` | `undefined` | Feed pre-join data when `returnUI` is `false` and you want to bypass the on-screen wizard. |
| `joinMediaSFURoom`, `createMediaSFURoom` | Functions | `undefined` | Inject your own networking layers for joining or creating rooms. |
| `customComponent` | `CustomComponentType` | `undefined` | Replace the entire UI while retaining transports, sockets, and helpers. |
| `customVideoCard`, `customAudioCard`, `customMiniCard` | Factories | `undefined` | Override participant card renders to add metadata, CTAs, or badges. |
| `containerStyle` | `React.CSSProperties` | `undefined` | Apply inline styles to the root wrapper (dashboards, split views, etc.). |
| `uiOverrides` | `MediasfuUICustomOverrides` | `undefined` | Targeted component/function overrides described below. |

> **Power combo:** Set `returnUI={false}` to run MediaSFU logic headless, capture helpers via `updateSourceParameters`, and selectively bring UI pieces back with `uiOverrides`. That gives you progressive migration with minimal code churn.

```ts
import type { MediasfuUICustomOverrides } from "mediasfu-reactnative-expo";

const overrides: MediasfuUICustomOverrides = { /* ... */ };
```

Bring the types into your project to unlock full IntelliSense for every override slot.

### Custom UI Playbook

Use a toggle-driven "playbook" component to experiment with MediaSFU's customization layers. Flip a couple of booleans and you can watch the SDK jump between prebuilt layouts, headless logic, or a fully bespoke workspace driven by `customComponent`.

#### What the playbook demonstrates

- **Connection presets**: toggle `connectionScenario` between `cloud`, `hybrid`, or `ce` to swap credentials, local links, and connection modes in one place.
- **Experience selector**: the `selectedExperience` switch renders `MediasfuGeneric`, `MediasfuBroadcast`, `MediasfuWebinar`, `MediasfuConference`, or `MediasfuChat` without touching the rest of your stack.
- **UI strategy flags**: booleans like `showPrebuiltUI`, `enableFullCustomUI`, and `enableNoUIPreJoin` demonstrate how to run the MediaSFU logic with or without the bundled UI.
- **Layered overrides**: toggles enable the custom video/audio/mini cards, drop-in `uiOverrides` for layout and modal surfaces, container styling, and backend proxy helpers.
- **Custom workspace demo**: a `customComponent` receives live MediaSFU helpers so you can build dashboards, CRM surfaces, or any bespoke host interface.
- **Debug panel & helpers**: optional JSON panel exposes the `updateSourceParameters` payload so you can see exactly what to wire into your own components.

#### Try it quickly

```tsx
const connectionScenario: "cloud" | "hybrid" | "ce" = "cloud";
const selectedExperience = "generic" as const;
const showPrebuiltUI = true;
const enableFullCustomUI = false;

const connectionPresets = {
  cloud: { credentials: { apiUserName: "demo", apiKey: "demo" }, localLink: "", connectMediaSFU: true },
  hybrid: { credentials: { apiUserName: "demo", apiKey: "demo" }, localLink: "http://localhost:3000", connectMediaSFU: true },
  ce: { credentials: undefined, localLink: "http://localhost:3000", connectMediaSFU: false },
};

const Experience = {
  generic: MediasfuGeneric,
  broadcast: MediasfuBroadcast,
  webinar: MediasfuWebinar,
  conference: MediasfuConference,
  chat: MediasfuChat,
}[selectedExperience];

export const CustomUIPlaybook = () => {
  const overrides = useMemo(() => ({
    mainContainer: enableFullCustomUI
      ? {
          render: (props) => (
            <View style={{ borderWidth: 4, borderColor: 'purple', borderRadius: 24, padding: 16 }}>
              <MainContainerComponent {...props} />
            </View>
          ),
        }
      : undefined,
  }), [enableFullCustomUI]);

  const current = connectionPresets[connectionScenario];

  return (
    <Experience
      {...current}
      showPrebuiltUI={showPrebuiltUI}
      uiOverrides={overrides}
      containerStyle={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", minHeight: "100%" }}
    />
  );
};
```

Toggle the configuration values at the top of the playbook and watch the UI reconfigure instantly. It's the fastest path to understand MediaSFU's override surface before you fold the patterns into your production entrypoint.

#### Passing custom props and UI overrides

Use the same playbook to validate bespoke cards, override bundles, and fully custom workspaces before you move them into production code:

```tsx
const videoCard: CustomVideoCardType = (props) => (
  <VideoCard
    {...props}
    customStyle={{
      borderRadius: 20,
      border: "3px solid #4c1d95",
      boxShadow: "0 28px 65px rgba(76,29,149,0.35)",
      background: "linear-gradient(140deg, rgba(15,23,42,0.78), rgba(30,64,175,0.45))",
      ...(props.customStyle ?? {}),
    }}
  />
);

const audioCard: CustomAudioCardType = (props) => (
  <AudioCard
    {...props}
    barColor="#22c55e"
    customStyle={{ borderRadius: 22, background: "rgba(34,197,94,0.1)" }}
  />
);

const miniCard: CustomMiniCardType = (props) => (
  <MiniCard
    {...props}
    renderContainer={({ defaultContainer }) => (
      <View style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        {defaultContainer}
      </View>
    )}
  />
);

const uiOverrides = useMemo<MediasfuUICustomOverrides>(() => ({
  mainContainer: {
    render: (props) => (
      <View style={{ borderWidth: 4, borderColor: 'rgba(139,92,246,0.8)', borderRadius: 28, padding: 16 }}>
        <MainContainerComponent {...props} />
      </View>
    ),
  },
  menuModal: {
    component: (modalProps) => <MenuModal {...modalProps} variant="glass" />,
  },
  consumerResume: {
    wrap: (original) => async (params) => {
      const startedAt = performance.now();
      const result = await original(params);
      analytics.track("consumer_resume", {
        durationMs: performance.now() - startedAt,
        consumerId: params?.consumer?.id,
      });
      return result;
    },
  },
}), []);

return (
  <Experience
    {...current}
    customVideoCard={videoCard}
    customAudioCard={audioCard}
    customMiniCard={miniCard}
    customComponent={enableFullCustomUI ? CustomWorkspace : undefined}
    containerStyle={{ background: "#0f172a", borderRadius: 32, overflow: "hidden" }}
    uiOverrides={uiOverrides}
  />
);
```

Because the playbook surfaces `updateSourceParameters`, you can also log or snapshot the helper bundle (`getParticipantMedia`, `toggleMenuModal`, `showAlert`, and more) to ensure your custom UI always receives the hooks it expects.

### `uiOverrides` map — override keys at a glance

Each key accepts a `CustomComponentOverride<Props>` object with optional `component` and `render` fields. You can fully replace the default implementation or wrap it while forwarding props.

#### Layout & control surfaces

| Key | Default component | Typical use |
| --- | --- | --- |
| `mainContainer` | `MainContainerComponent` | Inject theming providers or dashboard layouts. |
| `mainAspect` | `MainAspectComponent` | Tune how the main region splits space. |
| `mainScreen` | `MainScreenComponent` | Orchestrate hero video + gallery interplay. |
| `mainGrid` | `MainGridComponent` | Modify layout or layering of primary participants. |
| `subAspect` | `SubAspectComponent` | Restyle fixed control strips in webinar/conference modes. |
| `otherGrid` | `OtherGridComponent` | Change presentation of off-stage attendees. |
| `flexibleGrid`, `flexibleGridAlt` | `FlexibleGrid` | Implement AI-driven or branded array layouts. |
| `flexibleVideo` | `FlexibleVideo` | Add captions, watermarks, or overlays to highlighted speakers. |
| `audioGrid` | `AudioGrid` | Customise audio-only attendee presentation. |
| `pagination` | `Pagination` | Introduce infinite scroll or auto-cycling carousels. |
| `controlButtons` | `ControlButtonsComponent` | Rebrand the primary action bar. |
| `controlButtonsAlt` | `ControlButtonsAltComponent` | Control secondary button clusters. |
| `controlButtonsTouch` | `ControlButtonsComponentTouch` | Deliver mobile-first controls (used heavily by `MediasfuChat`). |

#### Participant cards & widgets

| Key | Default component | Typical use |
| --- | --- | --- |
| `videoCard` | `VideoCard` | Add host badges, reactions, or CRM overlays. |
| `audioCard` | `AudioCard` | Swap avatars or expose spoken-language info. |
| `miniCard` | `MiniCard` | Customize thumbnails in picture-in-picture modes. |
| `miniAudio` | `MiniAudio` | Re-style the audio-only mini indicators. |
| `meetingProgressTimer` | `MeetingProgressTimer` | Replace the elapsed-time widget with countdowns or milestones. |
| `miniAudioPlayer` | `MiniAudioPlayer` | Provide alternative UI for recorded clip playback. |

#### Modals, dialogs, and collaboration surfaces

| Key | Default component | Typical use |
| --- | --- | --- |
| `loadingModal` | `LoadingModal` | Show branded skeletons while connecting. |
| `alert` | `AlertComponent` | Route alerts through your notification system. |
| `menuModal` | `MenuModal` | Redesign quick-action trays. |
| `eventSettingsModal` | `EventSettingsModal` | Extend host tools with your own settings. |
| `requestsModal` | `RequestsModal` | Build moderation queues tailored to your workflows. |
| `waitingRoomModal` | `WaitingRoomModal` | Deliver custom waiting-room experiences. |
| `coHostModal` | `CoHostModal` | Manage co-hosts with bespoke UX. |
| `mediaSettingsModal` | `MediaSettingsModal` | Embed device tests or instructions. |
| `participantsModal` | `ParticipantsModal` | Introduce advanced filters, search, or notes. |
| `messagesModal` | `MessagesModal` | Drop in your full-featured chat module. |
| `displaySettingsModal` | `DisplaySettingsModal` | Let users pick layouts, themes, or captions. |
| `confirmExitModal` | `ConfirmExitModal` | Meet compliance wording requirements. |
| `confirmHereModal` | `ConfirmHereModal` | Customize attendance confirmations for webinars. |
| `shareEventModal` | `ShareEventModal` | Add referral codes or QR sharing. |
| `recordingModal` | `RecordingModal` | Tailor recording confirmation flows. |
| `pollModal` | `PollModal` | Integrate your polling/quiz engine. |
| `backgroundModal` | `BackgroundModal` | Hook AI background replacement or brand presets. |
| `breakoutRoomsModal` | `BreakoutRoomsModal` | Implement drag-and-drop or AI room suggestions. |
| `configureWhiteboardModal` | `ConfigureWhiteboardModal` | Adjust collaboration permissions before launch. |
| `whiteboard` | `Whiteboard` | Replace with your whiteboard provider. |
| `screenboard` | `Screenboard` | Modify shared-screen annotation layers. |
| `screenboardModal` | `ScreenboardModal` | Reimagine how users enable shared annotations. |

#### Entry flows & custom renderers

| Key | Default component | Typical use |
| --- | --- | --- |
| `welcomePage` | `WelcomePage` | Provide a fully branded welcome/marketing splash. |
| `preJoinPage` | `PrejoinPage` | Override the wizard used before joining live sessions. |
| `customMenuButtonsRenderer` | `ControlButtonsAltComponent` | Supply a bespoke renderer for menu button groups without overriding each button. |

#### Function overrides

| Key | Default function | Typical use |
| --- | --- | --- |
| `consumerResume` | `consumerResume` | Wrap errors, capture analytics, or rate-limit consumer resume behavior. |
| `addVideosGrid` | `addVideosGrid` | Replace participant ordering or layout heuristics on the fly. |

> Function overrides support `{ implementation, wrap }`. Provide `implementation` for a full replacement, or `wrap` to intercept the default behavior before/after it runs.

### Example: swap the chat modal and theme the controls

```tsx
import { MediasfuGeneric } from "mediasfu-reactnative-expo";
import { MyChatModal } from "./ui/MyChatModal";
import { MyControls } from "./ui/MyControls";

const uiOverrides = {
  messagesModal: {
    component: MyChatModal,
  },
  controlButtons: {
    render: (props) => <MyControls {...props} variant="glass" />,
  },
};

export const MyMeeting = () => (
  <MediasfuGeneric credentials={credentials} uiOverrides={uiOverrides} />
);
```

### Example: wrap a MediaSFU helper instead of replacing it

```tsx
const uiOverrides = {
  consumerResume: {
    wrap: (original) => async (params) => {
      const startedAt = performance.now();
      const result = await original(params);
      analytics.track("consumer_resume", {
        durationMs: performance.now() - startedAt,
        consumerId: params?.consumer?.id,
      });
      return result;
    },
  },
};

<MediasfuConference uiOverrides={uiOverrides} />;
```

The same override hooks power the newly refreshed `MediasfuWebinar` and `MediasfuChat` layouts, so you can guarantee a unified experience across events, webinars, or chat-first rooms.

---

MediaSFU offers a cutting-edge streaming experience that empowers users to customize their recordings and engage their audience with high-quality streams. Whether you're a content creator, educator, or business professional, MediaSFU provides the tools you need to elevate your streaming game.

<div style="text-align: center;">

<img src="https://mediasfu.com/images/header_1.jpg" alt="Preview Page" title="Preview Page" style="max-height: 600px;">

</div>

---

# MediaSFU React Native (Expo) Module Documentation

## 🚀 Quick Access to New Features

### Media Device & Stream Utilities

The SDK now includes powerful utility methods for advanced media control:

**`getMediaDevicesList`** - Enumerate available cameras and microphones with automatic permission handling:
```javascript
const cameras = await parameters.getMediaDevicesList('videoinput');
const microphones = await parameters.getMediaDevicesList('audioinput');
```

**`getParticipantMedia`** - Retrieve specific participant's video or audio stream from the session:
```javascript
import { getParticipantMedia } from 'mediasfu-reactnative-expo';

const videoStream = getParticipantMedia({
  participantId: 'producer-123',
  mediaType: 'video',
  parameters: sourceParameters,
});
```

These utilities enable advanced features like custom device selection interfaces, participant stream monitoring, and dynamic media routing. [See full documentation](#media-device-and-stream-utility-methods).

---

## Unlock the Power of MediaSFU Community Edition  

**MediaSFU Community Edition is free and open-source**—perfect for developers who want to run their own media server without upfront costs. With robust features and simple setup, you can launch your media solution in minutes. **Ready to scale?** Upgrade seamlessly to **MediaSFU Cloud** for enterprise-grade performance and global scalability.  

**[Get started now on GitHub!](https://github.com/MediaSFU/MediaSFUOpen)**

### ✅ React Native SDK Setup Guide

[![Watch the React Native SDK Setup Guide](http://i.ytimg.com/vi/uJkI7H26jq4/hqdefault.jpg)](https://www.youtube.com/watch?v=uJkI7H26jq4)  
🎥 [**Watch the React Native SDK Setup Guide**](https://youtu.be/uJkI7H26jq4)

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Basic Usage Guide](#basic-usage-guide)
- [Custom Components Guide](#custom-components-guide)
- [Intermediate Usage Guide](#intermediate-usage-guide)
- [Advanced Usage Guide](#advanced-usage-guide)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

# Features <a name="features"></a>

MediaSFU's React Native (Expo) SDK comes with a host of powerful features out of the box:

1. **Breakout Rooms**: Create multiple sub-meetings within a single session to enhance collaboration and focus.
2. **Pagination**: Efficiently handle large participant lists with seamless pagination.
3. **Polls**: Conduct real-time polls to gather instant feedback from participants.
4. **Media Access Requests Management**: Manage media access requests with ease to ensure smooth operations.
5. **Video Effects**: Apply various video effects, including virtual backgrounds, to enhance the visual experience.
6. **Chat (Direct & Group)**: Facilitate communication with direct and group chat options.
7. **Cloud Recording (track-based)**: Customize recordings with track-based options, including watermarks, name tags, background colors, and more.
8. **Managed Events**: Manage events with features to handle abandoned and inactive participants, as well as enforce time and capacity limits.
9. **AI Phone Agents**: Integrate AI-powered phone agents for automated customer interactions at a fraction of the cost of traditional providers.
10. **`getMediaDevicesList`**: Enumerate available cameras and microphones with permission handling
11. **`getParticipantMedia`**: Retrieve specific participant's video or audio streams by ID or name

## 🆕 **New Advanced Media Access**

**Interested in getting just the media stream of a specific participant?** You can now easily retrieve individual participant streams using `getParticipantMedia()` method. [Learn more →](#media-device-and-stream-utility-methods)

**Need to access available cameras and microphones?** Use `getMediaDevicesList()` to enumerate all available media devices on the user's system programmatically with automatic permission handling.


# Getting Started <a name="getting-started"></a>

This section will guide users through the initial setup and installation of the npm module.

> **Note:**  this is specifically for **React-Native-Expo.**
If you are integrating into a **React Native CLI** app, the best option is to use the core `mediasfu-reactnative` package, which you can find on npm at [mediasfu-reactnative](https://www.npmjs.com/package/mediasfu-reactnative).

### Documentation Reference

For comprehensive documentation on the available methods, components, and functions, please visit [mediasfu.com](https://www.mediasfu.com/reactnativeexpo/). This resource provides detailed information for this guide and additional documentation.

## Installation

Instructions on how to install the module using npm.

### 1. Add the Package to Your Project

To install the `mediasfu-reactnative-expo` package, run:

```bash
npm install mediasfu-reactnative-expo
```

### **1.1 Important Installation Notes for React Native**

#### 🚫 **Avoid Using `--force` or `--legacy-peer-deps`**

Using these flags can override important dependency checks, potentially causing **unstable builds** or **unexpected behavior**.

- **Why Avoid Them?**  
  They bypass compatibility checks, which can introduce **bugs** or **conflicts** within your project.

---

#### ⚙️ **Use Package Overrides (Recommended)**  
If you encounter **peer dependency conflicts**, use the `overrides` field in your `package.json` instead of forcing installations.

##### ✅ **Example of Safe Overrides:**

```json
{
  "overrides": {
    "some-package": {
      "dependency-name": "^1.2.3"
    }
  }
}
```

- **Why This Works:**  
  Overrides let you resolve conflicts **safely** without compromising the integrity of your project.

---

#### 🚩 **If You Absolutely Need to Use `--force` or `--legacy-peer-deps`**

- Some peer dependencies **might be skipped**.  
- You’ll need to **manually install** them to avoid runtime errors.

##### 🔑 **Install the Required Peer Dependencies:**

```bash
npm install \
"@config-plugins/react-native-webrtc@^9.0.0" \
"@expo/metro-runtime@^4.0.0" \
"@expo/vector-icons@^14.0.2" \
"@react-native-async-storage/async-storage@^1.23.1" \
"@react-native-community/slider@^4.5.2" \
"@react-native-picker/picker@^2.7.5" \
"expo@^52.0.11" \
"expo-av@~15.0.1" \
"expo-camera@~16.0.9" \
"expo-clipboard@~7.0.0" \
"expo-dev-client@~5.0.5" \
"expo-router@~4.0.11" \
"expo-web-browser@~13.0.3" \
"expo-screen-orientation@~8.0.1" \
"expo-splash-screen@~0.29.13" \
"expo-status-bar@~2.0.0" \
"mediasoup-client@^3.16.0" \
"react@18.3.1" \
"react-color@^2.19.3" \
"react-dom@18.3.1" \
"react-native@0.76.3" \
"react-native-gesture-handler@~2.20.2" \
"react-native-orientation-locker@^1.6.0" \
"react-native-picker-select@^9.0.0" \
"react-native-reanimated@~3.16.1" \
"react-native-safe-area-context@4.12.0" \
"react-native-web@~0.19.13" \
"react-native-webrtc@^118.0.0" \
"react-native-webrtc-web-shim@^1.0.7" \
"reanimated-color-picker@^2.4.2" \
"socket.io-client@^4.7.2"
```

- **Why This Is Important:**  
  These peer dependencies are critical for `mediasfu-reactjs` to function correctly within React Native.

---

#### 🔍 **How to Check for Peer Dependencies**

1. **Open your `package.json`.**
2. Look for the `peerDependencies` section:
   ```json
   "peerDependencies": {
     "@config-plugins/react-native-webrtc": "^9.0.0",
     "@expo/metro-runtime": "^4.0.0",
     "@expo/vector-icons": "^14.0.2",
     "@react-native-async-storage/async-storage": "^1.23.1",
     "@react-native-community/slider": "^4.5.2",
     "@react-native-picker/picker": "^2.7.5",
     "expo": "^52.0.11",
     "expo-av": "~15.0.1",
     "expo-camera": "~16.0.9",
     "expo-clipboard": "~7.0.0",
     "expo-dev-client": "~5.0.5",
     "expo-router": "~4.0.11",
     "expo-web-browser": "~13.0.3",
     "expo-screen-orientation": "~8.0.1",
     "expo-splash-screen": "~0.29.13",
     "expo-status-bar": "~2.0.0",
     "mediasoup-client": "^3.16.0",
     "react": "18.3.1",
     "react-color": "^2.19.3",
     "react-dom": "18.3.1",
     "react-native": "0.76.3",
     "react-native-gesture-handler": "~2.20.2",
     "react-native-orientation-locker": "^1.6.0",
     "react-native-picker-select": "^9.0.0",
     "react-native-reanimated": "~3.16.1",
     "react-native-safe-area-context": "4.12.0",
     "react-native-web": "~0.19.13",
     "react-native-webrtc": "^118.0.0",
     "react-native-webrtc-web-shim": "^1.0.7",
     "reanimated-color-picker": "^2.4.2",
     "socket.io-client": "^4.7.2"
   }
   ```

3. **Ensure all are installed.** If not, run the install command above.

---

#### ✅ **Final Recommendations**

- Always try to resolve conflicts using **overrides** first.
- Only use `--force` or `--legacy-peer-deps` as a **last resort**.

---

#### Resolving Dependency Issues

If you encounter an error related to `@config-plugins/react-native-webrtc@"^9.0.0"` during installation, you can resolve it by adding the following override to your `package.json`:

```json
"overrides": {
  "@config-plugins/react-native-webrtc": {
    "expo": "^52.0.11"
  }
}
```

> Ensure the version specified (`^52.0.11`) matches the Expo SDK version used in your project. You can replace it with the latest compatible version if needed.

### 2.1 Obtain an API Key (If Required) 
   You can get your API key by signing up or logging into your account at [mediasfu.com](https://www.mediasfu.com/).

  <div style="background-color:#f0f0f0; padding: 10px; border-radius: 5px;">
      <h4 style="color:#d9534f;">Important:</h4>
      <p style="font-size: 1.2em; color: black;">You must obtain an API key from <a href="https://www.mediasfu.com/">mediasfu.com</a> to use this package with MediaSFU Cloud. You do not need the API Key if self-hosting.</p>
    </div>

### 2.2 **Self-Hosting MediaSFU**  

If you plan to self-host MediaSFU or use it without MediaSFU Cloud services, you don't need an API key. You can access the open-source version of MediaSFU from the [MediaSFU Open Repository](https://github.com/MediaSFU/MediaSFUOpen).  

This setup allows full flexibility and customization while bypassing the need for cloud-dependent credentials.  

### 3. Configure Your Project

Before proceeding, ensure that your project is properly configured to work with `mediasfu-reactnative-expo`. Follow the steps below to set up the necessary configuration files.

#### a. Update `app.json`

Ensure that your `app.json` does not have the `output` field set to `'static'` in the web configuration. Remove or clear this field to prevent build issues.

```json
{
  "expo": {
    // ... other configurations
    "web": {
      // Remove or ensure the output field is not set to 'static'
      // "output": "static" // This line should be removed or cleared
    }
  }
}
```

#### b. Configure `babel.config.js`

Your `babel.config.js` should include the necessary presets and plugins for Expo and React Native Reanimated. Here is an example configuration:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-block-scoping'
    ],
  };
};
```

#### c. Configure `metro.config.js`

Ensure your `metro.config.js` file includes the correct settings for Metro bundler:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

module.exports = config;
```

### 4. Complete the Setup

After completing the above steps, you can proceed to set up and run your project.

- **Start the Development Server:**

  ```bash
  npx expo start
  ```

- **Create a Development Build:**

  Since `react-native-webrtc` does not run on Expo Go, you will need to create a development build to test WebRTC functionalities on an actual device. Follow the [Expo Development Builds documentation](https://docs.expo.dev/development/introduction/) for guidance on creating a development build.


# 📱 React Native Expo SDK Comprehensive Guide <a name="sdk-guide"></a>

This comprehensive guide provides clear, progressive learning paths from beginner to advanced usage. Each section builds upon the previous one with practical examples and detailed explanations tailored for React Native Expo development.

---

## Table of Contents - SDK Guide

- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [Understanding MediaSFU Architecture](#understanding-mediasfu-architecture)
  - [The Three-Layer Architecture](#the-three-layer-architecture)
  - [Event Room Types](#event-room-types)
  - [The Three Usage Modes](#the-three-usage-modes)
  - [Parameters Object: Your Control Center](#parameters-object-control-center)
- [Core Concepts & Components](#core-concepts--components)
  - [Display Components](#display-components)
  - [Control Components](#control-components)
  - [Modal Components](#modal-components)
  - [Media Cards](#media-cards)
  - [Working with Participants](#working-with-participants)
  - [Stream Management](#stream-management)
- [Working with Methods](#working-with-methods)
  - [Media Control Methods](#media-control-methods)
  - [Device Management Methods](#device-management-methods)
  - [Participant Management Methods](#participant-management-methods)
  - [Chat & Messaging Methods](#chat-messaging-methods)
  - [Recording Methods](#recording-methods)
  - [Polls & Survey Methods](#polls-survey-methods)
  - [Breakout Room Methods](#breakout-room-methods)
  - [Advanced WebRTC Methods](#advanced-webrtc-methods)
- [Customization & Styling](#customization-styling)
- [Deployment Patterns](#deployment-patterns)
- [Understanding Data Structures](#understanding-data-structures)
- [Complete Production Example](#complete-production-example)

---

## Quick Start (5 Minutes) <a name="quick-start-5-minutes"></a>

Get your first MediaSFU app running in just a few minutes with React Native Expo.

### Step 1: Install the Package

```bash
npm install mediasfu-reactnative-expo
```

### Step 2: Import and Use

```javascript
import React from 'react';
import { MediasfuGeneric } from 'mediasfu-reactnative-expo';

const App = () => {
  // Option 1: Use without credentials (for testing/development)
  return <MediasfuGeneric />;

  // Option 2: Use with MediaSFU Cloud credentials
  // const credentials = { apiUserName: 'your_username', apiKey: 'your_api_key' };
  // return <MediasfuGeneric credentials={credentials} />;
};

export default App;
```

### Step 3: Run Your App

```bash
npx expo start
```

**That's it!** You now have a fully functional video conferencing app with:

- ✅ Video and audio streaming
- ✅ Screen sharing  
- ✅ Chat messaging
- ✅ Participant management
- ✅ Recording capabilities
- ✅ Breakout rooms
- ✅ Polls
- ✅ Custom UI components support

---

## Understanding MediaSFU Architecture <a name="understanding-mediasfu-architecture"></a>

Before diving deeper, let's understand how MediaSFU is structured. This knowledge will help you make better decisions when building your application.

### The Three-Layer Architecture

```
┌─────────────────────────────────────────────┐
│   Your React Native Expo Application       │
│  (App.js, screens, navigation, logic)      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│       MediaSFU Components Layer             │
│  (MediasfuGeneric, MediasfuBroadcast, etc.) │
│       - Pre-built UI components              │
│       - Event handling                       │
│       - State management                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│       MediaSFU Core Methods Layer           │
│   (Stream control, room management,         │
│    WebRTC handling, socket communication)   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│       MediaSFU Backend Services             │
│ (MediaSFU Cloud or Community Edition)       │
└─────────────────────────────────────────────┘
```

**Understanding the layers:**

1. **Your Application Layer**: Where you build your app-specific features and navigation
2. **Components Layer**: Pre-built MediaSFU components that you can use or customize
3. **Core Methods Layer**: The engine that handles all real-time communication
4. **Backend Layer**: MediaSFU's servers that orchestrate the entire experience

### Event Room Types

MediaSFU provides 5 specialized room types, each optimized for specific use cases:

| Room Type | Best For | Key Features | Import |
|-----------|----------|--------------|--------|
| **MediasfuGeneric** | General purpose meetings | Flexible layout, all features enabled | `import { MediasfuGeneric } from 'mediasfu-reactnative-expo'` |
| **MediasfuBroadcast** | Live streaming events | Optimized for one-to-many communication | `import { MediasfuBroadcast } from 'mediasfu-reactnative-expo'` |
| **MediasfuWebinar** | Educational sessions | Presenter focus, Q&A features | `import { MediasfuWebinar } from 'mediasfu-reactnative-expo'` |
| **MediasfuConference** | Business meetings | Equal participant layout, collaboration tools | `import { MediasfuConference } from 'mediasfu-reactnative-expo'` |
| **MediasfuChat** | Interactive discussions | Chat-first interface, quick connections | `import { MediasfuChat } from 'mediasfu-reactnative-expo'` |

**Example: Choosing the right room type**

```javascript
import { 
  MediasfuGeneric,
  MediasfuWebinar, 
  MediasfuBroadcast, 
  MediasfuConference,
  MediasfuChat
} from 'mediasfu-reactnative-expo';

// For a webinar
<MediasfuWebinar credentials={credentials} />

// For a broadcast  
<MediasfuBroadcast credentials={credentials} />

// For a conference
<MediasfuConference credentials={credentials} />
```

### The Three Usage Modes

MediaSFU offers three progressive levels of customization. Understanding these modes is crucial for choosing the right approach for your project.

#### Mode 1: Default UI (Simplest) ⭐ Best for Beginners

Use MediaSFU's complete pre-built interface - perfect for rapid development.

```javascript
import React from 'react';
import { MediasfuGeneric } from 'mediasfu-reactnative-expo';

const App = () => {
  const credentials = { 
    apiUserName: 'your_username', 
    apiKey: 'your_api_key' 
  };
  
  return <MediasfuGeneric credentials={credentials} />;
};

export default App;
```

**When to use:**

- ✅ Prototyping or MVP development
- ✅ Need a production-ready UI quickly
- ✅ Standard video conferencing features are sufficient
- ✅ Want to minimize development time

**Advantages:**

- Zero UI development needed
- All features work out of the box
- Automatic responsive layouts
- Professional appearance

#### Mode 2: Custom UI with MediaSFU Backend (Most Flexible) ⭐ Best for Custom Brands

Build your own UI while using MediaSFU's powerful backend infrastructure.

```javascript
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MediasfuGeneric } from 'mediasfu-reactnative-expo';

const App = () => {
  const [sourceParameters, setSourceParameters] = useState(null);
  const credentials = { apiUserName: 'your_username', apiKey: 'your_api_key' };

  return (
    <View style={{ flex: 1 }}>
      <MediasfuGeneric 
        returnUI={false}
        sourceParameters={sourceParameters}
        updateSourceParameters={setSourceParameters}
        credentials={credentials}
        noUIPreJoinOptions={{ 
          action: 'create',
          userName: 'Your Name',
          capacity: 50,
          duration: 30,
          eventType: 'conference'
        }}
      />
      
      {/* Your completely custom UI */}
      {sourceParameters && (
        <View style={styles.customControls}>
          <TouchableOpacity 
            onPress={() => sourceParameters.clickVideo({ 
              parameters: sourceParameters 
            })}
            style={styles.controlButton}
          >
            <Text style={styles.buttonText}>
              {sourceParameters.videoAlreadyOn ? 'Stop Video' : 'Start Video'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => sourceParameters.clickAudio({ 
              parameters: sourceParameters 
            })}
            style={styles.controlButton}
          >
            <Text style={styles.buttonText}>
              {sourceParameters.audioAlreadyOn ? 'Mute' : 'Unmute'}
            </Text>
          </TouchableOpacity>

          {/* Display participant count */}
          <Text style={styles.participantCount}>
            {sourceParameters.participants.length} Participants
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  customControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
  },
  controlButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantCount: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  }
});

export default App;
```

**When to use:**

- ✅ Need complete control over UI/UX
- ✅ Building a custom branded experience
- ✅ Integrating into existing app design
- ✅ Want to position controls differently

**What you get:**

- Access to all MediaSFU methods via `sourceParameters`
- Full control over when and how to display UI
- Ability to create completely custom layouts
- Access to real-time room state and participant data

#### Mode 3: Component Replacement (Balanced) ⭐ Best for Partial Customization

Replace specific MediaSFU components while keeping the rest of the infrastructure.

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  MediasfuGeneric, 
  FlexibleVideo, 
  FlexibleGrid,
  AudioGrid
} from 'mediasfu-reactnative-expo';

// Your custom main screen component
function CustomMainScreen({ parameters }) {
  return (
    <View style={styles.container}>
      {/* Custom header */}
      <View style={styles.header}>
        <Text style={styles.roomName}>{parameters.roomName}</Text>
        <Text style={styles.participantCount}>
          {parameters.participants.length} participants
        </Text>
      </View>
      
      {/* Use MediaSFU's FlexibleVideo for main display */}
      <View style={styles.mainVideo}>
        <FlexibleVideo 
          customWidth={parameters.componentSizes.mainWidth}
          customHeight={parameters.componentSizes.mainHeight}
          parameters={parameters}
        />
      </View>
      
      {/* Use MediaSFU's FlexibleGrid for participants */}
      <View style={styles.participantGrid}>
        <FlexibleGrid 
          customWidth={parameters.componentSizes.otherWidth}
          customHeight={parameters.componentSizes.otherHeight}
          parameters={parameters}
        />
      </View>

      {/* Show audio-only participants */}
      <View style={styles.audioContainer}>
        <AudioGrid parameters={parameters} />
      </View>
    </View>
  );
}

const App = () => {
  const credentials = { apiUserName: 'your_username', apiKey: 'your_api_key' };
  
  return (
    <MediasfuGeneric 
      credentials={credentials}
      customComponent={CustomMainScreen}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#2d2d2d',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantCount: {
    color: '#4CAF50',
    fontSize: 14,
  },
  mainVideo: {
    flex: 3,
  },
  participantGrid: {
    flex: 2,
  },
  audioContainer: {
    height: 80,
  },
});

export default App;
```

**When to use:**

- ✅ Need custom main interface but want to keep MediaSFU's components
- ✅ Partial customization with minimal effort
- ✅ Want to maintain MediaSFU's functionality while customizing layout

### Parameters Object: Your Control Center <a name="parameters-object-control-center"></a>

The `sourceParameters` object is your gateway to all MediaSFU functionality. Think of it as the control panel for your entire real-time communication experience.

```javascript
// The sourceParameters object contains everything you need:

// Media Controls
sourceParameters.clickVideo(options)      // Toggle video on/off
sourceParameters.clickAudio(options)      // Toggle audio on/off
sourceParameters.clickScreenShare(options) // Toggle screen sharing

// Room State
sourceParameters.roomName                 // Current room name
sourceParameters.participants             // Array of all participants
sourceParameters.allVideoStreams          // All video streams
sourceParameters.allAudioStreams          // All audio streams

// UI State
sourceParameters.videoAlreadyOn           // Is video currently on?
sourceParameters.audioAlreadyOn           // Is audio currently on?
sourceParameters.screenAlreadyOn          // Is screen sharing active?

// And 200+ more properties and methods...
```

**Access patterns in different modes:**

```javascript
// Mode 1 (Default UI): Parameters are managed internally
// You don't need to access them directly

// Mode 2 (Custom UI): Access via sourceParameters
<MediasfuGeneric 
  returnUI={false}
  sourceParameters={sourceParameters}
  updateSourceParameters={setSourceParameters}
/>
// Then use:
sourceParameters?.clickVideo({ parameters: sourceParameters });

// Mode 3 (Component Replacement): Passed to your custom component
function CustomMainScreen({ parameters }) {
  // Use parameters directly
  parameters.clickVideo({ parameters });
}
```

---

## Core Concepts & Components <a name="core-concepts--components"></a>

Now that you understand the architecture, let's explore the building blocks that make up a MediaSFU application.

### Display Components <a name="display-components"></a>

These components handle the visual presentation of media streams and participants.

#### Primary Layout Components

**1. FlexibleVideo** - Main video display area

```javascript
import { FlexibleVideo } from 'mediasfu-reactnative-expo';

<FlexibleVideo 
  customWidth={Dimensions.get('window').width}
  customHeight={400}
  parameters={parameters}
/>
```

**Features:**
- Automatically handles main presenter or screen share
- Smooth transitions between different video sources
- Responsive sizing
- Aspect ratio preservation

**Use cases:**
- Main stage video in webinars
- Screen sharing display
- Featured speaker in conferences
- Primary content area

**2. FlexibleGrid** - Participant grid layout

```javascript
import { FlexibleGrid } from 'mediasfu-reactnative-expo';

<FlexibleGrid 
  customWidth={Dimensions.get('window').width}
  customHeight={600}
  parameters={parameters}
/>
```

**Features:**
- Intelligent grid sizing (2x2, 3x3, 4x4, etc.)
- Pagination for large participant lists
- Automatic reflow on orientation change
- Optimized for different screen sizes

**Use cases:**
- Conference room participant display
- Breakout room participant view
- Gallery view in meetings
- Multi-participant discussions

**3. AudioGrid** - Audio-only participants

```javascript
import { AudioGrid } from 'mediasfu-reactnative-expo';

<AudioGrid parameters={parameters} />
```

**Features:**
- Displays participants without video
- Audio level indicators
- Compact layout for efficiency
- Visual speaking indicators

**Use cases:**
- Phone-in participants
- Participants with video off
- Audio-only mode
- Bandwidth-constrained participants

#### Container Components

| Component | Purpose | Use Case | Example |
|-----------|---------|----------|---------|
| **MainContainerComponent** | Primary content wrapper | Wraps all main content areas | `<MainContainerComponent>...</MainContainerComponent>` |
| **MainAspectComponent** | Aspect ratio container | Maintains proper video proportions | Used internally by video components |
| **MainScreenComponent** | Screen layout manager | Organizes screen regions | Structures the main display area |
| **SubAspectComponent** | Secondary content container | For picture-in-picture, sidebars | Side panels, floating windows |
| **MainGridComponent** | Main grid organizer | Primary participant grid | Central participant display |
| **OtherGridComponent** | Secondary grid organizer | Overflow participants | Additional participant pages |

**Example: Building a custom layout with containers**

```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  FlexibleVideo,
  FlexibleGrid,
  AudioGrid,
  MainContainerComponent 
} from 'mediasfu-reactnative-expo';

function CustomLayoutExample({ parameters }) {
  return (
    <MainContainerComponent>
      <View style={styles.container}>
        {/* Main video area - 60% of screen */}
        <View style={styles.mainSection}>
          <FlexibleVideo 
            customWidth="100%"
            customHeight="100%"
            parameters={parameters}
          />
        </View>
        
        {/* Participant grid - 30% of screen */}
        <View style={styles.gridSection}>
          <FlexibleGrid 
            customWidth="100%"
            customHeight="100%"
            parameters={parameters}
          />
        </View>
        
        {/* Audio-only participants - 10% of screen */}
        <View style={styles.audioSection}>
          <AudioGrid parameters={parameters} />
        </View>
      </View>
    </MainContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  mainSection: {
    flex: 6,
    backgroundColor: '#000',
  },
  gridSection: {
    flex: 3,
    backgroundColor: '#1a1a1a',
  },
  audioSection: {
    flex: 1,
    backgroundColor: '#2d2d2d',
  },
});
```

### Control Components <a name="control-components"></a>

These components provide user interaction interfaces for controlling media and meeting features.

**1. ControlButtonsComponent** - Standard control bar

```javascript
import { ControlButtonsComponent } from 'mediasfu-reactnative-expo';

<ControlButtonsComponent 
  parameters={parameters}
  position="bottom" // or 'top', 'left', 'right'
/>
```

**Includes:**
- Microphone toggle
- Camera toggle
- Screen share button
- Participants list
- Chat button
- Settings
- End call button

**2. ControlButtonsAltComponent** - Alternative layout

```javascript
import { ControlButtonsAltComponent } from 'mediasfu-reactnative-expo';

<ControlButtonsAltComponent 
  parameters={parameters}
  // Different button arrangement or styling
/>
```

**Features:**
- Alternative button configurations
- Customizable layouts
- Different visual styles
- Recording controls

**3. ControlButtonsComponentTouch** - Touch-optimized floating controls

```javascript
import { ControlButtonsComponentTouch } from 'mediasfu-reactnative-expo';

<ControlButtonsComponentTouch 
  parameters={parameters}
/>
```

**Features:**
- Floating action buttons for mobile
- Touch-optimized sizing
- Easy thumb access
- Gesture-friendly design

**Example: Building custom control buttons**

```javascript
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

function CustomControls({ parameters }) {
  return (
    <View style={styles.controlBar}>
      {/* Video Control */}
      <TouchableOpacity
        style={[
          styles.button,
          parameters.videoAlreadyOn ? styles.activeButton : styles.inactiveButton
        ]}
        onPress={() => parameters.clickVideo({ parameters })}
      >
        <Icon 
          name={parameters.videoAlreadyOn ? 'video' : 'video-slash'} 
          size={24} 
          color="white"
        />
        <Text style={styles.buttonText}>Video</Text>
      </TouchableOpacity>

      {/* Audio Control */}
      <TouchableOpacity
        style={[
          styles.button,
          parameters.audioAlreadyOn ? styles.activeButton : styles.inactiveButton
        ]}
        onPress={() => parameters.clickAudio({ parameters })}
      >
        <Icon 
          name={parameters.audioAlreadyOn ? 'microphone' : 'microphone-slash'} 
          size={24} 
          color="white"
        />
        <Text style={styles.buttonText}>Mic</Text>
      </TouchableOpacity>

      {/* Screen Share */}
      <TouchableOpacity
        style={[
          styles.button,
          parameters.screenAlreadyOn ? styles.activeButton : styles.inactiveButton
        ]}
        onPress={() => parameters.clickScreenShare({ parameters })}
      >
        <Icon name="desktop" size={24} color="white" />
        <Text style={styles.buttonText}>Share</Text>
      </TouchableOpacity>

      {/* Participants */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => parameters.updateIsParticipantsModalVisible(true)}
      >
        <Icon name="users" size={24} color="white" />
        <Text style={styles.buttonText}>
          {parameters.participants.length}
        </Text>
      </TouchableOpacity>

      {/* Chat */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => parameters.updateIsMessagesModalVisible(true)}
      >
        <Icon name="comment" size={24} color="white" />
        <Text style={styles.buttonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    minWidth: 60,
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  inactiveButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomControls;
```

### Modal Components <a name="modal-components"></a>

MediaSFU includes pre-built modals for various features. These can be triggered programmatically or through UI interactions.

**Available Modals:**

| Modal | Purpose | Trigger Method | Example |
|-------|---------|----------------|---------|
| **ParticipantsModal** | Manage participants | `parameters.updateIsParticipantsModalVisible(true)` | View, mute, remove participants |
| **MessagesModal** | Chat interface | `parameters.updateIsMessagesModalVisible(true)` | Send/receive messages |
| **SettingsModal** | General settings | `parameters.updateIsSettingsModalVisible(true)` | Configure meeting settings |
| **DisplaySettingsModal** | Display options | `parameters.updateIsDisplaySettingsModalVisible(true)` | Layout, theme, display preferences |
| **RecordingModal** | Recording controls | `parameters.updateIsRecordingModalVisible(true)` | Start/stop/configure recording |
| **PollModal** | Conduct polls | `parameters.updateIsPollModalVisible(true)` | Create and manage polls |
| **BreakoutRoomsModal** | Manage breakout rooms | `parameters.updateIsBreakoutRoomsModalVisible(true)` | Create and assign breakout rooms |
| **CoHostModal** | Co-host management | `parameters.updateIsCoHostModalVisible(true)` | Manage co-hosts |
| **WaitingRoomModal** | Waiting room | `parameters.updateIsWaitingModalVisible(true)` | Admit/reject participants |
| **RequestsModal** | Handle requests | `parameters.updateIsRequestsModalVisible(true)` | Approve media requests |
| **ShareEventModal** | Share meeting | `parameters.updateIsShareEventModalVisible(true)` | Share meeting link |
| **ConfirmExitModal** | Exit confirmation | `parameters.updateIsConfirmExitModalVisible(true)` | Confirm leaving meeting |
| **ConfirmHereModal** | Presence confirmation | `parameters.updateIsConfirmHereModalVisible(true)` | Confirm still present |
| **MediaSettingsModal** | Media settings | `parameters.updateIsMediaSettingsModalVisible(true)` | Camera/mic settings |
| **MenuModal** | Main menu | `parameters.updateIsMenuModalVisible(true)` | Access all features |
| **LoadingModal** | Loading indicator | `parameters.updateIsLoadingModalVisible(true)` | Show loading state |
| **AlertComponent** | Alert messages | `parameters.showAlert({...})` | Display alerts |

**Example: Using modals programmatically**

```javascript
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MediasfuGeneric } from 'mediasfu-reactnative-expo';

function MyCustomInterface({ parameters }) {
  return (
    <View>
      {/* Button to show participants */}
      <TouchableOpacity 
        onPress={() => parameters.updateIsParticipantsModalVisible(true)}
      >
        <Text>View Participants ({parameters.participants.length})</Text>
      </TouchableOpacity>

      {/* Button to show chat */}
      <TouchableOpacity 
        onPress={() => parameters.updateIsMessagesModalVisible(true)}
      >
        <Text>Open Chat</Text>
      </TouchableOpacity>

      {/* Button to start recording */}
      <TouchableOpacity 
        onPress={() => parameters.updateIsRecordingModalVisible(true)}
      >
        <Text>Start Recording</Text>
      </TouchableOpacity>

      {/* Button to create poll */}
      <TouchableOpacity 
        onPress={() => parameters.updateIsPollModalVisible(true)}
      >
        <Text>Create Poll</Text>
      </TouchableOpacity>

      {/* Show custom alert */}
      <TouchableOpacity 
        onPress={() => parameters.showAlert({
          message: 'This is a custom alert!',
          type: 'success',
          duration: 3000
        })}
      >
        <Text>Show Alert</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Media Cards <a name="media-cards"></a>

Individual participant media display components.

**1. VideoCard** - Individual participant video

```javascript
import { VideoCard } from 'mediasfu-reactnative-expo';

<VideoCard 
  videoStream={participantStream}
  remoteProducerId="producer-id"
  eventType="conference"
  forceFullDisplay={false}
  participant={participantObject}
  backgroundColor="black"
  showControls={true}
  showInfo={true}
  name="John Doe"
  barColor="red"
  textColor="white"
  nameTagColor="blue"
  overlayPosition="topLeft"
  controlsPosition="topRight"
  infoPosition="topLeft"
  videoInfo={{}}
  parameters={parameters}
/>
```

**2. AudioCard** - Individual audio-only participant

```javascript
import { AudioCard } from 'mediasfu-reactnative-expo';

<AudioCard 
  name="Jane Smith"
  barColor="blue"
  textColor="white"
  customStyle={{}}
  controlsPosition="topLeft"
  infoPosition="topRight"
  roundedImage={true}
  imageSource="https://example.com/avatar.jpg"
  showControls={true}
  showWaveform={true}
  participant={participantObject}
  backgroundColor="rgba(0,0,0,0.5)"
  parameters={parameters}
/>
```

**3. MiniCard** - Compact participant display

```javascript
import { MiniCard } from 'mediasfu-reactnative-expo';

<MiniCard 
  participant={participantObject}
  showControls={false}
  showInfo={true}
  videoInfo={{}}
  roundedImage={true}
  backgroundColor="transparent"
  parameters={parameters}
/>
```

### Working with Participants <a name="working-with-participants"></a>

Understanding participant objects is crucial for custom UI development.

**Participant Object Structure:**

```javascript
{
  id: "unique-id",              // Unique identifier
  name: "John Doe",             // Display name
  muted: false,                 // Audio state
  videoOn: true,                // Video state
  audioID: "audio-producer-id", // Audio producer ID
  videoID: "video-producer-id", // Video producer ID
  islevel: "2",                 // Privilege level (2=host, 1=co-host, 0=participant)
  isBanned: false,              // Ban status
  isSuspended: false,           // Suspension status
  stream: [streamObject],       // Media streams
  // ...more properties
}
```

**Common Operations:**

```javascript
// Get all participants
const participants = parameters.participants;

// Filter video participants
const videoParticipants = participants.filter(p => p.videoOn);

// Filter audio-only participants
const audioOnlyParticipants = participants.filter(p => !p.videoOn && !p.muted);

// Find specific participant
const participant = participants.find(p => p.id === 'participant-id');

// Get participant count
const count = parameters.participantsCounter;

// Get current user info
const currentUser = {
  name: parameters.member,
  level: parameters.islevel,
  videoOn: parameters.videoAlreadyOn,
  audioOn: parameters.audioAlreadyOn,
};

// Check if user is host
const isHost = parameters.islevel === '2';

// Check if user is co-host
const isCoHost = parameters.islevel === '1';
```

### Stream Management <a name="stream-management"></a>

Working with media streams for advanced use cases.

**Stream Object Structure:**

```javascript
{
  producerId: "producer-123",    // Producer identifier
  stream: MediaStream,           // Actual media stream
  socket_: Socket,               // Associated socket
  name: "Participant Name",      // Participant name
  kind: "video",                 // 'video' or 'audio'
  videoID: "video-id",           // Video producer ID
  audioID: "audio-id",           // Audio producer ID
  // ...more properties
}
```

**Common Stream Operations:**

```javascript
// Get all video streams
const videoStreams = parameters.allVideoStreams;

// Get all audio streams
const audioStreams = parameters.allAudioStreams;

// Find stream by producer ID
const stream = videoStreams.find(s => s.producerId === 'producer-id');

// Get participant's video stream
function getParticipantVideoStream(participantId) {
  const participant = parameters.participants.find(p => p.id === participantId);
  if (!participant || !participant.videoID) return null;
  
  return parameters.allVideoStreams.find(
    s => s.producerId === participant.videoID
  );
}

// Get participant's audio stream
function getParticipantAudioStream(participantId) {
  const participant = parameters.participants.find(p => p.id === participantId);
  if (!participant || !participant.audioID) return null;
  
  return parameters.allAudioStreams.find(
    s => s.producerId === participant.audioID
  );
}

// Check if main screen is sharing
const isScreenSharing = parameters.screenAlreadyOn;

// Get screen share stream
const screenStream = parameters.screenAlreadyOn 
  ? parameters.screenProducerId 
  : null;
```

**Using the new utility methods:**

```javascript
import { getMediaDevicesList, getParticipantMedia } from 'mediasfu-reactnative-expo';

// Get specific participant's video stream by ID
const videoStream = getParticipantMedia({
  participantId: 'producer-123',
  mediaType: 'video',
  parameters: sourceParameters,
});

// Get specific participant's audio stream by name
const audioStream = getParticipantMedia({
  participantName: 'John Doe',
  mediaType: 'audio',
  parameters: sourceParameters,
});

// Enumerate available cameras
const cameras = await parameters.getMediaDevicesList('videoinput');
cameras.forEach(camera => {
  console.log(`Camera: ${camera.label} (${camera.deviceId})`);
});

// Enumerate available microphones
const microphones = await parameters.getMediaDevicesList('audioinput');
microphones.forEach(mic => {
  console.log(`Microphone: ${mic.label} (${mic.deviceId})`);
});
```

## Programmatically Fetching Tokens

If you prefer to fetch the required tokens programmatically without visiting MediaSFU's website, you can use the PreJoinPage component and pass your credentials as props:

```javascript
import { MediasfuGeneric, PreJoinPage } from 'mediasfu-reactnative-expo';

const App = () => {
  const credentials = { apiUserName: "yourAPIUserName", apiKey: "yourAPIKey" };

  return (
    <MediasfuGeneric PrejoinPage={PreJoinPage} credentials={credentials} />
  );
}

export default App;
```

<div style="text-align: center;">

### Preview of Welcome Page

<img src="https://mediasfu.com/images/prejoin.png" alt="Preview of Welcome Page" title="Welcome Page" style="max-height: 500px;">

<!-- Add a blank line for spacing -->
&nbsp;

### Preview of Prejoin Page

<img src="https://mediasfu.com/images/prejoin3.png" alt="Preview of Prejoin Page" title="Prejoin Page" style="max-height: 500px;">

</div>

## Custom Welcome/Prejoin Page

Alternatively, you can design your own welcome/prejoin page. The core function of this page is to fetch user tokens from MediaSFU's API and establish a connection with the returned link if valid.

### Parameters Passed to Custom Page

MediaSFU passes relevant parameters to the custom welcome/prejoin page:

```javascript
let { showAlert, updateIsLoadingModalVisible, connectSocket, updateSocket, updateValidated,
     updateApiUserName, updateApiToken, updateLink, updateRoomName, updateMember } = parameters;
```

Ensure that your custom page implements the following updates:

```javascript
updateSocket(socket);
updateApiUserName(apiUserName);
updateApiToken(apiToken);
updateLink(link);
updateRoomName(apiUserName);
updateMember(userName);
updateValidated(true);
```

See the following code for the PreJoinPage page logic:

```typescript
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Orientation from "react-native-orientation-locker";
import { Socket } from "socket.io-client";
import {
  ConnectSocketType,
  ShowAlert,
  ConnectLocalSocketType,
  ResponseLocalConnection,
  ResponseLocalConnectionData,
  RecordingParams,
  MeetingRoomParams,
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
} from "../../@types/types";
import RNPickerSelect from "react-native-picker-select";
import { checkLimitsAndMakeRequest } from "../../methods/utils/checkLimitsAndMakeRequest";
import { createRoomOnMediaSFU } from "../../methods/utils/createRoomOnMediaSFU";
import { CreateRoomOnMediaSFUType, JoinRoomOnMediaSFUType, joinRoomOnMediaSFU } from "../../methods/utils/joinRoomOnMediaSFU";

/**
 * Interface defining the parameters for joining a local event room.
 */
export interface JoinLocalEventRoomParameters {
  eventID: string;
  userName: string;
  secureCode?: string;
  videoPreference?: string | null;
  audioPreference?: string | null;
  audioOutputPreference?: string | null;
}

/**
 * Interface defining the options for joining a local event room.
 */
export interface JoinLocalEventRoomOptions {
  joinData: JoinLocalEventRoomParameters;
  link?: string;
}

/**
 * Interface defining the response structure when creating or joining a local room.
 */
export interface CreateLocalRoomParameters {
  eventID: string;
  duration: number;
  capacity: number;
  userName: string;
  scheduledDate: Date;
  secureCode: string;
  waitRoom?: boolean;
  recordingParams?: RecordingParams;
  eventRoomParams?: MeetingRoomParams;
  videoPreference?: string | null;
  audioPreference?: string | null;
  audioOutputPreference?: string | null;
  mediasfuURL?: string;
}

/**
 * Interface defining the response structure when joining a local room.
 */
export interface CreateLocalRoomOptions {
  createData: CreateLocalRoomParameters;
  link?: string;
}

/**
 * Interface defining the response structure when creating or joining a local room.
 */
export interface CreateJoinLocalRoomResponse {
  success: boolean;
  secret: string;
  reason?: string;
  url?: string;
}

/**
 * Interface defining the parameters for the PreJoinPage component.
 */
export interface PreJoinPageParameters {
  /**
   * Source URL for the logo image.
   * Defaults to 'https://mediasfu.com/images/logo192.png' if not provided.
   */
  imgSrc?: string;

  /**
   * Function to display alert messages.
   */
  showAlert?: ShowAlert;

  /**
   * Function to toggle the visibility of the loading modal.
   */
  updateIsLoadingModalVisible: (visible: boolean) => void;

  /**
   * Function to establish a socket connection.
   */
  connectSocket: ConnectSocketType;

  /**
   * Function to establish a socket connection to a local server.
   */
  connectLocalSocket?: ConnectLocalSocketType;

  /**
   * Function to update the socket instance in the parent state.
   */
  updateSocket: (socket: Socket) => void;

  /**
   * Function to update the socket instance in the parent state.
   */
  updateLocalSocket?: (socket: Socket) => void;

  /**
   * Function to update the validation state in the parent.
   */
  updateValidated: (validated: boolean) => void;

  /**
   * Function to update the API username in the parent state.
   */
  updateApiUserName: (apiUserName: string) => void;

  /**
   * Function to update the API token in the parent state.
   */
  updateApiToken: (apiToken: string) => void;

  /**
   * Function to update the event link in the parent state.
   */
  updateLink: (link: string) => void;

  /**
   * Function to update the room name in the parent state.
   */
  updateRoomName: (roomName: string) => void;

  /**
   * Function to update the member name in the parent state.
   */
  updateMember: (member: string) => void;
}

/**
 * Interface defining the credentials.
 */
export interface Credentials {
  apiUserName: string;
  apiKey: string;
}

/**
 * Interface defining the options for the PreJoinPage component.
 */
export interface PreJoinPageOptions {
  /**
   * link to the local server (Community Edition)
   */
  localLink?: string;

  /**
   * Determines if the user is allowed to connect to the MediaSFU server.
   */
  connectMediaSFU?: boolean;

  /**
   * Parameters required by the PreJoinPage component.
   */
  parameters: PreJoinPageParameters;

  /**
   * Optional user credentials. Defaults to predefined credentials if not provided.
   */
  credentials?: Credentials;

  /**
   * Flag to determine if the component should return the UI.
   */
  returnUI?: boolean;

  /**
   * Options for creating/joining a room without UI.
   */
  noUIPreJoinOptions?: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;

  /**
   * Function to create a room on MediaSFU.
   */
  createMediaSFURoom?: CreateRoomOnMediaSFUType;

  /**
   * Function to join a room on MediaSFU.
   */
  joinMediaSFURoom?: JoinRoomOnMediaSFUType;
}

export type PreJoinPageType = (options: PreJoinPageOptions) => JSX.Element;

/**
 * PreJoinPage component allows users to either create a new room or join an existing one.
 *
 * @component
 * @param {PreJoinPageOptions} props - The properties for the PreJoinPage component.
 * @param {PreJoinPageParameters} props.parameters - Various parameters required for the component.
 * @param {ShowAlert} [props.parameters.showAlert] - Function to show alert messages.
 * @param {() => void} props.parameters.updateIsLoadingModalVisible - Function to update the loading modal visibility.
 * @param {ConnectSocketType} props.parameters.connectSocket - Function to connect to the socket.
 * @param {ConnectSocketType} props.parameters.connectLocalSocket - Function to connect to the local socket.
 * @param {Socket} props.parameters.updateSocket - Function to update the socket.
 * @param {Socket} props.parameters.updateLocalSocket - Function to update the local socket.
 * @param {() => void} props.parameters.updateValidated - Function to update the validation status.
 * @param {string} [props.parameters.imgSrc] - The source URL for the logo image.
 * @param {Credentials} [props.credentials=user_credentials] - The user credentials containing the API username and API key.
 * @param {boolean} [props.returnUI=false] - Flag to determine if the component should return the UI.
 * @param {CreateMediaSFURoomOptions | JoinMediaSFURoomOptions} [props.noUIPreJoinOptions] - The options for creating/joining a room without UI.
 * @param {string} [props.localLink=""] - The link to the local server.
 * @param {boolean} [props.connectMediaSFU=true] - Flag to determine if the component should connect to MediaSFU.
 * @param {CreateRoomOnMediaSFUType} [props.createMediaSFURoom] - Function to create a room on MediaSFU.
 * @param {JoinRoomOnMediaSFUType} [props.joinMediaSFURoom] - Function to join a room on MediaSFU.
 *
 * @returns {JSX.Element} The rendered PreJoinPage component.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { PreJoinPage } from 'mediasfu-reactnative-expo';
 * import { JoinLocalRoomOptions } from 'mediasfu-reactnative-expo';
 *
 * function App() {
 *  *   const showAlertFunction = (message: string) => console.log(message);
 *   const updateLoadingFunction = (visible: boolean) => console.log(`Loading: ${visible}`);
 *   const connectSocketFunction = () => {}; // Connect socket function
 *   const updateSocketFunction = (socket: Socket) => {}; // Update socket function
 *   const updateValidatedFunction = (validated: boolean) => {}; // Update validated function
 *   const updateApiUserNameFunction = (userName: string) => {}; // Update API username function
 *   const updateApiTokenFunction = (token: string) => {}; // Update API token function
 *   const updateLinkFunction = (link: string) => {}; // Update link function
 *   const updateRoomNameFunction = (roomName: string) => {}; // Update room name function
 *   const updateMemberFunction = (member: string) => {}; // Update member function
 *
 *   return (
 *     <PreJoinPage
 *       parameters={{
 *         showAlert: showAlertFunction,
 *         updateIsLoadingModalVisible: updateLoadingFunction,
 *         connectSocket: connectSocketFunction,
 *         updateSocket: updateSocketFunction,
 *         updateValidated: updateValidatedFunction,
 *         updateApiUserName: updateApiUserNameFunction,
 *         updateApiToken: updateApiTokenFunction,
 *         updateLink: updateLinkFunction,
 *         updateRoomName: updateRoomNameFunction,
 *         updateMember: updateMemberFunction,
 *         imgSrc: "https://example.com/logo.png"
 *       }}
 *       credentials={{
 *         apiUserName: "user123",
 *         apiKey: "apikey123"
 *       }}
 *      returnUI={true} 
 *      noUIPreJoinOptions={{
 *      action: "create",
 *      capacity: 10,
 *      duration: 15,
 *      eventType: "broadcast",
 *      userName: "Prince",
 *      }}
 *      connectMediaSFU={true}
 *      localLink="http://localhost:3000"
 *     />
 *   );
 * };
 *
 *
 * export default App;
 * ```
 */

const PreJoinPage: React.FC<PreJoinPageOptions> = ({
  localLink = "",
  connectMediaSFU = true,
  parameters,
  credentials,
  returnUI = false,
  noUIPreJoinOptions,
  createMediaSFURoom = createRoomOnMediaSFU,
  joinMediaSFURoom = joinRoomOnMediaSFU,
}) => {
  // State variables
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [eventType, setEventType] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");
  const [eventID, setEventID] = useState<string>("");
  const [error, setError] = useState<string>("");
  const pending = useRef(false);

  const localConnected = useRef(false);
  const localData = useRef<ResponseLocalConnectionData | undefined>(undefined);
  const initSocket = useRef<Socket | undefined>(undefined);

  const {
    showAlert,
    updateIsLoadingModalVisible,
    connectLocalSocket,
    updateSocket,
    updateValidated,
    updateApiUserName,
    updateApiToken,
    updateLink,
    updateRoomName,
    updateMember,
  } = parameters;

  const handleCreateRoom = async () => {
    if (pending.current) {
      return;
    }
    pending.current = true;
    let payload = {} as CreateMediaSFURoomOptions;
    if (returnUI) {
      if (!name || !duration || !eventType || !capacity) {
        setError("Please fill all the fields.");
        return;
      }
      payload = {
        action: "create",
        duration: parseInt(duration),
        capacity: parseInt(capacity),
        eventType: eventType as "chat" | "broadcast" | "webinar" | "conference",
        userName: name,
        recordOnly: false,
      };
    } else {
      if (
        noUIPreJoinOptions &&
        "action" in noUIPreJoinOptions &&
        noUIPreJoinOptions.action === "create"
      ) {
        payload = noUIPreJoinOptions as CreateMediaSFURoomOptions;
      } else {
        pending.current = false;
        throw new Error(
          "Invalid options provided for creating a room without UI."
        );
      }
    }

    updateIsLoadingModalVisible(true);

    if (localLink.length > 0) {
      const secureCode =
        Math.random().toString(30).substring(2, 14) +
        Math.random().toString(30).substring(2, 14);
      let eventID =
        new Date().getTime().toString(30) +
        new Date().getUTCMilliseconds() +
        Math.floor(10 + Math.random() * 99).toString();
      eventID = "m" + eventID;
      const eventRoomParams = localData.current?.meetingRoomParams_;
      eventRoomParams!.type = eventType as
        | "chat"
        | "broadcast"
        | "webinar"
        | "conference";

      const createData: CreateLocalRoomParameters = {
        eventID: eventID,
        duration: parseInt(duration),
        capacity: parseInt(capacity),
        userName: payload.userName,
        scheduledDate: new Date(),
        secureCode: secureCode,
        waitRoom: false,
        recordingParams: localData.current?.recordingParams_,
        eventRoomParams: eventRoomParams,
        videoPreference: null,
        audioPreference: null,
        audioOutputPreference: null,
        mediasfuURL: "",
      };

      // socket in main window is required and for no local room, no use of initSocket
      // for local room, initSocket becomes the local socket, and localSocket is the connection to MediaSFU (if connectMediaSFU is true)
      // else localSocket is the same as initSocket

      if (
        connectMediaSFU &&
        initSocket.current &&
        localData.current &&
        localData.current.apiUserName &&
        localData.current.apiKey
      ) {
        payload.recordOnly = true; // allow production to mediasfu only; no consumption
        const response = await roomCreator({
          payload,
          apiUserName: localData.current.apiUserName,
          apiKey: localData.current.apiKey,
          validate: false,
        });
        if (
          response &&
          response.success &&
          response.data &&
          "roomName" in response.data
        ) {
          createData.eventID = response.data.roomName;
          createData.secureCode = response.data.secureCode || "";
          createData.mediasfuURL = response.data.publicURL;
          await createLocalRoom({
            createData: createData,
            link: response.data.link,
          });
        } else {
          pending.current = false;
          updateIsLoadingModalVisible(false);
          setError(`Unable to create room on MediaSFU.`);
          try {
            updateSocket(initSocket.current);
            await createLocalRoom({ createData: createData });
            pending.current = false;
          } catch (error) {
            pending.current = false;
            updateIsLoadingModalVisible(false);
            setError(`Unable to create room. ${error}`);
          }
        }
      } else {
        try {
          updateSocket(initSocket.current!);
          await createLocalRoom({ createData: createData });
          pending.current = false;
        } catch (error) {
          pending.current = false;
          updateIsLoadingModalVisible(false);
          setError(`Unable to create room. ${error}`);
        }
      }
    } else {
      await roomCreator({
        payload,
        apiUserName: credentials.apiUserName,
        apiKey: credentials.apiKey,
        validate: true,
      });
      pending.current = false;
    }
  };

  const handleJoinRoom = async () => {
    if (pending.current) {
      return;
    }
    pending.current = true;
    let payload = {} as JoinMediaSFURoomOptions;
    if (returnUI) {
      if (!name || !eventID) {
        setError("Please fill all the fields.");
        return;
      }

      payload = {
        action: "join",
        meetingID: eventID,
        userName: name,
      };
    } else {
      if (
        noUIPreJoinOptions &&
        "action" in noUIPreJoinOptions &&
        noUIPreJoinOptions.action === "join"
      ) {
        payload = noUIPreJoinOptions as JoinMediaSFURoomOptions;
      } else {
        throw new Error(
          "Invalid options provided for joining a room without UI."
        );
      }
    }

    if (localLink.length > 0 && !localLink.includes("mediasfu.com")) {
      const joinData: JoinLocalEventRoomParameters = {
        eventID: eventID,
        userName: payload.userName,
        secureCode: "",
        videoPreference: null,
        audioPreference: null,
        audioOutputPreference: null,
      };

      await joinLocalRoom({ joinData: joinData });
      pending.current = false;
      return;
    }

    updateIsLoadingModalVisible(true);

    const response = await joinMediaSFURoom({
      payload,
      apiUserName: credentials.apiUserName,
      apiKey: credentials.apiKey,
      localLink: localLink,
    });
    if (response.success && response.data && "roomName" in response.data) {
      await checkLimitsAndMakeRequest({
        apiUserName: response.data.roomName,
        apiToken: response.data.secret,
        link: response.data.link,
        userName: payload.userName,
        parameters: parameters,
      });
      setError("");
      pending.current = false;
    } else {
      pending.current = false;
      updateIsLoadingModalVisible(false);
      setError(
        `Unable to join room. ${
          response.data
            ? "error" in response.data
              ? response.data.error
              : ""
            : ""
        }`
      );
    }
  };

  const joinLocalRoom = async ({
    joinData,
    link = localLink,
  }: JoinLocalEventRoomOptions) => {
    initSocket.current?.emit(
      "joinEventRoom",
      joinData,
      (response: CreateJoinLocalRoomResponse) => {
        if (response.success) {
          updateSocket(initSocket.current!);
          updateApiUserName(localData.current?.apiUserName || "");
          updateApiToken(response.secret);
          updateLink(link);
          updateRoomName(joinData.eventID);
          updateMember(joinData.userName);
          updateIsLoadingModalVisible(false);
          updateValidated(true);
        } else {
          updateIsLoadingModalVisible(false);
          setError(`Unable to join room. ${response.reason}`);
        }
      }
    );
  };

  const createLocalRoom = async ({
    createData,
    link = localLink,
  }: CreateLocalRoomOptions) => {
    initSocket.current?.emit(
      "createRoom",
      createData,
      (response: CreateJoinLocalRoomResponse) => {
        if (response.success) {
          updateSocket(initSocket.current!);
          updateApiUserName(localData.current?.apiUserName || "");
          updateApiToken(response.secret);
          updateLink(link);
          updateRoomName(createData.eventID);
          // local needs islevel updated from here
          // we update member as `userName` + "_2" and split it in the room
          updateMember(createData.userName + "_2");
          updateIsLoadingModalVisible(false);
          updateValidated(true);
        } else {
          updateIsLoadingModalVisible(false);
          setError(`Unable to create room. ${response.reason}`);
        }
      }
    );
  };

  const roomCreator = async ({
    payload,
    apiUserName,
    apiKey,
    validate = true,
  }: {
    payload: any;
    apiUserName: string;
    apiKey: string;
    validate?: boolean;
  }) => {
    const response = await createMediaSFURoom({
      payload,
      apiUserName: apiUserName,
      apiKey: apiKey,
      localLink: localLink,
    });
    if (response.success && response.data && "roomName" in response.data) {
      await checkLimitsAndMakeRequest({
        apiUserName: response.data.roomName,
        apiToken: response.data.secret,
        link: response!.data.link,
        userName: payload.userName,
        parameters: parameters,
        validate: validate,
      });
      return response;
    } else {
      updateIsLoadingModalVisible(false);
      setError(
        `Unable to create room. ${
          response.data
            ? "error" in response.data
              ? response.data.error
              : ""
            : ""
        }`
      );
    }
  };

  const checkProceed = async ({
    returnUI,
    noUIPreJoinOptions,
  }: {
    returnUI: boolean;
    noUIPreJoinOptions: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;
  }) => {
    if (!returnUI && noUIPreJoinOptions) {
      if (
        "action" in noUIPreJoinOptions &&
        noUIPreJoinOptions.action === "create"
      ) {
        // update all the required parameters and call
        const createOptions: CreateMediaSFURoomOptions =
          noUIPreJoinOptions as CreateMediaSFURoomOptions;
        if (
          !createOptions.userName ||
          !createOptions.duration ||
          !createOptions.eventType ||
          !createOptions.capacity
        ) {
          throw new Error(
            "Please provide all the required parameters: userName, duration, eventType, capacity"
          );
        }

        await handleCreateRoom();
      } else if (
        "action" in noUIPreJoinOptions &&
        noUIPreJoinOptions.action === "join"
      ) {
        // update all the required parameters and call
        const joinOptions: JoinMediaSFURoomOptions =
          noUIPreJoinOptions as JoinMediaSFURoomOptions;
        if (!joinOptions.userName || !joinOptions.meetingID) {
          throw new Error(
            "Please provide all the required parameters: userName, meetingID"
          );
        }

        await handleJoinRoom();
      } else {
        throw new Error(
          "Invalid options provided for creating/joining a room without UI."
        );
      }
    }
  };

  useEffect(() => {
    if (
      localLink.length > 0 &&
      !localConnected.current &&
      !initSocket.current
    ) {
      try {
        connectLocalSocket?.({ link: localLink })
          .then((response: ResponseLocalConnection | undefined) => {
            localData.current = response!.data;
            initSocket.current = response!.socket;
            localConnected.current = true;

            if (!returnUI && noUIPreJoinOptions) {
              checkProceed({ returnUI, noUIPreJoinOptions });
            }
          })
          .catch((error) => {
            showAlert?.({
              message: `Unable to connect to ${localLink}. ${error}`,
              type: "danger",
              duration: 3000,
            });
          });
      } catch {
        showAlert?.({
          message: `Unable to connect to ${localLink}. Something went wrong.`,
          type: "danger",
          duration: 3000,
        });
      }
    } else if (localLink.length === 0 && !initSocket.current) {
      if (!returnUI && noUIPreJoinOptions) {
        checkProceed({ returnUI, noUIPreJoinOptions });
      }
    }
  }, []);

  const handleToggleMode = () => {
    setIsCreateMode(!isCreateMode);
    setError("");
  };

  /**
   * Locks the orientation to portrait mode when the component mounts and unlocks on unmount.
   */
  useEffect(() => {
    Orientation.lockToPortrait();

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  if (!returnUI) {
    return <></>;
  }

  return (
    // your element
   )
};

export default PreJoinPage;

  ```

### IP Blockage Warning And Local UI Development

 **Note:** Local UI Development Mode is deprecated. Rather use your own Community Edition (CE) server for UI development and testing. You can later switch to MediaSFU Cloud for production. Nothing changes in the codebase, and you can use the same code for both environments.

Entering the event room without the correct credentials may result in IP blockage, as the page automatically attempts to connect with MediaSFU servers, which rate limit bad requests based on IP address.

If users attempt to enter the event room without valid credentials or tokens, it may lead to IP blockage due to MediaSFU servers' rate limiting mechanism. To avoid unintentional connections to MediaSFU servers during UI development, users can pass the `useLocalUIMode` parameter as `true`.

In this mode, the module will operate locally without making requests to MediaSFU servers. However, to render certain UI elements such as messages, participants, requests, etc., users may need to provide seed data. They can achieve this by importing random data generators and passing the generated data to the event room component.

### Example for Broadcast Room

```typescript

import React from 'react';
import { MediasfuBroadcast } from 'mediasfu-reactnative-expo';
// assume all missing imports are available in 'mediasfu-reactnative-expo'

/**
 * App Component
 *
 * This component demonstrates how to:
 * - Configure credentials for MediaSFU Cloud and/or Community Edition (CE).
 * - Use MediaSFU with or without a custom server.
 * - Integrate a pre-join page.
 * - Return no UI and manage state through sourceParameters, allowing a fully custom frontend.
 *
 * Basic instructions:
 * 1. Set `localLink` to your CE server if you have one, or leave it blank to use MediaSFU Cloud.
 * 2. Set `connectMediaSFU` to determine whether you're connecting to MediaSFU Cloud services.
 * 3. Provide credentials if using MediaSFU Cloud (dummy credentials are acceptable in certain scenarios).
 * 4. If you prefer a custom UI, set `returnUI` to false and handle all interactions via `sourceParameters` and `updateSourceParameters`.
 * 5. For secure production usage, consider using custom `createMediaSFURoom` and `joinMediaSFURoom` functions to forward requests through your backend.
 */

const App = () => {
  // =========================================================
  //                API CREDENTIALS CONFIGURATION
  // =========================================================
  //
  // Scenario A: Not using MediaSFU Cloud at all.
  // - No credentials needed. Just set localLink to your CE server.
  // Example:
  /*
  const credentials = {};
  const localLink = 'http://your-ce-server.com'; // http://localhost:3000 for local testing
  const connectMediaSFU = localLink.trim() !== '';
  */

  // Scenario B: Using MediaSFU CE + MediaSFU Cloud for Egress only.
  // - Use dummy credentials (8 chars for userName, 64 chars for apiKey).
  // - Your CE backend will forward requests with your real credentials.
  /*
  const credentials = {
    apiUserName: 'dummyUsr',
    apiKey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  };
  const localLink = 'http://your-ce-server.com'; // http://localhost:3000 for local testing
  const connectMediaSFU = localLink.trim() !== '';
  */

  // Scenario C: Using MediaSFU Cloud without your own server.
  // - For development, use your actual or dummy credentials.
  // - In production, securely handle credentials server-side and use custom room functions.
  const credentials = {
    apiUserName: 'yourDevUser', // 8 chars recommended for dummy
    apiKey: 'yourDevApiKey1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // 64 chars
  };
  const localLink = ''; // Leave empty if not using your own server
  const connectMediaSFU = true; // Set to true if using MediaSFU Cloud since localLink is empty

  // =========================================================
  //                    UI RENDERING OPTIONS
  // =========================================================
  //
  // If you want a fully custom UI (e.g., a custom layout inspired by WhatsApp):
  // 1. Set `returnUI = false` to prevent the default MediaSFU UI from rendering.
  // 2. Provide `noUIPreJoinOptions` to simulate what would have been entered on a pre-join page.
  // 3. Use `sourceParameters` and `updateSourceParameters` to access and update state/actions.
  // 4. No need for any of the above if you're using the default MediaSFU UI.
  //
  // Example noUIPreJoinOptions:
  const noUIPreJoinOptions: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions = {
    action: 'create',
    capacity: 10,
    duration: 15,
    eventType: 'broadcast',
    userName: 'Prince',
  };

  // Example for joining a room:
  // const noUIPreJoinOptions: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions = {
  //   action: 'join',
  //   userName: 'Prince',
  //   meetingID: 'yourMeetingID'
  // };

  const [sourceParameters, setSourceParameters] = useState<{ [key: string]: any }>({});
  const updateSourceParameters = (data: { [key: string]: any }) => {
    setSourceParameters(data);
  };

  // =========================================================
  //                CUSTOM ROOM FUNCTIONS (OPTIONAL)
  // =========================================================
  //
  // To securely forward requests to MediaSFU:
  // - Implement custom `createMediaSFURoom` and `joinMediaSFURoom` functions.
  // - These functions send requests to your server, which then communicates with MediaSFU Cloud.
  //
  // Already imported `createRoomOnMediaSFU` and `joinRoomOnMediaSFU` are examples.
  //
  // If using MediaSFU CE backend, ensure your server endpoints:
  // - Validate dummy credentials.
  // - Forward requests to mediasfu.com with real credentials.

  // =========================================================
  //              DEPRECATED FEATURES (SEED DATA)
  // =========================================================
  //
  // Deprecated Feature: useLocalUIMode
  // This feature is deprecated due to updates for strong typing.
  // It is no longer required and should not be used in new implementations.
  //
  // Uncomment and configure the following section if you intend to use seed data
  // for generating random participants and messages.
  //
  // Note: This is deprecated and maintained only for legacy purposes.
  /*
  const useSeed = false;
  let seedData = {};

  if (useSeed) {
    const memberName = 'Prince';
    const hostName = 'Fred';

    const participants_ = generateRandomParticipants({
      member: memberName,
      coHost: '',
      host: hostName,
      forChatBroadcast: eventType === 'broadcast' || eventType === 'chat',
    });

    const messages_ = generateRandomMessages({
      participants: participants_,
      member: memberName,
      host: hostName,
      forChatBroadcast: eventType === 'broadcast' || eventType === 'chat',
    });

    const requests_ = generateRandomRequestList({
      participants: participants_,
      hostName: memberName,
      coHostName: '',
      numberOfRequests: 3,
    });

    const waitingList_ = generateRandomWaitingRoomList();

    seedData = {
      participants: participants_,
      messages: messages_,
      requests: requests_,
      waitingList: waitingList_,
      member: memberName,
      host: hostName,
      eventType: eventType,
    };
  }
  */

  // =========================================================
  //              CHOOSE A USE CASE / COMPONENT
  // =========================================================
  //
  // Multiple components are available depending on your event type:
  // MediasfuBroadcast, MediasfuChat, MediasfuWebinar, MediasfuConference
  //
  // By default, we'll use MediasfuBroadcast with custom settings.

  /**
   * **MediasfuBroadcast Component**
   *
   * Uncomment to use the broadcast event type.
   */
  /*
  return (
    <MediasfuBroadcast
      credentials={credentials}
      localLink={localLink}
      connectMediaSFU={connectMediaSFU}
      // seedData={useSeed ? seedData : {}}
    />
  );
  */

  // =========================================================
  //                    RENDER COMPONENT
  // =========================================================
  //
  // The MediasfuBroadcast component is used by default.
  // You can replace it with any other component based on your event type.
  // Example: <MediasfuBroadcast ... />
  //
  // The PreJoinPage component is displayed if `returnUI` is true.
  // If `returnUI` is false, `noUIPreJoinOptions` is used as a substitute.
  // You can also use `sourceParameters` to interact with MediaSFU functionalities directly.
  // Avoid using `useLocalUIMode` or `useSeed` in new implementations.
  // Ensure that real credentials are not exposed in the frontend.
  // Use HTTPS and secure backend endpoints for production.

  return (
    <MediasfuBroadcast
      // This pre-join page can be displayed if `returnUI` is true.
      // If `returnUI` is false, `noUIPreJoinOptions` is used as a substitute.
      PrejoinPage={PreJoinPage}
      credentials={credentials}
      localLink={localLink}
      connectMediaSFU={connectMediaSFU}
      returnUI={false}
      noUIPreJoinOptions={noUIPreJoinOptions}
      sourceParameters={sourceParameters}
      updateSourceParameters={updateSourceParameters}
      createMediaSFURoom={createRoomOnMediaSFU}
      joinMediaSFURoom={joinRoomOnMediaSFU}
    />
  );
};

export default App;
```

### Example for Generic View

```typescript
// Import specific Mediasfu view components
// Import the PreJoinPage component for the Pre-Join Page use case
import { MediasfuGeneric,
    MediasfuBroadcast, MediasfuChat, MediasfuWebinar, MediasfuConference, PreJoinPage
 } from 'mediasfu-reactnative-expo'


// Import methods for generating random participants, messages, requests, and waiting room lists if using seed data
import { generateRandomParticipants, generateRandomMessages, generateRandomRequestList, generateRandomWaitingRoomList,
} from 'mediasfu-reactnative-expo';


/**
 * App Component
 *
 * This component demonstrates how to:
 * - Configure credentials for MediaSFU Cloud and/or Community Edition (CE).
 * - Use MediaSFU with or without a custom server.
 * - Integrate a pre-join page.
 * - Return no UI and manage state through sourceParameters, allowing a fully custom frontend.
 *
 * Basic instructions:
 * 1. Set `localLink` to your CE server if you have one, or leave it blank to use MediaSFU Cloud.
 * 2. Set `connectMediaSFU` to determine whether you're connecting to MediaSFU Cloud services.
 * 3. Provide credentials if using MediaSFU Cloud (dummy credentials are acceptable in certain scenarios).
 * 4. If you prefer a custom UI, set `returnUI` to false and handle all interactions via `sourceParameters` and `updateSourceParameters`.
 * 5. For secure production usage, consider using custom `createMediaSFURoom` and `joinMediaSFURoom` functions to forward requests through your backend.
 */

const App = () => {
  // =========================================================
  //                API CREDENTIALS CONFIGURATION
  // =========================================================
  //
  // Scenario A: Not using MediaSFU Cloud at all.
  // - No credentials needed. Just set localLink to your CE server.
  // Example:
  /*
  const credentials = {};
  const localLink = 'http://your-ce-server.com'; //http://localhost:3000
  const connectMediaSFU = localLink.trim() !== '';
  */

  // Scenario B: Using MediaSFU CE + MediaSFU Cloud for Egress only.
  // - Use dummy credentials (8 chars for userName, 64 chars for apiKey).
  // - Your CE backend will forward requests with your real credentials.
  /*
  const credentials = {
    apiUserName: 'dummyUsr',
    apiKey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  };
  const localLink = 'http://your-ce-server.com'; //http://localhost:3000
  const connectMediaSFU = localLink.trim() !== '';
  */

  // Scenario C: Using MediaSFU Cloud without your own server.
  // - For development, use your actual or dummy credentials.
  // - In production, securely handle credentials server-side and use custom room functions.
  const credentials = {
    apiUserName: 'yourDevUser', // 8 chars recommended for dummy
    apiKey: 'yourDevApiKey1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // 64 chars
  };
  const localLink = ''; // Leave empty if not using your own server
  const connectMediaSFU = true; // Set to true if using MediaSFU Cloud since localLink is empty

  // =========================================================
  //                    UI RENDERING OPTIONS
  // =========================================================
  //
  // If you want a fully custom UI (e.g., a custom layout inspired by WhatsApp):
  // 1. Set `returnUI = false` to prevent the default MediaSFU UI from rendering.
  // 2. Provide `noUIPreJoinOptions` to simulate what would have been entered on a pre-join page.
  // 3. Use `sourceParameters` and `updateSourceParameters` to access and update state/actions.
  // 4. No need for any of the above if you're using the default MediaSFU UI.
  //
  // Example noUIPreJoinOptions:
  const noUIPreJoinOptions: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions = {
    action: 'create',
    capacity: 10,
    duration: 15,
    eventType: 'broadcast',
    userName: 'Prince',
  };

  // Example for joining a room:
  // const noUIPreJoinOptions: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions = {
  //   action: 'join',
  //   userName: 'Prince',
  //   meetingID: 'yourMeetingID'
  // };

  const returnUI = true; // Set to false for custom UI, true for default MediaSFU UI

  const [sourceParameters, setSourceParameters] = useState<{ [key: string]: any }>({});
  const updateSourceParameters = (data: { [key: string]: any }) => {
    setSourceParameters(data);
  };

  // =========================================================
  //                CUSTOM ROOM FUNCTIONS (OPTIONAL)
  // =========================================================
  //
  // To securely forward requests to MediaSFU:
  // - Implement custom `createMediaSFURoom` and `joinMediaSFURoom` functions.
  // - These functions send requests to your server, which then communicates with MediaSFU Cloud.
  //
  // Already imported `createRoomOnMediaSFU` and `joinRoomOnMediaSFU` are examples.
  //
  // If using MediaSFU CE backend, ensure your server endpoints:
  // - Validate dummy credentials.
  // - Forward requests to mediasfu.com with real credentials.

  // =========================================================
  //              CHOOSE A USE CASE / COMPONENT
  // =========================================================
  //
  // Multiple components are available depending on your event type:
  // MediasfuBroadcast, MediasfuChat, MediasfuWebinar, MediasfuConference
  //
  // By default, we'll use MediasfuGeneric with custom settings.



  // =========================================================
  //                    RENDER COMPONENT
  // =========================================================
  //
  // The MediasfuGeneric component is used by default.
  // You can replace it with any other component based on your event type.
  // Example: <MediasfuBroadcast ... />
  // Example: <MediasfuChat ... />
  // Example: <MediasfuWebinar ... />
  // Example: <MediasfuConference ... />
  //
  // The PreJoinPage component is displayed if `returnUI` is true.
  // If `returnUI` is false, `noUIPreJoinOptions` is used as a substitute.
  // You can also use `sourceParameters` to interact with MediaSFU functionalities directly.
  // Avoid using `useLocalUIMode` or `useSeed` in new implementations.
  // Ensure that real credentials are not exposed in the frontend.
  // Use HTTPS and secure backend endpoints for production.

  // Example of MediaSFU CE with no MediaSFU Cloud
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     localLink={localLink}
  //     />
  // );

  // Example of MediaSFU CE + MediaSFU Cloud for Egress only
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     credentials={credentials}
  //     localLink={localLink}
  //     connectMediaSFU={connectMediaSFU}
  //     />
  // );

  // Example of MediaSFU Cloud only
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     credentials={credentials}
  //     connectMediaSFU={connectMediaSFU}
  //     />
  // );

  // Example of MediaSFU CE + MediaSFU Cloud for Egress only with custom UI
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     credentials={credentials}
  //     localLink={localLink}
  //     connectMediaSFU={connectMediaSFU}
  //     returnUI={false}
  //     noUIPreJoinOptions={noUIPreJoinOptions}
  //     sourceParameters={sourceParameters}
  //     updateSourceParameters={updateSourceParameters}
  //     createMediaSFURoom={createRoomOnMediaSFU}
  //     joinMediaSFURoom={joinRoomOnMediaSFU}
  //   />

  // Example of MediaSFU Cloud only with custom UI
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     credentials={credentials}
  //     connectMediaSFU={connectMediaSFU}
  //     returnUI={false}
  //     noUIPreJoinOptions={noUIPreJoinOptions}
  //     sourceParameters={sourceParameters}
  //     updateSourceParameters={updateSourceParameters}
  //     createMediaSFURoom={createRoomOnMediaSFU}
  //     joinMediaSFURoom={joinRoomOnMediaSFU}
  //   />

  // Example of using MediaSFU CE only with custom UI
  // return (
  //   <MediasfuGeneric
  //     PrejoinPage={PreJoinPage}
  //     localLink={localLink}
  //     connectMediaSFU={false}
  //     returnUI={false}
  //     noUIPreJoinOptions={noUIPreJoinOptions}
  //     sourceParameters={sourceParameters}
  //     updateSourceParameters={updateSourceParameters}
  //   />


  return (
    <MediasfuGeneric
      // This pre-join page can be displayed if `returnUI` is true.
      // If `returnUI` is false, `noUIPreJoinOptions` is used as a substitute.
      PrejoinPage={PreJoinPage}
      credentials={credentials}
      localLink={localLink}
      connectMediaSFU={connectMediaSFU}
      returnUI={returnUI}
      noUIPreJoinOptions={!returnUI ? noUIPreJoinOptions : undefined}
      sourceParameters={!returnUI ? sourceParameters : undefined}
      updateSourceParameters={!returnUI ? updateSourceParameters : undefined}
      createMediaSFURoom={createRoomOnMediaSFU} // no need to specify if not using custom functions
      joinMediaSFURoom={joinRoomOnMediaSFU} // no need to specify if not using custom functions
    />
  );
};

export default App;

/**
 * =========================================================
 *                     ADDITIONAL NOTES
 * =========================================================
 *
 * Handling Core Methods:
 * Once `sourceParameters` is populated, you can call core methods like `clickVideo` or `clickAudio` directly:
 * Example:
 * sourceParameters.clickVideo({ ...sourceParameters });
 * sourceParameters.clickAudio({ ...sourceParameters });
 *
 * This allows your custom UI to directly interact with MediaSFU functionalities.
 *
 * Deprecated Features (Seed Data):
 * The seed data generation feature is deprecated. Avoid using `useLocalUIMode` or `useSeed` in new implementations.
 *
 * Security Considerations:
 * - Do not expose real credentials in your frontend code in production.
 * - Use HTTPS and secure backend endpoints.
 * - Validate inputs and handle errors gracefully.
 *
 * Example CE Backend Setup:
 * If using MediaSFU CE + MediaSFU Cloud, your backend might look like this:
 *
 * app.post("/createRoom", async (req, res) => {
 *   // Validate incoming dummy credentials
 *   // Forward request to mediasfu.com with real credentials
 * });
 *
 * app.post("/joinRoom", async (req, res) => {
 *   // Validate incoming dummy credentials
 *   // Forward request to mediasfu.com with real credentials
 * });
 *
 * By doing so, you keep real credentials secure on your server.
 *
 * End of Guide.
 */



/**
 * =======================
 * ====== EXTRA NOTES ======
 * =======================
 *
 * ### Handling Core Methods
 * With `sourceParameters`, you can access core methods such as `clickVideo` and `clickAudio`:
 *
 * ```typescript
 * sourceParameters.clickVideo({ ...sourceParameters });
 * sourceParameters.clickAudio({ ...sourceParameters });
 * ```
 *
 * This allows your custom UI to interact with MediaSFU's functionalities seamlessly.
 *
 * ### Seed Data (Deprecated)
 * The seed data functionality is deprecated and maintained only for legacy purposes.
 * It is recommended to avoid using it in new implementations.
 *
 * ### Security Considerations
 * - **Protect API Credentials:** Ensure that API credentials are not exposed in the frontend. Use environment variables and secure backend services to handle sensitive information.
 * - **Use HTTPS:** Always use HTTPS to secure data transmission between the client and server.
 * - **Validate Inputs:** Implement proper validation and error handling on both client and server sides to prevent malicious inputs.
 *
 * ### Custom Backend Example for MediaSFU CE
 * Below is an example of how to set up custom backend endpoints for creating and joining rooms using MediaSFU CE:
 *
 * ```javascript
 * // Endpoint for `createRoom`
 * app.post("/createRoom", async (req, res) => {
 *   try {
 *     const payload = req.body;
 *     const [apiUserName, apiKey] = req.headers.authorization
 *       .replace("Bearer ", "")
 *       .split(":");
 *
 *     // Verify temporary credentials
 *     if (!apiUserName || !apiKey || !verifyCredentials(apiUserName, apiKey)) {
 *       return res.status(401).json({ error: "Invalid or expired credentials" });
 *     }
 *
 *     const response = await fetch("https://mediasfu.com/v1/rooms/", {
 *       method: "POST",
 *       headers: {
 *         "Content-Type": "application/json",
 *         Authorization: `Bearer ${actualApiUserName}:${actualApiKey}`,
 *       },
 *       body: JSON.stringify(payload),
 *     });
 *
 *     const result = await response.json();
 *     res.status(response.status).json(result);
 *   } catch (error) {
 *     console.error("Error creating room:", error);
 *     res.status(500).json({ error: "Internal server error" });
 *   }
 * });
 *
 * // Endpoint for `joinRoom`
 * app.post("/joinRoom", async (req, res) => {
 *   try {
 *     const payload = req.body;
 *     const [apiUserName, apiKey] = req.headers.authorization
 *       .replace("Bearer ", "")
 *       .split(":");
 *
 *     // Verify temporary credentials
 *     if (!apiUserName || !apiKey || !verifyCredentials(apiUserName, apiKey)) {
 *       return res.status(401).json({ error: "Invalid or expired credentials" });
 *     }
 *
 *     const response = await fetch("https://mediasfu.com/v1/rooms", {
 *       method: "POST",
 *       headers: {
 *         "Content-Type": "application/json",
 *         Authorization: `Bearer ${actualApiUserName}:${actualApiKey}`,
 *       },
 *       body: JSON.stringify(payload),
 *     });
 *
 *     const result = await response.json();
 *     res.status(response.status).json(result);
 *   } catch (error) {
 *     console.error("Error joining room:", error);
 *     res.status(500).json({ error: "Internal server error" });
 *   }
 * });
 * ```
 *
 * ### Custom Room Function Implementation
 * Below are examples of how to implement custom functions for creating and joining rooms securely:
 *
 * ```typescript
 * import { CreateJoinRoomError, CreateJoinRoomResponse, CreateJoinRoomType, CreateMediaSFURoomOptions, JoinMediaSFURoomOptions } from '../../@types/types';
 *
 *
 * Async function to create a room on MediaSFU.
 *
 * @param {object} options - The options for creating a room.
 * @param {CreateMediaSFURoomOptions} options.payload - The payload for the API request.
 * @param {string} options.apiUserName - The API username.
 * @param {string} options.apiKey - The API key.
 * @param {string} options.localLink - The local link.
 * @returns {Promise<{ data: CreateJoinRoomResponse | CreateJoinRoomError | null; success: boolean; }>} The response from the API.
 * export const createRoomOnMediaSFU: CreateJoinRoomType = async ({
 *     payload,
 *     apiUserName,
 *     apiKey,
 *     localLink = '',
 * }) => {
 *     try {
 *         let finalLink = 'https://mediasfu.com/v1/rooms/';
 *
 *         // Update finalLink if using a local server
 *         if (localLink) {
 *             finalLink = `${localLink}/createRoom`;
 *         }
 *
 *         const response = await fetch(finalLink, {
 *             method: 'POST',
 *             headers: {
 *                 'Content-Type': 'application/json',
 *                 Authorization: `Bearer ${apiUserName}:${apiKey}`,
 *             },
 *             body: JSON.stringify(payload),
 *         });
 *
 *         if (!response.ok) {
 *             throw new Error(`HTTP error! Status: ${response.status}`);
 *         }
 *
 *         const data: CreateJoinRoomResponse = await response.json();
 *         return { data, success: true };
 *     } catch (error) {
 *         const errorMessage = (error as Error).message || 'unknown error';
 *         return {
 *             data: { error: `Unable to create room, ${errorMessage}` },
 *             success: false,
 *         };
 *     }
 * };
 *
*
*  Async function to join a room on MediaSFU.
*
*  @param {object} options - The options for joining a room.
*  @param {JoinMediaSFURoomOptions} options.payload - The payload for the API request.
*  @param {string} options.apiUserName - The API username.
*  @param {string} options.apiKey - The API key.
*  @param {string} options.localLink - The local link.
*  @returns {Promise<{ data: CreateJoinRoomResponse | CreateJoinRoomError | null; success: boolean; }>} The response from the API.
*
* export const joinRoomOnMediaSFU: JoinRoomOnMediaSFUType = async ({
*     payload,
*     apiUserName,
*     apiKey,
*     localLink = '',
* }) => {
*     try {
*         let finalLink = 'https://mediasfu.com/v1/rooms/join';
*
*         // Update finalLink if using a local server
*         if (localLink) {
*             finalLink = `${localLink}/joinRoom`;
*         }
*
*         const response = await fetch(finalLink, {
*             method: 'POST',
*             headers: {
*                 'Content-Type': 'application/json',
*                 Authorization: `Bearer ${apiUserName}:${apiKey}`,
*             },
*             body: JSON.stringify(payload),
*         });
*
*         if (!response.ok) {
*             throw new Error(`HTTP error! Status: ${response.status}`);
*         }
*
*         const data: CreateJoinRoomResponse = await response.json();
*         return { data, success: true };
*     } catch (error) {
*         const errorMessage = (error as Error).message || 'unknown error';
*         return {
*             data: { error: `Unable to join room, ${errorMessage}` },
*             success: false,
*         };
*     }
* };
* ```
*
* ### Example Usage of Core Methods
* Core methods like `clickVideo` and `clickAudio` can now be accessed through `sourceParameters`:
*
* ```typescript
* // Example of toggling video
* sourceParameters.clickVideo({ ...sourceParameters });
*
* // Example of toggling audio
* sourceParameters.clickAudio({ ...sourceParameters });
* ```
*
* These methods allow your custom UI to interact with MediaSFU's functionalities seamlessly.
*
* ========================
* ====== END OF GUIDE ======
* ========================
*/
```

In the provided examples, users can set `useLocalUIMode` to `true` during UI development to prevent unwanted connections to MediaSFU servers. Additionally, they can generate seed data for rendering UI components locally by using random data generators provided by the module.

### Local UI Development in MediaSFU React Native (Expo) Module

 **Note:** Local UI Development Mode is deprecated. Rather use your own Community Edition (CE) server for UI development and testing. You can later switch to MediaSFU Cloud for production. Nothing changes in the codebase, and you can use the same code for both environments.

During local UI development, the MediaSFU view is designed to be responsive to changes in screen size and orientation, adapting its layout accordingly. However, since UI changes are typically linked to communication with servers, developing the UI locally might result in less responsiveness due to the lack of real-time data updates. To mitigate this, users can force trigger changes in the UI by rotating the device, resizing the window, or simulating server responses by clicking on buttons within the page.

While developing locally, users may encounter occasional error warnings as the UI attempts to communicate with the server. These warnings can be safely ignored, as they are simply indicative of unsuccessful server requests in the local development environment.

# Custom Components Guide <a name="custom-components-guide"></a>

MediaSFU provides powerful customization capabilities allowing you to replace the default UI components with your own custom React Native components. This gives you complete control over the appearance and behavior of video cards, audio cards, and mini cards.

## Overview

The MediaSFU React Native SDK supports three types of custom components:

1. **CustomVideoCard**: Replace the default video participant cards
2. **CustomAudioCard**: Replace the default audio-only participant cards  
3. **CustomMiniCard**: Replace the default mini cards (used in certain layouts)

## Custom Component Types

```typescript
import { 
  CustomVideoCardType, 
  CustomAudioCardType, 
  CustomMiniCardType 
} from 'mediasfu-reactnative-expo';
```

## Implementation Example

Here's how to implement and use custom components in your MediaSFU application:

### 1. Create Custom Components

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomVideoCardType, CustomAudioCardType, CustomMiniCardType } from 'mediasfu-reactnative-expo';

// Custom Video Card Component
const CustomVideoCard: CustomVideoCardType = ({ 
  children, 
  participant, 
  backgroundColor = '#2c2c2e',
  showControls = true,
  showInfo = true,
  videoInfo,
  style,
  ...props 
}) => {
  return (
    <View style={[styles.customVideoCard, { backgroundColor }, style]} {...props}>
      {/* Custom header with participant info */}
      {showInfo && (
        <View style={styles.customHeader}>
          <Text style={styles.participantName}>
            {participant?.name || 'Unknown'}
          </Text>
          {participant?.muted && (
            <View style={styles.mutedIndicator}>
              <Text style={styles.mutedText}>🔇</Text>
            </View>
          )}
        </View>
      )}
      
      {/* Video content */}
      <View style={styles.videoContent}>
        {children}
      </View>
      
      {/* Custom footer with additional info */}
      {showControls && (
        <View style={styles.customFooter}>
          <Text style={styles.videoInfo}>
            {videoInfo || `${participant?.id || 'N/A'}`}
          </Text>
        </View>
      )}
    </View>
  );
};

// Custom Audio Card Component
const CustomAudioCard: CustomAudioCardType = ({ 
  children, 
  participant,
  backgroundColor = '#1c1c1e',
  showWaveform = true,
  style,
  ...props 
}) => {
  const isSpeaking = participant?.isSpeaking || false;
  
  return (
    <View 
      style={[
        styles.customAudioCard, 
        { backgroundColor }, 
        isSpeaking && styles.speakingBorder,
        style
      ]} 
      {...props}
    >
      {/* Avatar section */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, isSpeaking && styles.speakingAvatar]}>
          <Text style={styles.avatarText}>
            {participant?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      </View>
      
      {/* Participant info */}
      <View style={styles.audioInfo}>
        <Text style={styles.audioParticipantName}>
          {participant?.name || 'Unknown'}
        </Text>
        
        {/* Speaking indicator */}
        {showWaveform && (
          <View style={styles.waveformContainer}>
            <Text style={styles.speakingStatus}>
              {isSpeaking ? '🎤 Speaking' : '🔇 Muted'}
            </Text>
          </View>
        )}
      </View>
      
      {/* Audio controls/content */}
      <View style={styles.audioContent}>
        {children}
      </View>
    </View>
  );
};

// Custom Mini Card Component
const CustomMiniCard: CustomMiniCardType = ({ 
  children, 
  participant,
  backgroundColor = '#3a3a3c',
  showInfo = true,
  style,
  ...props 
}) => {
  return (
    <View style={[styles.customMiniCard, { backgroundColor }, style]} {...props}>
      {/* Mini avatar */}
      <View style={styles.miniAvatar}>
        <Text style={styles.miniAvatarText}>
          {participant?.name?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>
      
      {/* Mini content */}
      <View style={styles.miniContent}>
        {children}
      </View>
      
      {/* Status indicators */}
      {showInfo && (
        <View style={styles.miniStatus}>
          {participant?.muted && (
            <Text style={styles.miniStatusIcon}>🔇</Text>
          )}
          {participant?.videoOn && (
            <Text style={styles.miniStatusIcon}>📹</Text>
          )}
        </View>
      )}
    </View>
  );
};

// Styles for custom components
const styles = StyleSheet.create({
  // Video Card Styles
  customVideoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  participantName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mutedIndicator: {
    backgroundColor: 'rgba(255,0,0,0.8)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mutedText: {
    fontSize: 12,
  },
  videoContent: {
    flex: 1,
  },
  customFooter: {
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoInfo: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
  
  // Audio Card Styles
  customAudioCard: {
    borderRadius: 16,
    padding: 12,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  speakingBorder: {
    borderColor: '#4CAF50',
  },
  avatarSection: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakingAvatar: {
    backgroundColor: '#4CAF50',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  audioInfo: {
    flex: 1,
  },
  audioParticipantName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  waveformContainer: {
    marginTop: 4,
  },
  speakingStatus: {
    color: '#4CAF50',
    fontSize: 12,
  },
  audioContent: {
    marginLeft: 8,
  },
  
  // Mini Card Styles
  customMiniCard: {
    borderRadius: 8,
    padding: 6,
    margin: 2,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  miniAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  miniContent: {
    flex: 1,
  },
  miniStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStatusIcon: {
    fontSize: 10,
    marginLeft: 2,
  },
});
```

### 2. Use Custom Components in MediaSFU

```typescript
import React from 'react';
import { MediasfuGeneric } from 'mediasfu-reactnative-expo';

const App = () => {
  // Your MediaSFU configuration
  const credentials = { /* your credentials */ };
  
  return (
    <MediasfuGeneric
      credentials={credentials}
      // Pass your custom components
      customVideoCard={CustomVideoCard}
      customAudioCard={CustomAudioCard}
      customMiniCard={CustomMiniCard}
      // Other props...
    />
  );
};

export default App;
```

### 3. Advanced Customization

You can also conditionally use custom components based on participant data or application state:

```typescript
// Conditional custom component
const ConditionalCustomVideoCard: CustomVideoCardType = (props) => {
  const { participant } = props;
  
  // Use different styling for hosts vs participants
  if (participant?.isHost) {
    return <HostVideoCard {...props} />;
  }
  
  return <CustomVideoCard {...props} />;
};

// Usage
<MediasfuGeneric
  customVideoCard={ConditionalCustomVideoCard}
  // ... other props
/>
```

## Component Props

### CustomVideoCardType Props

- `children`: React nodes - The video content
- `participant`: Participant object with participant data
- `backgroundColor`: Optional background color
- `showControls`: Boolean to show/hide controls
- `showInfo`: Boolean to show/hide participant info
- `videoInfo`: Optional additional video information
- `style`: Optional custom styles
- `...props`: Any additional React Native View props

### CustomAudioCardType Props

- `children`: React nodes - The audio content
- `participant`: Participant object with participant data
- `backgroundColor`: Optional background color
- `showWaveform`: Boolean to show/hide waveform indicator
- `style`: Optional custom styles
- `...props`: Any additional React Native View props

### CustomMiniCardType Props

- `children`: React nodes - The mini card content
- `participant`: Participant object with participant data
- `backgroundColor`: Optional background color
- `showInfo`: Boolean to show/hide participant info
- `style`: Optional custom styles
- `...props`: Any additional React Native View props

## Best Practices

1. **Performance**: Keep custom components lightweight to ensure smooth rendering
2. **Accessibility**: Include proper accessibility labels and hints
3. **Responsive Design**: Use flexible layouts that work across different screen sizes
4. **Consistent Styling**: Maintain consistent design patterns across your custom components
5. **Error Handling**: Handle cases where participant data might be undefined

## Complete Example

For a complete working example with custom components, check the following files in this repository:

- `example-custom-components.tsx` - Standalone examples of custom component implementations
- `App.tsx` - Complete app implementation with custom components integration  
- `AppGeneric.tsx` - Generic app example with custom components

These files demonstrate full implementations of custom video, audio, and mini cards with various styling options and interactive features.

---

## Working with Methods <a name="working-with-methods"></a>

MediaSFU provides 200+ methods for controlling every aspect of your real-time communication experience. This section covers the most commonly used methods organized by category.

### Media Control Methods <a name="media-control-methods"></a>

Control audio, video, and screen sharing for participants.

#### Video Control

**Toggle Video On/Off**

```javascript
// Turn video on or off
parameters.clickVideo({
  parameters: parameters
});

// Check current video state
const isVideoOn = parameters.videoAlreadyOn;
```

**Switch Camera (Front/Back)**

```javascript
// Switch between front and back camera
parameters.switchVideoAlt({
  parameters: parameters
});
```

**Switch to Specific Camera**

```javascript
import { getMediaDevicesList } from 'mediasfu-reactnative-expo';

// Get available cameras
const cameras = await parameters.getMediaDevicesList('videoinput');
console.log('Available cameras:', cameras);

// Switch to specific camera
parameters.switchUserVideo({
  videoPreference: cameras[1].deviceId,  // Use specific camera
  parameters: parameters
});
```

#### Audio Control

**Toggle Audio On/Off**

```javascript
// Mute or unmute microphone
parameters.clickAudio({
  parameters: parameters
});

// Check current audio state
const isAudioOn = parameters.audioAlreadyOn;
const hasHostPermission = parameters.micAction; // Host approval required?
```

**Switch Microphone**

```javascript
import { getMediaDevicesList } from 'mediasfu-reactnative-expo';

// Get available microphones
const microphones = await parameters.getMediaDevicesList('audioinput');
console.log('Available microphones:', microphones);

// Switch to specific microphone
parameters.switchUserAudio({
  audioPreference: microphones[1].deviceId,
  parameters: parameters
});
```

**Mute Specific Participant (Host Only)**

```javascript
// Mute a specific participant
parameters.muteParticipant({
  participantId: 'participant-id',
  mute: true,  // true to mute, false to request unmute
  parameters: parameters
});
```

#### Screen Sharing

**Start/Stop Screen Sharing**

```javascript
// Toggle screen sharing
parameters.clickScreenShare({
  parameters: parameters
});

// Check screen sharing state
const isSharing = parameters.screenAlreadyOn;
```

**Check Screen Share Availability**

```javascript
// Check if screen sharing is available
const canShare = await parameters.checkScreenShare({
  parameters: parameters
});

if (canShare) {
  // Start screen sharing
  parameters.clickScreenShare({ parameters });
}
```

### Device Management Methods <a name="device-management-methods"></a>

Manage cameras, microphones, and audio output devices.

#### Enumerate Devices

```javascript
import { getMediaDevicesList } from 'mediasfu-reactnative-expo';

// Get all video input devices (cameras)
const cameras = await parameters.getMediaDevicesList('videoinput');
cameras.forEach(camera => {
  console.log(`Camera: ${camera.label} (${camera.deviceId})`);
});

// Get all audio input devices (microphones)
const microphones = await parameters.getMediaDevicesList('audioinput');
microphones.forEach(mic => {
  console.log(`Microphone: ${mic.label} (${mic.deviceId})`);
});

// Get all audio output devices (speakers)
const speakers = await parameters.getMediaDevicesList('audiooutput');
speakers.forEach(speaker => {
  console.log(`Speaker: ${speaker.label} (${speaker.deviceId})`);
});
```

#### Building a Device Selector

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

function DeviceSelector({ parameters }) {
  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    const cams = await parameters.getMediaDevicesList('videoinput');
    const mics = await parameters.getMediaDevicesList('audioinput');
    setCameras(cams);
    setMicrophones(mics);
    if (cams.length > 0) setSelectedCamera(cams[0].deviceId);
    if (mics.length > 0) setSelectedMicrophone(mics[0].deviceId);
  };

  const handleCameraChange = (deviceId) => {
    setSelectedCamera(deviceId);
    parameters.switchUserVideo({
      videoPreference: deviceId,
      parameters: parameters
    });
  };

  const handleMicrophoneChange = (deviceId) => {
    setSelectedMicrophone(deviceId);
    parameters.switchUserAudio({
      audioPreference: deviceId,
      parameters: parameters
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Camera:</Text>
      <Picker
        selectedValue={selectedCamera}
        onValueChange={handleCameraChange}
        style={styles.picker}
      >
        {cameras.map(camera => (
          <Picker.Item 
            key={camera.deviceId} 
            label={camera.label} 
            value={camera.deviceId} 
          />
        ))}
      </Picker>

      <Text style={styles.label}>Microphone:</Text>
      <Picker
        selectedValue={selectedMicrophone}
        onValueChange={handleMicrophoneChange}
        style={styles.picker}
      >
        {microphones.map(mic => (
          <Picker.Item 
            key={mic.deviceId} 
            label={mic.label} 
            value={mic.deviceId} 
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});

export default DeviceSelector;
```

### Participant Management Methods <a name="participant-management-methods"></a>

Manage participants, their roles, and permissions.

#### Get Participants Information

```javascript
// Get all participants
const participants = parameters.participants;

// Get participant count
const count = parameters.participantsCounter;

// Get current user info
const currentUser = {
  name: parameters.member,
  level: parameters.islevel, // '2' = host, '1' = co-host, '0' = participant
  videoOn: parameters.videoAlreadyOn,
  audioOn: parameters.audioAlreadyOn,
};

// Check if current user is host
const isHost = parameters.islevel === '2';

// Find specific participant
const participant = participants.find(p => p.id === 'participant-id');
```

#### Filter Participants

```javascript
// Get participants with video on
const videoParticipants = parameters.participants.filter(p => p.videoOn);

// Get participants with audio on (not muted)
const activeAudioParticipants = parameters.participants.filter(p => !p.muted);

// Get audio-only participants (no video)
const audioOnlyParticipants = parameters.participants.filter(p => !p.videoOn);

// Get host and co-hosts
const hosts = parameters.participants.filter(p => p.islevel === '2' || p.islevel === '1');

// Get regular participants
const regularParticipants = parameters.participants.filter(p => p.islevel === '0');
```

#### Remove Participant (Host Only)

```javascript
// Remove a participant from the room
parameters.disconnectUserInitiate({
  member: 'participant-name-or-id',
  ban: false,  // Set to true to ban the participant
  parameters: parameters
});
```

#### Request Participant to Toggle Media

```javascript
// Request participant to mute/unmute
parameters.requestMuteParticipant({
  participantId: 'participant-id',
  mute: true,  // true to request mute, false to request unmute
  parameters: parameters
});
```

#### Modify Participant Role

```javascript
// Change participant role (host only)
parameters.modifyCoHost({
  coHost: 'participant-name',
  coHostResponsibility: [
    { name: 'participants', value: true },
    { name: 'media', value: true },
    { name: 'chat', value: true },
  ],
  parameters: parameters
});
```

### Chat & Messaging Methods <a name="chat-messaging-methods"></a>

Send and receive messages, manage chat functionality.

#### Send Messages

```javascript
// Send a group message
parameters.sendMessage({
  message: 'Hello everyone!',
  type: 'group',  // or 'direct'
  receivers: [],  // Empty for group messages
  group: true,
  parameters: parameters
});

// Send a direct message
parameters.sendMessage({
  message: 'Private message',
  type: 'direct',
  receivers: ['participant-id'],
  group: false,
  parameters: parameters
});
```

#### Access Message History

```javascript
// Get all messages
const messages = parameters.messages;

// Get direct messages only
const directMessages = messages.filter(msg => msg.type === 'direct');

// Get group messages only
const groupMessages = messages.filter(msg => msg.type === 'group');

// Get messages from specific sender
const messagesFromUser = messages.filter(msg => msg.sender === 'username');
```

#### Listen for New Messages

```javascript
// Set up a message listener (typically in useEffect)
useEffect(() => {
  const handleNewMessage = (newMessages) => {
    console.log('New messages received:', newMessages);
    // Update your UI or state
  };

  // Subscribe to message updates
  const originalUpdateMessages = parameters.updateMessages;
  parameters.updateMessages = (msgs) => {
    originalUpdateMessages(msgs);
    handleNewMessage(msgs);
  };

  return () => {
    // Cleanup
    parameters.updateMessages = originalUpdateMessages;
  };
}, []);
```

### Recording Methods <a name="recording-methods"></a>

Control meeting recording with various configuration options.

#### Start/Stop Recording

```javascript
// Start recording
parameters.startRecording({
  parameters: parameters
});

// Stop recording
parameters.stopRecording({
  parameters: parameters
});

// Pause recording
parameters.pauseRecording({
  parameters: parameters
});

// Resume recording
parameters.resumeRecording({
  parameters: parameters
});

// Check recording state
const isRecording = parameters.recordStarted;
const isPaused = parameters.recordPaused;
const recordingState = parameters.recordState; // 'green', 'yellow', 'red'
```

#### Configure Recording Settings

```javascript
// Update recording configuration
parameters.updateRecording({
  recordingMediaOptions: 'video',  // 'video' or 'audio'
  recordingAudioOptions: 'all',    // 'all' or 'host'
  recordingVideoOptions: 'all',    // 'all' or 'host'
  recordingVideoType: 'fullDisplay', // 'fullDisplay', 'bestDisplay', 'all'
  recordingDisplayType: 'video',   // 'video', 'media', 'all'
  recordingBackgroundColor: '#000000',
  recordingNameTagsColor: '#ffffff',
  recordingOrientationVideo: 'landscape', // 'landscape' or 'portrait'
  recordingNameTags: true,
  recordingAddHLS: false,
  parameters: parameters
});
```

#### Recording with Custom Options

```javascript
import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';

function RecordingControls({ parameters }) {
  const [includeNameTags, setIncludeNameTags] = useState(true);
  const [orientation, setOrientation] = useState('landscape');

  const startCustomRecording = () => {
    // Configure recording settings
    parameters.updateRecording({
      recordingMediaOptions: 'video',
      recordingAudioOptions: 'all',
      recordingVideoOptions: 'all',
      recordingVideoType: 'fullDisplay',
      recordingDisplayType: 'media',
      recordingBackgroundColor: '#1a1a1a',
      recordingNameTagsColor: '#ffffff',
      recordingOrientationVideo: orientation,
      recordingNameTags: includeNameTags,
      recordingAddHLS: false,
      parameters: parameters
    });

    // Start recording
    parameters.startRecording({ parameters });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recording Settings</Text>
      
      <View style={styles.option}>
        <Text>Include Name Tags</Text>
        <Switch 
          value={includeNameTags}
          onValueChange={setIncludeNameTags}
        />
      </View>

      <View style={styles.option}>
        <Text>Orientation: {orientation}</Text>
        <TouchableOpacity
          onPress={() => setOrientation(
            orientation === 'landscape' ? 'portrait' : 'landscape'
          )}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Toggle</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={startCustomRecording}
        style={[styles.button, styles.primaryButton]}
      >
        <Text style={styles.buttonText}>
          {parameters.recordStarted ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    marginTop: 20,
    padding: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RecordingControls;
```

### Polls & Survey Methods <a name="polls-survey-methods"></a>

Create and manage polls for audience engagement.

#### Create a Poll

```javascript
// Create a new poll
parameters.handleCreatePoll({
  poll: {
    question: 'What time works best for the next meeting?',
    type: 'multiple',  // 'single' or 'multiple' choice
    options: ['10 AM', '2 PM', '5 PM', '8 PM'],
    duration: 60,  // Duration in seconds
  },
  parameters: parameters
});
```

#### Vote on a Poll

```javascript
// Cast a vote on an active poll
parameters.handleVotePoll({
  pollId: 'poll-id',
  optionIndex: 1,  // Index of the selected option
  parameters: parameters
});
```

#### End a Poll

```javascript
// End an active poll (host only)
parameters.handleEndPoll({
  pollId: 'poll-id',
  parameters: parameters
});
```

#### Access Poll Data

```javascript
// Get all polls
const polls = parameters.polls;

// Find active poll
const activePoll = polls.find(p => p.status === 'active');

// Get poll results
const pollResults = activePoll?.votes || [];

// Display poll results
polls.forEach(poll => {
  console.log(`Question: ${poll.question}`);
  console.log(`Status: ${poll.status}`);
  poll.options.forEach((option, index) => {
    const votes = poll.votes?.[index] || 0;
    console.log(`  ${option}: ${votes} votes`);
  });
});
```

### Breakout Room Methods <a name="breakout-room-methods"></a>

Create and manage breakout rooms for small group discussions.

#### Create Breakout Rooms

```javascript
// Create breakout rooms
parameters.handleCreateBreakoutRooms({
  numberOfRooms: 3,
  participants: parameters.participants,
  parameters: parameters
});
```

#### Assign Participants to Rooms

```javascript
// Assign specific participant to a room
parameters.handleAssignParticipantToRoom({
  participantId: 'participant-id',
  roomIndex: 0,  // Room number (0-based)
  parameters: parameters
});
```

#### Start Breakout Rooms

```javascript
// Start the breakout room session
parameters.handleStartBreakoutRooms({
  parameters: parameters
});
```

#### Stop Breakout Rooms

```javascript
// Stop breakout rooms and return everyone to main room
parameters.handleStopBreakoutRooms({
  parameters: parameters
});
```

#### Access Breakout Room Data

```javascript
// Get breakout room configuration
const breakoutRooms = parameters.breakoutRooms;

// Get current room
const currentRoom = parameters.currentBreakoutRoom;

// Check if in breakout room
const isInBreakoutRoom = currentRoom !== null;

// Get participants in each room
breakoutRooms.forEach((room, index) => {
  console.log(`Room ${index + 1}:`, room.participants.map(p => p.name));
});
```

### Advanced WebRTC Methods <a name="advanced-webrtc-methods"></a>

Low-level methods for advanced WebRTC control.

#### Socket Connection

```javascript
import { connectSocket, disconnectSocket } from 'mediasfu-reactnative-expo';

// Connect to MediaSFU servers
const socket = await connectSocket({
  apiUserName: credentials.apiUserName,
  apiKey: credentials.apiKey,
  apiToken: token,
  link: serverLink,
});

// Disconnect from server
await disconnectSocket({
  socket: socket,
  parameters: parameters
});
```

#### Device Creation

```javascript
// Create mediasoup device client
await parameters.createDeviceClient({
  parameters: parameters
});
```

#### Transport Management

```javascript
// Create send transport
await parameters.createSendTransport({
  option: 'video',  // 'video', 'audio', or 'screen'
  parameters: parameters
});

// Connect send transport for video
await parameters.connectSendTransportVideo({
  parameters: parameters
});

// Connect send transport for audio
await parameters.connectSendTransportAudio({
  parameters: parameters
});

// Connect send transport for screen
await parameters.connectSendTransportScreen({
  parameters: parameters
});

// Disconnect transports
await parameters.disconnectSendTransportVideo({
  parameters: parameters
});
```

#### Consumer Management

```javascript
// Resume/pause consumer transports
await parameters.processConsumerTransports({
  consumerTransports: parameters.consumerTransports,
  lStreams: parameters.lStreams,
  parameters: parameters
});

// Resume specific consumer
await parameters.consumerResume({
  id: 'consumer-id',
  kind: 'video',  // 'video' or 'audio'
  parameters: parameters
});
```

#### Stream Processing

```javascript
// Mix and prioritize streams
await parameters.mixStreams({
  alVideoStreams: parameters.allVideoStreams,
  parameters: parameters
});

// Display streams
await parameters.dispStreams({
  lStreams: parameters.lStreams,
  ind: 0,
  parameters: parameters
});

// Reorder streams
await parameters.reorderStreams({
  add: true,  // true to add, false to remove
  screenChanged: false,
  parameters: parameters
});
```

### Utility Methods

Helpful utility methods for common tasks.

```javascript
import { formatNumber, checkPermission, sleep } from 'mediasfu-reactnative-expo';

// Format large numbers
const formatted = formatNumber(1250000); // Returns "1.25M"

// Check media permissions
const hasCameraPermission = await checkPermission({
  permissionType: 'camera',
  parameters: parameters
});

const hasMicPermission = await checkPermission({
  permissionType: 'audio',
  parameters: parameters
});

// Delay execution
await sleep({ ms: 1000 }); // Wait 1 second

// Trigger layout recalculation
parameters.onScreenChanges({
  changed: true,
  parameters: parameters
});

// Update main window visibility
parameters.updateMainWindow(true); // Show main window
```

**💡 Pro Tip:** Most methods accept a `parameters` object. This object contains all the state and functions needed for the operation. Always pass the current `parameters` object to ensure methods work correctly.

**📖 Complete API Reference:** For detailed documentation on all 200+ methods, visit [mediasfu.com/reactnativeexpo](https://www.mediasfu.com/reactnativeexpo/).

---

# Intermediate Usage Guide <a name="intermediate-usage-guide"></a>

Expands on the basic usage, covering more advanced features and scenarios.

### Intermediate Usage Guide

In the Intermediate Usage Guide, we'll explore the core components and functionalities of the MediaSFU ReactNative-Expo module, focusing on media display, controls, and modal interactions. **Click on any listed component/method to open the full documentation.**

#### Core Components Overview

The main items displayed on an event page are media components (such as video, audio, and blank cards) and control components (for pagination, navigation, etc.).

> ##### **Media Display Components**

| Component Name           | Description                                                                                     |
|--------------------------|-------------------------------------------------------------------------------------------------|
| **[MainAspectComponent](https://www.mediasfu.com/reactnativeexpo/functions/MainAspectComponent)** | Serves as a container for the primary aspect of the user interface, typically containing the main content or focus of the application. |
| **[MainScreenComponent](https://www.mediasfu.com/reactnativeexpo/functions/MainScreenComponent)** | Responsible for rendering the main screen layout of the application, providing the foundation for displaying various elements and content. |
| **[MainGridComponent](https://www.mediasfu.com/reactnativeexpo/functions/MainGridComponent)**  | Crucial part of the user interface, organizing and displaying primary content or elements in a grid layout format. |
| **[SubAspectComponent](https://www.mediasfu.com/reactnativeexpo/functions/SubAspectComponent)** | Acts as a secondary container within the user interface, often housing additional elements or controls related to the main aspect. |
| **[MainContainerComponent](https://www.mediasfu.com/reactnativeexpo/functions/MainContainerComponent)** | Primary container for the application's content, encapsulating all major components and providing structural organization. |
| **[OtherGridComponent](https://www.mediasfu.com/reactnativeexpo/functions/OtherGridComponent)** | Complements the Main Grid Component by offering additional grid layouts, typically used for displaying secondary or auxiliary content. |

> ##### **Control Components**

| Component Name                | Description                                                                                     |
|-------------------------------|-------------------------------------------------------------------------------------------------|
| **[ControlButtonsComponent](https://www.mediasfu.com/reactnativeexpo/functions/ControlButtonsComponent)** | Comprises a set of buttons or controls used for navigating, interacting, or managing various aspects of the application's functionality. |
| **[ControlButtonsAltComponent](https://www.mediasfu.com/reactnativeexpo/functions/ControlButtonsAltComponent)** | Provides alternative button configurations or styles for controlling different aspects of the application. |
| **[ControlButtonsComponentTouch](https://www.mediasfu.com/reactnativeexpo/functions/ControlButtonsComponentTouch)** | Specialized component designed for touch-enabled devices, offering floating buttons or controls for intuitive interaction with the application's features. |


These components collectively contribute to the overall user interface, facilitating navigation, interaction, and content display within the application.

> ##### **Modal Components**

| Modal Component | Description |
|-----------------|-------------|
| **[LoadingModal](https://www.mediasfu.com/reactnativeexpo/functions/LoadingModal)** | Modal for displaying loading indicator during data fetching or processing. |
| **[MainAspectComponent](https://www.mediasfu.com/reactnativeexpo/functions/MainAspectComponent)** | Component responsible for displaying the main aspect of the event page. |
| **[ControlButtonsComponent](https://www.mediasfu.com/reactnativeexpo/functions/ControlButtonsComponent)** | Component for displaying control buttons such as pagination controls. |
| **[ControlButtonsAltComponent](https://www.mediasfu.com/reactnativeexpo/functions/ControlButtonsAltComponent)** | Alternate control buttons component for specific use cases. |
| **[ControlButtonsComponentTouch](https://www.mediasfu.com/reactnativeexpo/functions/ControlButtonsComponentTouch)** | Touch-enabled control buttons component for mobile devices. |
| **[OtherGridComponent](https://www.mediasfu.com/reactnativeexpo/functions/OtherGridComponent)** | Component for displaying additional grid elements on the event page. |
| **[MainScreenComponent](https://www.mediasfu.com/reactnativeexpo/functions/MainScreenComponent)** | Component for rendering the main screen content of the event. |
| **[MainGridComponent](https://www.mediasfu.com/reactnativeexpo/functions/MainGridComponent)** | Main grid component for displaying primary event content. |
| **[SubAspectComponent](https://www.mediasfu.com/reactnativeexpo/functions/SubAspectComponent)** | Component for displaying secondary aspects of the event page. |
| **[MainContainerComponent](https://www.mediasfu.com/reactnativeexpo/functions/MainContainerComponent)** | Main container component for the event page content. |
| **[AlertComponent](https://www.mediasfu.com/reactnativeexpo/functions/AlertComponent)** | Modal for displaying alert messages to the user. |
| **[MenuModal](https://www.mediasfu.com/reactnativeexpo/functions/MenuModal)** | Modal for displaying a menu with various options. |
| **[RecordingModal](https://www.mediasfu.com/reactnativeexpo/functions/RecordingModal)** | Modal for managing recording functionality during the event. |
| **[RequestsModal](https://www.mediasfu.com/reactnativeexpo/functions/RequestsModal)** | Modal for handling requests from participants during the event. |
| **[WaitingRoomModal](https://www.mediasfu.com/reactnativeexpo/functions/WaitingRoomModal)** | Modal for managing waiting room functionality during the event. |
| **[DisplaySettingsModal](https://www.mediasfu.com/reactnativeexpo/functions/DisplaySettingsModal)** | Modal for adjusting display settings during the event. |
| **[EventSettingsModal](https://www.mediasfu.com/reactnativeexpo/functions/EventSettingsModal)** | Modal for configuring event settings. |
| **[CoHostModal](https://www.mediasfu.com/reactnativeexpo/functions/CoHostModal)** | Modal for managing co-host functionality during the event. |
| **[ParticipantsModal](https://www.mediasfu.com/reactnativeexpo/functions/ParticipantsModal)** | Modal for displaying participant information and controls. |
| **[MessagesModal](https://www.mediasfu.com/reactnativeexpo/functions/MessagesModal)** | Modal for managing messages and chat functionality during the event. |
| **[MediaSettingsModal](https://www.mediasfu.com/reactnativeexpo/functions/MediaSettingsModal)** | Modal for adjusting media settings during the event. |
| **[ConfirmExitModal](https://www.mediasfu.com/reactnativeexpo/functions/ConfirmExitModal)** | Modal for confirming exit from the event. |
| **[ConfirmHereModal](https://www.mediasfu.com/reactnativeexpo/functions/ConfirmHereModal)** | Modal for confirming certain actions or selections. |
| **[ShareEventModal](https://www.mediasfu.com/reactnativeexpo/functions/ShareEventModal)** | Modal for sharing the event with others. |
| **[WelcomePage](https://www.mediasfu.com/reactnativeexpo/functions/WelcomePage)** | Welcome page modal for the event. |
| **[PreJoinPage](https://www.mediasfu.com/reactnativeexpo/functions/PreJoinPage)** | Prejoin page modal for the event. |
| **[PollModal](https://www.mediasfu.com/reactnativeexpo/functions/PollModal)** | Modal for conducting polls or surveys during the event. |
| **[BreakoutRoomsModal](https://www.mediasfu.com/reactnativeexpo/functions/BreakoutRoomsModal)** | Modal for managing breakout rooms during the event. |

#### Modal Interactions

Each modal has corresponding functions to trigger its usage:

1. [`launchMenuModal`](https://www.mediasfu.com/reactnativeexpo/functions/launchMenuModal): Launches the menu modal for settings and configurations.
2. [`launchRecording`](https://www.mediasfu.com/reactnativeexpo/functions/launchRecording): Initiates the recording modal for recording functionalities.
3. [`startRecording`](https://www.mediasfu.com/reactnativeexpo/functions/startRecording): Starts the recording process.
4. [`confirmRecording`](https://www.mediasfu.com/reactnativeexpo/functions/confirmRecording): Confirms and finalizes the recording.
5. [`launchWaiting`](https://www.mediasfu.com/reactnativeexpo/functions/launchWaiting): Opens the waiting room modal for managing waiting room interactions.
6. [`launchCoHost`](https://www.mediasfu.com/reactnativeexpo/functions/launchCoHost): Opens the co-host modal for managing co-host functionalities.
7. [`launchMediaSettings`](https://www.mediasfu.com/reactnativeexpo/functions/launchMediaSettings): Launches the media settings modal for adjusting media-related configurations.
8. [`launchDisplaySettings`](https://www.mediasfu.com/reactnativeexpo/functions/launchDisplaySettings): Opens the display settings modal for adjusting display configurations.
9. [`launchSettings`](https://www.mediasfu.com/reactnativeexpo/functions/launchSettings): Initiates the settings modal for general event settings and configurations.
10. [`launchRequests`](https://www.mediasfu.com/reactnativeexpo/functions/launchRequests): Opens the requests modal for managing user requests.
11. [`launchParticipants`](https://www.mediasfu.com/reactnativeexpo/functions/launchParticipants): Displays the participants modal for viewing and managing event participants.
12. [`launchMessages`](https://www.mediasfu.com/reactnativeexpo/functions/launchMessages): Opens the messages modal for communication through chat messages.
13. [`launchConfirmExit`](https://www.mediasfu.com/reactnativeexpo/functions/launchConfirmExit): Prompts users to confirm before exiting the event.

#### Media Display and Controls

These components facilitate media display and control functionalities:

1. **[Pagination](https://www.mediasfu.com/reactnativeexpo/functions/Pagination)**: Handles pagination and page switching.
2. **[FlexibleGrid](https://www.mediasfu.com/reactnativeexpo/functions/FlexibleGrid)**: Renders flexible grid layouts for media display.
3. **[FlexibleVideo](https://www.mediasfu.com/reactnativeexpo/functions/FlexibleVideo)**: Displays videos in a flexible manner within the grid.
4. **[AudioGrid](https://www.mediasfu.com/reactnativeexpo/functions/AudioGrid)**: Renders audio components within the grid layout.

These components enable seamless media presentation and interaction within the event environment, providing users with a rich and immersive experience.

| UI Media Component | Description |
|--------------|-------------|
| **[MeetingProgressTimer](https://www.mediasfu.com/reactnativeexpo/functions/MeetingProgressTimer)** | Component for displaying a timer indicating the progress of a meeting or event. |
| **[MiniAudio](https://www.mediasfu.com/reactnativeexpo/functions/MiniAudio)** | Component for rendering a compact audio player with basic controls. |
| **[MiniCard](https://www.mediasfu.com/reactnativeexpo/functions/MiniCard)** | Component for displaying a minimized card view with essential information. |
| **[AudioCard](https://www.mediasfu.com/reactnativeexpo/functions/AudioCard)** | Component for displaying audio content with control elements, details, and audio decibels. |
| **[VideoCard](https://www.mediasfu.com/reactnativeexpo/functions/VideoCard)** | Component for displaying video content with control elements, details, and audio decibels. |
| **[CardVideoDisplay](https://www.mediasfu.com/reactnativeexpo/functions/CardVideoDisplay)** | Video player component for displaying embedded videos with controls and details. |
| **[MiniCardAudio](https://www.mediasfu.com/reactnativeexpo/functions/MiniCardAudio)** | Component for rendering a compact card view with audio content and controls. |
| **[MiniAudioPlayer](https://www.mediasfu.com/reactnativeexpo/functions/MiniAudioPlayer)** | Utility method for playing audio and rendering a mini audio modal when the user is not actively displayed on the page. |

---
With the Intermediate Usage Guide, users can explore and leverage the core components and functionalities of the MediaSFU ReactNative-Expo module to enhance their event hosting and participation experiences.

Here's a sample import and usage code for a Broadcast screen:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { PrejoinPage, MainContainerComponent, MainAspectComponent, MainScreenComponent, MainGridComponent, FlexibleVideo, ControlButtonsComponentTouch, AudioGrid } from 'mediasfu-reactnative-expo';

const BroadcastScreen = () => {
    // State variables and constants
    const [validated, setValidated] = useState<boolean>(useLocalUIMode); // Validated state as boolean
    const confirmedToRecord = useRef<boolean>(false); // True if the user has confirmed to record as boolean
    const meetingDisplayType = useRef<string>("media"); // Meeting display type as string

    // Sample control button configurations
    const controlBroadcastButtons = [/* define your control buttons here */];
    const recordButton = [/* define your record button here */];
    const recordButtons = [/* define your record buttons here */];

    // Sample component sizes
    const componentSizes = useRef<ComponentSizes>({
        // Component sizes as ComponentSizes
        mainHeight: 0,
        otherHeight: 0,
        mainWidth: 0,
        otherWidth: 0,
    }); // Component sizes

    // Sample function to update component sizes
    const updateComponentSizes = (sizes: ComponentSizes) => {
        componentSizes.current = sizes;
    };


    // Sample function to update validation state
    const updateValidated = (value: boolean) => {
        setValidated(value);
    };

    // Sample credentials
    const credentials = {
        apiUserName: "yourAPIUserName",
        apiKey: "yourAPIKey"
    };

    // Sample socket
    const socket = useRef<Socket>({} as Socket); // Socket for the media server, type Socket 

    // Sample meeting progress time
    const [meetingProgressTime, setMeetingProgressTime] =
    useState<string>("00:00:00"); // Meeting progress time as string

    // Sample record state
    const [recordState, setRecordState] = useState<string>("green"); // Recording state with specific values

    // Sample main grid and other grid elements
    const mainGridStream = useRef<JSX.Element[]>([]); // Array of main grid streams as JSX.Element[]
    const [otherGridStreams, setOtherGridStreams] = useState<JSX.Element[][]>([
        [],
        [],
    ]); // Other grid streams as 2D array of JSX.Element[]
  

    // Sample audio only streams
    const audioOnlyStreams = useRef<JSX.Element[]>([]); // Array of audio-only streams

    // Sample main height and width
    const [mainHeightWidth, setMainHeightWidth] = useState<number>(100); // Main height and width as number

    // Render the PrejoinPage if not validated, otherwise render the main components
    return (
    <SafeAreaProvider
      style={{
        marginTop: Platform.OS === "ios" ? 0 : Constants.statusBarHeight,
      }}
    >
      <StatusBar
        animated
        hidden={false}
        networkActivityIndicatorVisible={true}
        translucent={true} // Keep this if you want the content to show behind the status bar
        backgroundColor="rgba(0, 0, 0, 0.2)" 
        style="light"
      />

      {/* MainContainerComponent displays the room and controls */}
      {/* WelcomePage is for authentication of room credentials */}

      {!validated ? (
        <PrejoinPage
          parameters={{
            imgSrc,
            showAlert,
            updateIsLoadingModalVisible,
            connectSocket,
            updateSocket,
            updateValidated,
            updateApiUserName,
            updateApiToken,
            updateLink,
            updateRoomName,
            updateMember,
          }}
          credentials={credentials}
        />
      ) : (
        <MainContainerComponent>
          {/* Main aspect component containsa ll but the control buttons (as used for webinar and conference) */}
          <MainAspectComponent
            backgroundColor="rgba(217, 227, 234, 0.99)"
            defaultFraction={1 - controlHeight}
            updateIsWideScreen={updateIsWideScreen}
            updateIsMediumScreen={updateIsMediumScreen}
            updateIsSmallScreen={updateIsSmallScreen}
            showControls={
              eventType.current === "webinar" ||
              eventType.current === "conference"
            }
          >
            {/* MainScreenComponent contains the main grid view and the minor grid view */}
            <MainScreenComponent
              doStack={true}
              mainSize={mainHeightWidth}
              updateComponentSizes={updateComponentSizes}
              defaultFraction={1 - controlHeight}
              componentSizes={componentSizes.current}
              showControls={
                eventType.current === "webinar" ||
                eventType.current === "conference"
              }
            >
              {/* MainGridComponent shows the main grid view - not used at all in chat event type  and conference event type when screenshare is not active*/}
              {/* MainGridComponent becomes the dominant grid view in broadcast and webinar event types */}
              {/* MainGridComponent becomes the dominant grid view in conference event type when screenshare is active */}

              <MainGridComponent
                height={componentSizes.current.mainHeight}
                width={componentSizes.current.mainWidth}
                backgroundColor="rgba(217, 227, 234, 0.99)"
                showAspect={mainHeightWidth > 0 ? true : false}
                timeBackgroundColor={recordState}
                meetingProgressTime={meetingProgressTime}
              >
                <FlexibleVideo
                  customWidth={componentSizes.current.mainWidth}
                  customHeight={componentSizes.current.mainHeight}
                  rows={1}
                  columns={1}
                  componentsToRender={
                    mainGridStream.current ? mainGridStream.current : []
                  }
                  showAspect={
                    mainGridStream.current.length > 0 &&
                    !(whiteboardStarted.current && !whiteboardEnded.current)
                  }
                />

                <ControlButtonsComponentTouch
                  buttons={controlBroadcastButtons}
                  position={"right"}
                  location={"bottom"}
                  direction={"vertical"}
                  showAspect={eventType.current === "broadcast"}
                />

                {/* Button to launch recording modal */}
                <ControlButtonsComponentTouch
                  buttons={recordButton}
                  direction={"horizontal"}
                  showAspect={
                    eventType.current === "broadcast" &&
                    !showRecordButtons &&
                    islevel.current === "2"
                  }
                  location="bottom"
                  position="middle"
                />

                {/* Buttons to control recording */}
                <ControlButtonsComponentTouch
                  buttons={recordButtons}
                  direction={"horizontal"}
                  showAspect={
                    eventType.current === "broadcast" &&
                    showRecordButtons &&
                    islevel.current === "2"
                  }
                  location="bottom"
                  position="middle"
                />
              </MainGridComponent>

              {/* AudioGrid contains all the audio only streams */}
              {/* If broadcasting and there are audio only streams (just one), the audio only streams are displayed in the main grid view */}
              {/* If webinar and you are the host, the audio only streams (just one), are displayed in the main grid view */}
              <AudioGrid
                componentsToRender={
                  audioOnlyStreams.current ? audioOnlyStreams.current : []
                }
              />
            </MainScreenComponent>
          </MainAspectComponent>
        </MainContainerComponent>
      )}

      <ParticipantsModal
        backgroundColor="rgba(217, 227, 234, 0.99)"
        isParticipantsModalVisible={isParticipantsModalVisible}
        onParticipantsClose={() => updateIsParticipantsModalVisible(false)}
        participantsCounter={participantsCounter.current}
        onParticipantsFilterChange={onParticipantsFilterChange}
        parameters={{
          updateParticipants: updateParticipants,
          updateIsParticipantsModalVisible: updateIsParticipantsModalVisible,

          updateDirectMessageDetails,
          updateStartDirectMessage,
          updateIsMessagesModalVisible,

          showAlert: showAlert,

          filteredParticipants: filteredParticipants.current,
          participants: filteredParticipants.current,
          roomName: roomName.current,
          islevel: islevel.current,
          member: member.current,
          coHostResponsibility: coHostResponsibility.current,
          coHost: coHost.current,
          eventType: eventType.current,

          startDirectMessage: startDirectMessage.current,
          directMessageDetails: directMessageDetails.current,
          socket: socket.current,

          getUpdatedAllParams: getAllParams,
        }}
      />

      <RecordingModal
        backgroundColor="rgba(217, 227, 234, 0.99)"
        isRecordingModalVisible={isRecordingModalVisible}
        onClose={() => updateIsRecordingModalVisible(false)}
        startRecording={startRecording}
        confirmRecording={confirmRecording}
        parameters={{
          ...getAllParams(),
          ...mediaSFUFunctions(),
        }}
      />

      <MessagesModal
        backgroundColor={
          eventType.current === "webinar" || eventType.current === "conference"
            ? "#f5f5f5"
            : "rgba(255, 255, 255, 0.25)"
        }
        isMessagesModalVisible={isMessagesModalVisible}
        onMessagesClose={() => updateIsMessagesModalVisible(false)}
        messages={messages.current}
        eventType={eventType.current}
        member={member.current}
        islevel={islevel.current}
        coHostResponsibility={coHostResponsibility.current}
        coHost={coHost.current}
        startDirectMessage={startDirectMessage.current}
        directMessageDetails={directMessageDetails.current}
        updateStartDirectMessage={updateStartDirectMessage}
        updateDirectMessageDetails={updateDirectMessageDetails}
        showAlert={showAlert}
        roomName={roomName.current}
        socket={socket.current}
        chatSetting={chatSetting.current}
      />

      <ConfirmExitModal
        backgroundColor="rgba(181, 233, 229, 0.97)"
        isConfirmExitModalVisible={isConfirmExitModalVisible}
        onConfirmExitClose={() => updateIsConfirmExitModalVisible(false)}
        member={member.current}
        roomName={roomName.current}
        socket={socket.current}
        islevel={islevel.current}
      />

      <ConfirmHereModal
        backgroundColor="rgba(181, 233, 229, 0.97)"
        isConfirmHereModalVisible={isConfirmHereModalVisible}
        onConfirmHereClose={() => updateIsConfirmHereModalVisible(false)}
        member={member.current}
        roomName={roomName.current}
        socket={socket.current}
      />

      <ShareEventModal
        isShareEventModalVisible={isShareEventModalVisible}
        onShareEventClose={() => updateIsShareEventModalVisible(false)}
        roomName={roomName.current}
        islevel={islevel.current}
        adminPasscode={adminPasscode.current}
        eventType={eventType.current}
      />

      <AlertComponent
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        duration={alertDuration}
        onHide={() => setAlertVisible(false)}
        textColor={"#ffffff"}
      />

      <LoadingModal
        isVisible={isLoadingModalVisible}
        backgroundColor="rgba(217, 227, 234, 0.99)"
        displayColor="black"
      />
    </SafeAreaProvider>
  );
};

export default BroadcastScreen;
```

This sample code demonstrates the import and usage of various components and features for a Broadcast screen, including rendering different UI components based on the validation state, handling socket connections, displaying video streams, controlling recording, and managing component sizes.

Here's a sample usage of the control button components as used above:

```jsx
      const recordButton = [
      // recording button (to launch recording modal)
      // Replace or remove any of the buttons as you wish
      {
        icon: "record-vinyl",
        text: "Record",
        onPress: () => {
          // Action for the Record button
          launchRecording({
            updateIsRecordingModalVisible: updateIsRecordingModalVisible,
            isRecordingModalVisible: isRecordingModalVisible,
            showAlert: showAlert,
            stopLaunchRecord: stopLaunchRecord.current,
            canLaunchRecord: canLaunchRecord.current,
            recordingAudioSupport: recordingAudioSupport.current,
            recordingVideoSupport: recordingVideoSupport.current,
            updateCanRecord: updateCanRecord,
            updateClearedToRecord: updateClearedToRecord,
            recordStarted: recordStarted.current,
            recordPaused: recordPaused.current,
            localUIMode: localUIMode.current,
          });
        },
        activeColor: "black",
        inActiveColor: "black",
        show: true,
      },
    ];

    const recordButtons = [
      // recording state control and recording timer buttons
      // Replace or remove any of the buttons as you wish

      // Refer to ControlButtonsAltComponent for more details on how to add custom buttons

      {
        // name: 'Pause',
        icon: "play-circle",
        active: recordPaused.current === false,
        onPress: () => {
          updateRecording({
            parameters: { ...getAllParams(), ...mediaSFUFunctions() },
          });
        },
        activeColor: "black",
        inActiveColor: "black",
        alternateIcon: "pause-circle",
        show: true,
      },
      {
        // name: 'Stop',
        icon: "stop-circle",
        active: false,
        onPress: () => {
          stopRecording({
            parameters: { ...getAllParams(), ...mediaSFUFunctions() },
          });
        },
        activeColor: "green",
        inActiveColor: "black",
        show: true,
      },
      {
        // name: 'Timer',
        customComponent: (
          <View
            style={{
              backgroundColor: "transparent",
              borderWidth: 0,
              padding: 0,
              margin: 2,
            }}
          >
            <Text
              style={{
                backgroundColor: "transparent",
                borderWidth: 0,
                padding: 0,
                margin: 0,
              }}
            >
              {recordingProgressTime}
            </Text>
          </View>
        ),
        show: true,
      },
      {
        // name: 'Status',
        icon: "dot-circle",
        active: false,
        onPress: () => console.log("Status pressed"),
        activeColor: "black",
        inActiveColor: recordPaused.current === false ? "red" : "yellow",
        show: true,
      },
      {
        // name: 'Settings',
        icon: "cog",
        active: false,
        onPress: () => {
          launchRecording({
            updateIsRecordingModalVisible: updateIsRecordingModalVisible,
            isRecordingModalVisible: isRecordingModalVisible,
            showAlert: showAlert,
            stopLaunchRecord: stopLaunchRecord.current,
            canLaunchRecord: canLaunchRecord.current,
            recordingAudioSupport: recordingAudioSupport.current,
            recordingVideoSupport: recordingVideoSupport.current,
            updateCanRecord: updateCanRecord,
            updateClearedToRecord: updateClearedToRecord,
            recordStarted: recordStarted.current,
            recordPaused: recordPaused.current,
            localUIMode: localUIMode.current,
          });
        },
        activeColor: "green",
        inActiveColor: "black",
        show: true,
      },
    ];

    const controlBroadcastButtons: ButtonTouch[] = [
      // control buttons for broadcast
      // Replace or remove any of the buttons as you wish

      // Refer to ControlButtonsComponentTouch.js for more details on how to add custom buttons

      {
        // users button
        icon: "users",
        active: true,
        alternateIcon: "users",
        onPress: () => {
          launchParticipants({
            updateIsParticipantsModalVisible,
            isParticipantsModalVisible: isParticipantsModalVisible,
          });
        },
        activeColor: "black",
        inActiveColor: "black",
        show: islevel.current === "2",
      },

      {
        // share button
        icon: "share-alt",
        active: true,
        alternateIcon: "share-alt",
        onPress: () => updateIsShareEventModalVisible(!isShareEventModalVisible),
        activeColor: "black",
        inActiveColor: "black",
        show: true,
      },
      {
        customComponent: (
          <View style={{ position: "relative" }}>
            {/* Your icon */}
            <FontAwesome5 name="comments" size={24} color="black" />
            {/* Conditionally render a badge */}
            {showMessagesBadge && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "red",
                    borderRadius: 12,
                    paddingHorizontal: 4,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                  />
                </View>
              </View>
            )}
          </View>
        ),
        show: true,
        onPress: () =>
          launchMessages({
            updateIsMessagesModalVisible,
            isMessagesModalVisible: isMessagesModalVisible,
          }),
      },
      {
        // switch camera button
        icon: "sync",
        active: true,
        alternateIcon: "sync",
        onPress: () =>
          switchVideoAlt({
            parameters: {
              ...getAllParams(),
              ...mediaSFUFunctions(),
            },
          }),
        activeColor: "black",
        inActiveColor: "black",
        show: islevel.current === "2",
      },
      {
        // name: 'Video',
        icon: "video-slash",
        alternateIcon: "video",
        active: videoActive,
        onPress: () =>
          clickVideo({
            parameters: {
              ...getAllParams(),
              ...mediaSFUFunctions(),
            },
          }),
        show: islevel.current === "2",
        activeColor: "green",
        inActiveColor: "red",
      },
      {
        // name: 'Microphone',
        icon: "microphone-slash",
        alternateIcon: "microphone",
        active: micActive,
        onPress: () =>
          clickAudio({
            parameters: {
              ...getAllParams(),
              ...mediaSFUFunctions(),
            },
          }),
        activeColor: "green",
        inActiveColor: "red",
        show: islevel.current === "2",
      },
      {
        customComponent: (
          <View
            style={{
              backgroundColor: "transparent",
              borderWidth: 0,
              padding: 0,
              margin: 5,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesome5 name="chart-bar" size={24} color="black" />
            <Text
              style={{
                backgroundColor: "transparent",
                borderWidth: 0,
                padding: 0,
                margin: 0,
              }}
            >
              {participantsCounter.current}
            </Text>
          </View>
        ),
        show: true,
      },
      {
        // name: 'End Call',
        icon: "phone",
        active: endCallActive,
        onPress: () =>
          launchConfirmExit({
            updateIsConfirmExitModalVisible,
            isConfirmExitModalVisible: isConfirmExitModalVisible,
          }),
        activeColor: "green",
        inActiveColor: "red",
        show: true,
      },
      {
        // name: 'End Call',
        icon: "phone",
        active: endCallActive,
        onPress: () => console.log("End Call pressed"), // not in use
        activeColor: "transparent",
        inActiveColor: "transparent",
        backgroundColor: { default: "transparent" },
        show: true,
      },
    ];
```

This sample code defines arrays `recordButtons` and `controlBroadcastButtons`, each containing configuration objects for different control buttons. These configurations include properties such as icon, active state, onPress function, activeColor, inActiveColor, and show flag to control the visibility of each button.

You can customize these configurations according to your requirements, adding, removing, or modifying buttons as needed. Additionally, you can refer to the relevant component files (`ControlButtonsAltComponent` and `ControlButtonsComponentTouch`) for more details on how to add custom buttons.

<div style="text-align: center;">
  Preview of Broadcast Page

<img src="https://mediasfu.com/images/broadcast.png" alt="Preview of Welcome Page" title="Welcome Page" style="max-height: 500px;">

<!-- Add a blank line for spacing -->
&nbsp;
  
  Preview of Conference Page

<img src="https://mediasfu.com/images/conference1.png" alt="Preview of Prejoin Page" title="Prejoin Page" style="max-height: 500px;">

### Preview of Conference Page's Mini Grids

<img src="https://mediasfu.com/images/conference2.png" alt="Preview of Prejoin Page" title="Prejoin Page" style="max-height: 500px;">

</div>
<br/>

# Advanced Usage Guide <a name="advanced-usage-guide"></a>

In-depth documentation for advanced users, covering complex functionalities and customization options.

**Introduction to Advanced Media Control Functions:**

In advanced usage scenarios, users often encounter complex tasks related to media control, connectivity, and streaming management within their applications. To facilitate these tasks, a comprehensive set of functions is provided, offering granular control over various aspects of media handling and communication with servers.

These advanced media control functions encompass a wide range of functionalities, including connecting to and disconnecting from WebSocket servers, joining and updating room parameters, managing device creation, switching between different media streams, handling permissions, processing consumer transports, managing screen sharing, adjusting layouts dynamically, and much more.

This robust collection of functions empowers developers to tailor their applications to specific requirements, whether it involves intricate media streaming setups, real-time communication protocols, or sophisticated user interface interactions. With these tools at their disposal, developers can create rich and responsive media experiences that meet the demands of their users and applications.

Here's a tabulated list of advanced control functions along with brief explanations (click the function(link) for full usage guide):

| Function                         | Explanation                                                                                             |
|----------------------------------|---------------------------------------------------------------------------------------------------------|
| [`connectSocket`](https://www.mediasfu.com/reactnativeexpo/functions/connectSocket)                  | Connects to the WebSocket server.                                                                       |
| [`disconnectSocket`](https://www.mediasfu.com/reactnativeexpo/functions/disconnectSocket)               | Disconnects from the WebSocket server.                                                                  |
| [`joinRoomClient`](https://www.mediasfu.com/reactnativeexpo/functions/joinRoomClient)                 | Joins a room as a client.                                                                               |
| [`updateRoomParametersClient`](https://www.mediasfu.com/reactnativeexpo/functions/updateRoomParametersClient)     | Updates room parameters as a client.                                                                    |
| [`createDeviceClient`](https://www.mediasfu.com/reactnativeexpo/functions/createDeviceClient)             | Creates a device as a client.                                                                           |
| [`switchVideoAlt`](https://www.mediasfu.com/reactnativeexpo/functions/switchVideoAlt)                 | Switches video/camera streams.                                                                          |
| [`clickVideo`](https://www.mediasfu.com/reactnativeexpo/functions/clickVideo)                     | Handles clicking on video controls.                                                                     |
| [`clickAudio`](https://www.mediasfu.com/reactnativeexpo/functions/clickAudio)                     | Handles clicking on audio controls.                                                                     |
| [`clickScreenShare`](https://www.mediasfu.com/reactnativeexpo/functions/clickScreenShare)               | Handles clicking on screen share controls.                                                              |
| [`streamSuccessVideo`](https://www.mediasfu.com/reactnativeexpo/functions/streamSuccessVideo)             | Handles successful video streaming.                                                                     |
| [`streamSuccessAudio`](https://www.mediasfu.com/reactnativeexpo/functions/streamSuccessAudio)             | Handles successful audio streaming.                                                                     |
| [`streamSuccessScreen`](https://www.mediasfu.com/reactnativeexpo/functions/streamSuccessScreen)            | Handles successful screen sharing.                                                                      |
| [`streamSuccessAudioSwitch`](https://www.mediasfu.com/reactnativeexpo/functions/streamSuccessAudioSwitch)       | Handles successful audio switching.                                                                     |
| [`checkPermission`](https://www.mediasfu.com/reactnativeexpo/functions/checkPermission)                | Checks for media access permissions.                                                                    |
| [`producerClosed`](https://www.mediasfu.com/reactnativeexpo/functions/producerClosed)                 | Handles the closure of a producer.                                                                      |
| [`newPipeProducer`](https://www.mediasfu.com/reactnativeexpo/functions/newPipeProducer)                | Creates receive transport for a new piped producer.                                                     |
| [`updateMiniCardsGrid`](https://www.mediasfu.com/reactnativeexpo/functions/updateMiniCardsGrid)            | Updates the mini-grids (mini cards) grid.                                                               |
| [`mixStreams`](https://www.mediasfu.com/reactnativeexpo/functions/mixStreams)                     | Mixes streams and prioritizes interesting ones together.                                                |
| [`dispStreams`](https://www.mediasfu.com/reactnativeexpo/functions/dispStreams)                    | Displays streams (media).                                                                              |
| [`stopShareScreen`](https://www.mediasfu.com/reactnativeexpo/functions/stopShareScreen)                | Stops screen sharing.                                                                                  |
| [`checkScreenShare`](https://www.mediasfu.com/reactnativeexpo/functions/checkScreenShare)               | Checks for screen sharing availability.                                                                |
| [`startShareScreen`](https://www.mediasfu.com/reactnativeexpo/functions/startShareScreen)               | Starts screen sharing.                                                                                 |
| [`requestScreenShare`](https://www.mediasfu.com/reactnativeexpo/functions/requestScreenShare)             | Requests permission for screen sharing.                                                                |
| [`reorderStreams`](https://www.mediasfu.com/reactnativeexpo/functions/reorderStreams)                 | Reorders streams (based on interest level).                                                            |
| [`prepopulateUserMedia`](https://www.mediasfu.com/reactnativeexpo/functions/prepopulateUserMedia)           | Populates user media (for main grid).                                                                  |
| [`getVideos`](https://www.mediasfu.com/reactnativeexpo/functions/getVideos)                      | Retrieves videos that are pending.                                                                     |
| [`rePort`](https://www.mediasfu.com/reactnativeexpo/functions/rePort)                         | Handles re-porting (updates of changes in UI when recording).                                           |
| [`trigger`](https://www.mediasfu.com/reactnativeexpo/functions/trigger)                        | Triggers actions (reports changes in UI to backend for recording).                                      |
| [`consumerResume`](https://www.mediasfu.com/reactnativeexpo/functions/consumerResume)                 | Resumes consumers.                                                                                     |
| [`connectSendTransportAudio`](https://www.mediasfu.com/reactnativeexpo/functions/connectSendTransportAudio)      | Connects send transport for audio.                                                                     |
| [`connectSendTransportVideo`](https://www.mediasfu.com/reactnativeexpo/functions/connectSendTransportVideo)      | Connects send transport for video.                                                                     |
| [`connectSendTransportScreen`](https://www.mediasfu.com/reactnativeexpo/functions/connectSendTransportScreen)    | Connects send transport for screen sharing.                                                            |
| [`processConsumerTransports`](https://www.mediasfu.com/reactnativeexpo/functions/processConsumerTransports)      | Processes consumer transports to pause/resume based on the current active page.                         |
| [`resumePauseStreams`](https://www.mediasfu.com/reactnativeexpo/functions/resumePauseStreams)             | Resumes or pauses streams.                                                                             |
| [`readjust`](https://www.mediasfu.com/reactnativeexpo/functions/readjust)                       | Readjusts display elements.                                                                            |
| [`checkGrid`](https://www.mediasfu.com/reactnativeexpo/functions/checkGrid)                      | Checks the grid sizes to display.                                                                      |
| [`getEstimate`](https://www.mediasfu.com/reactnativeexpo/functions/getEstimate)                    | Gets an estimate of grids to add.                                                                      |
| [`calculateRowsAndColumns`](https://www.mediasfu.com/reactnativeexpo/functions/calculateRowsAndColumns)        | Calculates rows and columns for the grid.                                                              |
| [`addVideosGrid`](https://www.mediasfu.com/reactnativeexpo/functions/addVideosGrid)                  | Adds videos to the grid.                                                                               |
| [`onScreenChanges`](https://www.mediasfu.com/reactnativeexpo/functions/onScreenChanges)                | Handles screen changes (orientation and resize).                                                        |
| [`sleep`](https://www.mediasfu.com/reactnativeexpo/functions/sleep)                          | Pauses execution for a specified duration.                                                             |
| [`changeVids`](https://www.mediasfu.com/reactnativeexpo/functions/changeVids)                     | Changes videos.                                                                                        |
| [`compareActiveNames`](https://www.mediasfu.com/reactnativeexpo/functions/compareActiveNames)             | Compares active names (for recording UI changes reporting).                                             |
| [`compareScreenStates`](https://www.mediasfu.com/reactnativeexpo/functions/compareScreenStates)           | Compares screen states (for recording changes in grid sizes reporting).                                 |
| [`createSendTransport`](https://www.mediasfu.com/reactnativeexpo/functions/createSendTransport)            | Creates a send transport.                                                                              |
| [`resumeSendTransportAudio`](https://www.mediasfu.com/reactnativeexpo/functions/resumeSendTransportAudio)       | Resumes a send transport for audio.                                                                    |
| [`receiveAllPipedTransports`](https://www.mediasfu.com/reactnativeexpo/functions/receiveAllPipedTransports)      | Receives all piped transports.                                                                         |
| [`disconnectSendTransportVideo`](https://www.mediasfu.com/reactnativeexpo/functions/disconnectSendTransportVideo)   | Disconnects send transport for video.                                                                  |
| [`disconnectSendTransportAudio`](https://www.mediasfu.com/reactnativeexpo/functions/disconnectSendTransportAudio)   | Disconnects send transport for audio.                                                                  |
| [`disconnectSendTransportScreen`](https://www.mediasfu.com/reactnativeexpo/functions/disconnectSendTransportScreen)  | Disconnects send transport for screen sharing.                                                         |
| [`connectSendTransport`](https://www.mediasfu.com/reactnativeexpo/functions/connectSendTransport)           | Connects a send transport.                                                                             |
| [`getPipedProducersAlt`](https://www.mediasfu.com/reactnativeexpo/functions/getPipedProducersAlt)           | Gets piped producers.                                                                                  |
| [`signalNewConsumerTransport`](https://www.mediasfu.com/reactnativeexpo/functions/signalNewConsumerTransport)     | Signals a new consumer transport.                                                                      |
| [`connectRecvTransport`](https://www.mediasfu.com/reactnativeexpo/functions/connectRecvTransport)           | Connects a receive transport.                                                                          |
| [`reUpdateInter`](https://www.mediasfu.com/reactnativeexpo/functions/reUpdateInter)                   | Re-updates the interface based on audio decibels.                                                      |
| [`updateParticipantAudioDecibels`](https://www.mediasfu.com/reactnativeexpo/functions/updateParticipantAudioDecibels) | Updates participant audio decibels.                                                                    |
| [`closeAndResize`](https://www.mediasfu.com/reactnativeexpo/functions/closeAndResize)                 | Closes and resizes the media elements.                                                                 |
| [`autoAdjust`](https://www.mediasfu.com/reactnativeexpo/functions/autoAdjust)                     | Automatically adjusts display elements.                                                                 |
| [`switchUserVideoAlt`](https://www.mediasfu.com/reactnativeexpo/functions/switchUserVideoAlt)             | Switches user video (alternate) (back/front).                                                          |
| [`switchUserVideo`](https://www.mediasfu.com/reactnativeexpo/functions/switchUserVideo)                | Switches user video (specific video id).                                                               |
| [`switchUserAudio`](https://www.mediasfu.com/reactnativeexpo/functions/switchUserAudio)                | Switches user audio.                                                                                   |
| [`receiveRoomMessages`](https://www.mediasfu.com/reactnativeexpo/functions/receiveRoomMessages)            | Receives room messages.                                                                                |
| [`formatNumber`](https://www.mediasfu.com/reactnativeexpo/functions/formatNumber)                   | Formats a number (for broadcast viewers).                                                              |
| [`connectIps`](https://www.mediasfu.com/reactnativeexpo/functions/connectIps)                     | Connects IPs (connect to consuming servers)                                                            |
| [`startMeetingProgressTimer`](https://www.mediasfu.com/reactnativeexpo/functions/startMeetingProgressTimer)      | Starts the meeting progress timer.       |
| [`stopRecording`](https://www.mediasfu.com/reactnativeexpo/functions/stopRecording)                  | Stops the recording process. |
| [`pollUpdated`](https://www.mediasfu.com/reactnativeexpo/functions/pollUpdated)                    | Handles updated poll data. |
| [`handleVotePoll`](https://www.mediasfu.com/reactnativeexpo/functions/handleVotePoll)                 | Handles voting in a poll. |
| [`handleCreatePoll`](https://www.mediasfu.com/reactnativeexpo/functions/handleCreatePoll)               | Handles creating a poll. |
| [`handleEndPoll`](https://www.mediasfu.com/reactnativeexpo/functions/handleEndPoll)                 | Handles ending a poll. |
| [`breakoutRoomUpdated`](https://www.mediasfu.com/reactnativeexpo/functions/breakoutRoomUpdated)           | Handles updated breakout room data. |
| [`captureCanvasStream`](https://www.mediasfu.com/reactnativeexpo/functions/captureCanvasStream)            | Captures a canvas stream. |
| [`resumePauseAudioStreams`](https://www.mediasfu.com/reactnativeexpo/functions/resumePauseAudioStreams)        | Resumes or pauses audio streams. |
| [`processConsumerTransportsAudio`](https://www.mediasfu.com/reactnativeexpo/functions/processConsumerTransportsAudio)  | Processes consumer transports for audio. |

### Media Device and Stream Utility Methods

MediaSFU provides utility methods for accessing media devices and participant streams programmatically. These methods are especially useful when building custom UI components or implementing advanced media management features.

#### Available Utility Methods

| Method | Description |
|--------|-------------|
| `getMediaDevicesList` | Retrieves available media devices (cameras/microphones) on the user's system. |
| `getParticipantMedia` | Gets the media stream of a specific participant by ID or name. |

#### Usage Examples

##### 1. Get Available Media Devices

Use `getMediaDevicesList` to enumerate available video or audio input devices:

```typescript
// Get available video input devices (cameras)
const videoDevices = await getMediaDevicesList("videoinput");
console.log("Available cameras:", videoDevices);

// Get available audio input devices (microphones)  
const audioDevices = await getMediaDevicesList("audioinput");
console.log("Available microphones:", audioDevices);

// Example response format:
// [
//   { deviceId: "abc123", kind: "videoinput", label: "FaceTime HD Camera" },
//   { deviceId: "def456", kind: "videoinput", label: "External USB Camera" }
// ]
```

##### 2. Get Participant Media Streams

Use `getParticipantMedia` to retrieve a participant's video or audio stream:

```typescript
// Get participant's video stream by producer ID
const participantVideoStream = await getParticipantMedia("producerId123", "", "video");
if (participantVideoStream) {
  // Use the stream (e.g., attach to video element, process, etc.)
  console.log("Got participant video stream:", participantVideoStream);
}

// Get participant's audio stream by name
const participantAudioStream = await getParticipantMedia("", "John Doe", "audio");
if (participantAudioStream) {
  // Use the audio stream
  console.log("Got participant audio stream:", participantAudioStream);
}

// Get participant's video stream by name (if producer ID not available)
const videoByName = await getParticipantMedia("", "Alice Smith", "video");
```

#### Method Parameters

**`getMediaDevicesList(kind)`**
- `kind`: `"videoinput"` | `"audioinput"` - Type of media device to enumerate

**`getParticipantMedia(id, name, kind)`**
- `id`: `string` - Producer ID of the participant's media (optional if name provided)
- `name`: `string` - Participant's display name (optional if ID provided)  
- `kind`: `string` - Media type, either `"video"` or `"audio"` (default: `"video"`)

#### Common Use Cases

- **Device Selection UI**: Build custom device picker components
- **Advanced UI Components**: Create sophisticated media display components with stream access
- **Accessibility Features**: Implement custom audio/video processing for accessibility

These utility methods provide low-level access to MediaSFU's media management system, enabling advanced customizations while maintaining compatibility with the core MediaSFU functionality.

### Room Socket Events

In the context of a room's real-time communication, various events occur, such as user actions, room management updates, media controls, and meeting status changes. To effectively handle these events and synchronize the application's state with the server, specific functions are provided. These functions act as listeners for socket events, allowing the application to react accordingly.

#### Provided Socket Event Handling Functions

| Function                      | Explanation                                                                                             |
|-------------------------------|---------------------------------------------------------------------------------------------------------|
| [`userWaiting`](https://www.mediasfu.com/reactnativeexpo/functions/userWaiting)                 | Triggered when a user is waiting.                                                                       |
| [`personJoined`](https://www.mediasfu.com/reactnativeexpo/functions/personJoined)                | Triggered when a person joins the room.                                                                 |
| [`allWaitingRoomMembers`](https://www.mediasfu.com/reactnativeexpo/functions/allWaitingRoomMembers)       | Triggered when information about all waiting room members is received.                                  |
| [`roomRecordParams`](https://www.mediasfu.com/reactnativeexpo/functions/roomRecordParams)            | Triggered when room recording parameters are received.                                                  |
| [`banParticipant`](https://www.mediasfu.com/reactnativeexpo/functions/banParticipant)              | Triggered when a participant is banned.                                                                 |
| [`updatedCoHost`](https://www.mediasfu.com/reactnativeexpo/functions/updatedCoHost)               | Triggered when the co-host information is updated.                                                      |
| [`participantRequested`](https://www.mediasfu.com/reactnativeexpo/functions/participantRequested)        | Triggered when a participant requests access.                                                            |
| [`screenProducerId`](https://www.mediasfu.com/reactnativeexpo/functions/screenProducerId)            | Triggered when the screen producer ID is received.                                                       |
| [`updateMediaSettings`](https://www.mediasfu.com/reactnativeexpo/functions/updateMediaSettings)         | Triggered when media settings are updated.                                                               |
| [`producerMediaPaused`](https://www.mediasfu.com/reactnativeexpo/functions/producerMediaPaused)         | Triggered when producer media is paused.                                                                 |
| [`producerMediaResumed`](https://www.mediasfu.com/reactnativeexpo/functions/producerMediaResumed)        | Triggered when producer media is resumed.                                                                |
| [`producerMediaClosed`](https://www.mediasfu.com/reactnativeexpo/functions/producerMediaClosed)         | Triggered when producer media is closed.                                                                 |
| [`controlMediaHost`](https://www.mediasfu.com/reactnativeexpo/functions/controlMediaHost)            | Triggered when media control is hosted.                                                                  |
| [`meetingEnded`](https://www.mediasfu.com/reactnativeexpo/functions/meetingEnded)                | Triggered when the meeting ends.                                                                         |
| [`disconnectUserSelf`](https://www.mediasfu.com/reactnativeexpo/functions/disconnectUserSelf)          | Triggered when a user disconnects.                                                                       |
| [`receiveMessage`](https://www.mediasfu.com/reactnativeexpo/functions/receiveMessage)              | Triggered when a message is received.                                                                    |
| [`meetingTimeRemaining`](https://www.mediasfu.com/reactnativeexpo/functions/meetingTimeRemaining)        | Triggered when meeting time remaining is received.                                                        |
| [`meetingStillThere`](https://www.mediasfu.com/reactnativeexpo/functions/meetingStillThere)           | Triggered when the meeting is still active.                                                              |
| [`startRecords`](https://www.mediasfu.com/reactnativeexpo/functions/startRecords)                | Triggered when recording starts.                                                                         |
| [`reInitiateRecording`](https://www.mediasfu.com/reactnativeexpo/functions/reInitiateRecording)         | Triggered when recording needs to be re-initiated.                                                       |
| [`getDomains`](https://www.mediasfu.com/reactnativeexpo/functions/getDomains)                  | Triggered when domains are received.                                                                     |
| [`updateConsumingDomains`](https://www.mediasfu.com/reactnativeexpo/functions/updateConsumingDomains)      | Triggered when consuming domains are updated.                                                            |
| [`recordingNotice`](https://www.mediasfu.com/reactnativeexpo/functions/recordingNotice)             | Triggered when a recording notice is received.                                                           |
| [`timeLeftRecording`](https://www.mediasfu.com/reactnativeexpo/functions/timeLeftRecording)           | Triggered when time left for recording is received.                                                       |
| [`stoppedRecording`](https://www.mediasfu.com/reactnativeexpo/functions/stoppedRecording)           | Triggered when recording stops.                                                                          |
| [`hostRequestResponse`](https://www.mediasfu.com/reactnativeexpo/functions/hostRequestResponse)         | Triggered when the host request response is received.                                                    |
| [`allMembers`](https://www.mediasfu.com/reactnativeexpo/functions/allMembers)                  | Triggered when information about all members is received.                                                 |
| [`allMembersRest`](https://www.mediasfu.com/reactnativeexpo/functions/allMembersRest)              | Triggered when information about all members is received (rest of the members).                           |
| [`disconnect`](https://www.mediasfu.com/reactnativeexpo/functions/disconnect)                  | Triggered when a disconnect event occurs.                                                                |
| [`pollUpdated`](https://www.mediasfu.com/reactnativeexpo/functions/pollUpdated)                 | Triggered when a poll is updated.                                                                        |
| [`breakoutRoomUpdated`](https://www.mediasfu.com/reactnativeexpo/functions/breakoutRoomUpdated)         | Triggered when a breakout room is updated.                                                               |

#### Sample Usage

```javascript
// Example usage of provided socket event handling functions

import { participantRequested, screenProducerId, updateMediaSettings } from 'mediasfu-reactnative-expo'

socket.current.on(
"participantRequested",
async ({ userRequest }: { userRequest: Request }) => {
    await participantRequested({
    userRequest,
    requestList: requestList.current,
    waitingRoomList: waitingRoomList.current,
    updateTotalReqWait,
    updateRequestList,
    });
}
);

socket.current.on(
"screenProducerId",
async ({ producerId }: { producerId: string }) => {
    screenProducerId({
    producerId,
    screenId: screenId.current,
    membersReceived: membersReceived.current,
    shareScreenStarted: shareScreenStarted.current,
    deferScreenReceived: deferScreenReceived.current,
    participants: participants.current,
    updateScreenId,
    updateShareScreenStarted,
    updateDeferScreenReceived,
    });
}
);

socket.current.on(
"updateMediaSettings",
async ({ settings }: { settings: Settings }) => {
    updateMediaSettings({
    settings,
    updateAudioSetting,
    updateVideoSetting,
    updateScreenshareSetting,
    updateChatSetting,
    });
}
);
```

These functions enable seamless interaction with the server and ensure that the application stays synchronized with the real-time events occurring within the room.

### Customizing Media Display in MediaSFU

By default, media display in MediaSFU is handled by the following key functions:

- **`prepopulateUserMedia`**: This function controls the main media grid, such as the host's video in webinar or broadcast views (MainGrid).
- **`addVideosGrid`**: This function manages the mini grid's media, such as participants' media in MiniGrid views (MiniCards, AudioCards, VideoCards).

#### Customizing the Media Display

If you want to modify the default content displayed by MediaSFU components, such as the `MiniCard`, `AudioCard`, or `VideoCard`, you can replace the default UI with your own custom components.

To implement your custom UI for media display:

1. **Custom MainGrid (Host's Video)**:
   - Modify the UI in the `prepopulateUserMedia` function.
   - Example link to MediaSFU's default implementation: [`prepopulateUserMedia`](https://github.com/MediaSFU/MediaSFU-ReactNative-Expo/blob/main/src/consumers/prepopulateUserMedia.tsx).

2. **Custom MiniGrid (Participants' Media)**:
   - Modify the UI in the `addVideosGrid` function.
   - Example link to MediaSFU's default implementation: [`addVideosGrid`](https://github.com/MediaSFU/MediaSFU-ReactNative-Expo/blob/main/src/consumers/addVideosGrid.tsx).

To create a custom UI, you can refer to existing MediaSFU implementations like:

- [MediasfuGeneric](https://github.com/MediaSFU/MediaSFU-ReactNative-Expo/blob/main/src/components/mediasfuComponents/MediasfuGeneric.tsx)
- [MediasfuBroadcast](https://github.com/MediaSFU/MediaSFU-ReactNative-Expo/blob/main/src/components/mediasfuComponents/MediasfuBroadcast.tsx)

Once your custom components are built, modify the imports of `prepopulateUserMedia` and `addVideosGrid` to point to your custom implementations instead of the default MediaSFU ones.

This allows for full flexibility in how media is displayed in both the main and mini grids, giving you the ability to tailor the user experience to your specific needs.

# API Reference <a name="api-reference"></a>

For detailed information on the API methods and usage, please refer to the [MediaSFU API Documentation](https://mediasfu.com/developers).

If you need further assistance or have any questions, feel free to ask!

For sample codes and practical implementations, visit the [MediaSFU Sandbox](https://www.mediasfu.com/sandbox).

---

## Media Device and Stream Utility Methods <a name="media-device-and-stream-utility-methods"></a>

MediaSFU provides utility methods for accessing media devices and participant streams programmatically. These methods are especially useful when building custom UI components or implementing advanced media management features.

### Available Utility Methods

| Method | Description |
|--------|-------------|
| `getMediaDevicesList` | Retrieves available media devices (cameras/microphones) on the user's system. |
| `getParticipantMedia` | Gets the media stream of a specific participant by ID or name. |

### Usage Examples

#### 1. Get Available Media Devices

Use `getMediaDevicesList` to enumerate available video or audio input devices:

```typescript
// Get available video input devices (cameras)
const videoDevices = await parameters.getMediaDevicesList("videoinput");
console.log("Available cameras:", videoDevices);

// Get available audio input devices (microphones)  
const audioDevices = await parameters.getMediaDevicesList("audioinput");
console.log("Available microphones:", audioDevices);

// Example response format:
// [
//   { deviceId: "abc123", kind: "videoinput", label: "FaceTime HD Camera" },
//   { deviceId: "def456", kind: "videoinput", label: "External USB Camera" }
// ]
```

#### 2. Get Participant Media Streams

Use `getParticipantMedia` to retrieve a participant's video or audio stream:

```typescript
import { getParticipantMedia } from 'mediasfu-reactnative-expo';

// Get participant's video stream by producer ID
const participantVideoStream = getParticipantMedia({
  participantId: "producerId123",
  participantName: "",
  mediaType: "video",
  parameters: sourceParameters
});

if (participantVideoStream) {
  // Use the stream (e.g., attach to video element, process, etc.)
  console.log("Got participant video stream:", participantVideoStream);
}

// Get participant's audio stream by name
const participantAudioStream = getParticipantMedia({
  participantId: "",
  participantName: "John Doe",
  mediaType: "audio",
  parameters: sourceParameters
});

if (participantAudioStream) {
  // Use the audio stream
  console.log("Got participant audio stream:", participantAudioStream);
}

// Get participant's video stream by name (if producer ID not available)
const videoByName = getParticipantMedia({
  participantId: "",
  participantName: "Alice Smith",
  mediaType: "video",
  parameters: sourceParameters
});
```

### Method Parameters

**`getMediaDevicesList(kind)`**
- `kind`: `"videoinput"` | `"audioinput"` - Type of media device to enumerate
- **Returns**: `Promise<MediaDeviceInfo[]>` - Array of available media devices

**`getParticipantMedia(options)`**
- `participantId`: `string` - Producer ID of the participant's media (optional if name provided)
- `participantName`: `string` - Participant's display name (optional if ID provided)  
- `mediaType`: `"video" | "audio"` - Media type to retrieve (default: `"video"`)
- `parameters`: `object` - MediaSFU parameters object containing participant and stream data
- **Returns**: `MediaStream | null` - The participant's media stream or null if not found

### Common Use Cases

- **Device Selection UI**: Build custom device picker components allowing users to choose their preferred camera/microphone
- **Advanced UI Components**: Create sophisticated media display components with direct stream access for custom rendering
- **Participant Monitoring**: Build administrative interfaces to monitor specific participants' streams
- **Custom Recording**: Implement custom recording logic for specific participants
- **Accessibility Features**: Implement custom audio/video processing for accessibility enhancements
- **Stream Analysis**: Analyze participant streams for quality monitoring or content detection

### Important Notes

- **Permissions**: `getMediaDevicesList` automatically handles permission requests for accessing cameras and microphones
- **Stream Availability**: `getParticipantMedia` returns `null` if the participant or their stream is not found
- **Participant Identification**: You can use either `participantId` (producer ID) or `participantName` to identify participants
- **Real-time Updates**: These methods provide access to the current state; use MediaSFU's event system for real-time updates

These utility methods provide low-level access to MediaSFU's media management system, enabling advanced customizations while maintaining compatibility with the core MediaSFU functionality.

---

# Troubleshooting <a name="troubleshooting"></a>

If you encounter issues while setting up or running the `mediasfu-reactnative-expo` module with Expo, the following solutions may help resolve common problems.

## 1. Testing on an Actual Device

To test your application on a physical device, use the following command:

```bash
npx expo start
```

**Note:** `react-native-webrtc` does not run on Expo Go. You will need to create a development build to test WebRTC functionalities on your device. Follow the [Expo Development Builds documentation](https://docs.expo.dev/development/introduction/) for guidance on creating a development build.

## 2. Resolving Metro Bundler Issues

Metro bundler issues can often be resolved by ensuring your configuration files are set up correctly. Follow the steps below to configure Metro for your Expo project.

### a. Configure `metro.config.js`

Ensure your `metro.config.js` file includes the correct settings:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

module.exports = config;
```

### b. Update `app.json`

Make sure that the `app.json` file does not have the `output` field set to `'static'` in the web configuration. Remove or clear this field to prevent build issues.

```json
{
  "expo": {
    // ... other configurations
    "web": {
      // Remove or ensure the output field is not set to 'static'
      // "output": "static" // This line should be removed or cleared
    }
  }
}
```

### c. Configure `babel.config.js`

Your `babel.config.js` should include the necessary presets and plugins for Expo and React Native Reanimated. Here is an example configuration:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-block-scoping'
    ],
  };
};
```

## Additional Tips

- **Clear Cache:** Sometimes, clearing the Metro bundler cache can resolve unexpected issues. You can do this by running:

  ```bash
  npx expo start -c
  ```

- **Ensure Dependencies are Installed:** Make sure all required dependencies are installed correctly. You can reinstall them using:

  ```bash
  npm install
  # or
  yarn install
  ```

- **Check for Updates:** Ensure that you are using the latest versions of Expo and `mediasfu-reactnative-expo` by checking their respective repositories and updating if necessary.

For more detailed information, refer to the [Expo Documentation](https://docs.expo.dev/) and the [mediasfu-reactnative-expo GitHub Repository](https://github.com/MediaSFU/MediaSFU-ReactNative-Expo).

## 3. **Interactive Testing with MediaSFU's Frontend**

   Users can interactively join MediaSFU's frontend in the same room to analyze if various events or media transmissions are happening as expected. For example, adding a user there to check changes made by the host and vice versa.

These troubleshooting steps should help users address common issues and optimize their experience with MediaSFU. If the issues persist or additional assistance is needed, users can refer to the [documentation](https://mediasfu.com/docs) or reach out to the support team for further assistance.


https://github.com/user-attachments/assets/310cb87c-dade-445d-aee7-dea1889d6dc4


# Contributing <a name="contributing"></a>

We welcome contributions from the community to improve the project! If you'd like to contribute, please check out our [GitHub repository](https://github.com/MediaSFU-ReactNative-Expo) and follow the guidelines outlined in the README.

If you encounter any issues or have suggestions for improvement, please feel free to open an issue on GitHub.

We appreciate your interest in contributing to the project!

If you need further assistance or have any questions, feel free to ask!




