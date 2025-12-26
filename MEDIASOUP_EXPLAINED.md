# Complete 1:1 Video Call Flow - Step-by-Step Walkthrough

This document walks through **exactly** what happens in your code when a user makes a video call, from button press to call end.

---

## 🎬 The Complete Call Journey

### **Phase 1: User Initiates Call (Caller Side)**

#### Step 1: User Presses Video Call Button
**Location:** Somewhere in your UI (e.g., `NewCall.js` or contact screen)

**What happens:**
- User clicks the video call button
- Your UI component calls `startCall(partnerId, 'video')` from the RTC context

---

#### Step 2: `startCall()` Function Begins
**Location:** `client/context/rtc.js` - Line 535

```javascript
const startCall = async (partnerId, callType) => {
```

**What this function does:**
- Takes `partnerId` (who you're calling) and `callType` ('video' or 'audio')
- This is the **entry point** for outgoing calls

---

#### Step 3: Get Local Media Stream
**Location:** `client/context/rtc.js` - Line 536

```javascript
const stream = await getLocalStream(callType);
setLocalStream(stream);
```

**What happens:**
1. Calls `getLocalStream(callType)` - Line 195
2. This function calls `mediaDevices.getUserMedia()` from `react-native-webrtc`
3. Requests access to:
   - **Audio:** Always `true` (microphone)
   - **Video:** `true` if `callType === 'video'`, otherwise `false`
4. Returns a `MediaStream` object containing your camera/mic tracks
5. Stores it in React state: `setLocalStream(stream)`
   - This stream will be displayed in the UI as your "local video" preview

**Backend:** Nothing happens yet - this is all local device access.

---

#### Step 4: Send 'start-call' Socket Event
**Location:** `client/context/rtc.js` - Line 539

```javascript
socket.current.emit(
  'start-call',
  { toUserId: partnerId, callType },
  async ({ callId, rtpCapabilities, sendTransport, recvTransport }) => {
    // Callback function - runs when server responds
  }
);
```

**What happens:**
- Emits a socket event `'start-call'` to the backend
- Sends:
  - `toUserId`: The person you're calling
  - `callType`: 'video' or 'audio'
- The third parameter is a **callback function** that will run when the server responds

**Backend:** 
- Server receives `'start-call'` event
- Creates a new `callId` (UUID)
- Creates a mediasoup `Router` (handles media routing for this call)
- Creates two transports:
  - `sendTransport` (for you to send media)
  - `recvTransport` (for you to receive media)
- Stores all this in `activeCalls` map
- Sends `'incoming-call'` event to the callee (the person you're calling)
- **Responds to caller** with:
  - `callId`: Unique ID for this call
  - `rtpCapabilities`: Server's supported codecs
  - `sendTransport`: Transport parameters (ICE candidates, DTLS params)
  - `recvTransport`: Transport parameters

---

#### Step 5: Server Response Callback Executes
**Location:** `client/context/rtc.js` - Line 542

```javascript
async ({ callId, rtpCapabilities, sendTransport, recvTransport }) => {
  currentCallId.current = callId;
  
  await initDevice(rtpCapabilities);
  await createRecvTransport(recvTransport);
  await createSendTransport(sendTransport);
  await produce(stream, callType);
  
  setInfo({ id: partnerId, callId, type: callType });
  setType('Outgoing');
  
  InCallManager.start({ ringback: 'DEFAULT' });
}
```

**What happens step-by-step:**

**5a. Store Call ID**
```javascript
currentCallId.current = callId;
```
- Stores the call ID in a ref (persists across re-renders)
- Used for all subsequent socket events

---

**5b. Initialize Device**
```javascript
await initDevice(rtpCapabilities);
```

**Location:** `client/context/rtc.js` - Line 186

```javascript
const initDevice = async (rtpCapabilities) => {
  if (device.current) return;  // Already initialized? Skip
  
  device.current = new mediasoupClient.Device();
  await device.current.load({ routerRtpCapabilities: rtpCapabilities });
};
```

**What happens:**
1. Creates a new `Device` instance
   - Think of this as your "media capabilities profile"
   - It knows what codecs your device supports
2. Calls `device.load()` with server's `rtpCapabilities`
   - Server tells you: "I support VP8, H264, Opus, etc."
   - Device compares: "I support VP8, Opus, etc."
   - Device creates a "negotiated" set of codecs both can use
   - **This negotiation is critical** - both sides must agree on codecs

**Backend:** Nothing - this is client-side negotiation.

---

**5c. Create Receive Transport**
```javascript
await createRecvTransport(recvTransport);
```

**Location:** `client/context/rtc.js` - Line 239

```javascript
const createRecvTransport = async (params) => {
  recvTransport.current = device.current.createRecvTransport({...params, iceServers});
  
  recvTransport.current.on('connect', ({ dtlsParameters }, cb) => {
    socket.current.emit(
      'connect-transport',
      { callId: currentCallId.current, transportId: params.id, dtlsParameters },
      (response) => {
        if (response?.error) {
          cb(response.error);
        } else {
          cb();
        }
      }
    );
  });
  
  recvTransport.current.on('connectionstatechange', (state) => {
    // Monitor connection state
  });
};
```

**What happens:**
1. Creates a **receive transport** using `device.createRecvTransport()`
   - `params` comes from server (ICE candidates, DTLS parameters, transport ID)
   - Also passes `iceServers` (STUN/TURN servers for NAT traversal)
   - This transport will be used to **receive** media from the other person

2. Sets up `'connect'` event handler
   - This event fires **automatically** when mediasoup needs to establish the secure connection
   - When it fires:
     - Gets `dtlsParameters` (security/encryption parameters)
     - Sends `'connect-transport'` socket event to backend
     - Backend connects the transport on its side
     - Calls `cb()` to tell mediasoup "connection successful"

3. Sets up `'connectionstatechange'` event handler
   - Monitors transport connection state (new → connecting → connected)
   - Used for debugging/error handling

**Backend:**
- When `'connect-transport'` event arrives:
  - Finds the transport by ID
  - Calls `transport.connect({ dtlsParameters })`
  - This establishes the DTLS (encryption) connection
  - Responds with success/error

**Important:** The transport is **not connected yet** - it will connect when you first try to use it (e.g., when consuming).

---

**5d. Create Send Transport**
```javascript
await createSendTransport(sendTransport);
```

**Location:** `client/context/rtc.js` - Line 204

```javascript
const createSendTransport = async (params) => {
  sendTransport.current = device.current.createSendTransport({...params, iceServers});
  
  sendTransport.current.on('connect', ({ dtlsParameters }, cb) => {
    socket.current.emit(
      'connect-transport',
      { callId: currentCallId.current, transportId: params.id, dtlsParameters },
      (response) => {
        if (response?.error) {
          cb(response.error);
        } else {
          cb();
        }
      }
    );
  });
  
  sendTransport.current.on('produce', ({ kind, rtpParameters }, cb) => {
    socket.current.emit(
      'create-producer',
      {
        callId: currentCallId.current,
        transportId: params.id,
        kind,
        rtpParameters,
      },
      ({ producerId }) => cb({ id: producerId })
    );
  });
  
  sendTransport.current.on('connectionstatechange', (state) => {
    // Monitor connection state
  });
};
```

**What happens:**
1. Creates a **send transport** (similar to recv transport)
   - This transport will be used to **send** your media to the server

2. Sets up `'connect'` event handler
   - Same as recv transport - establishes secure connection when needed

3. Sets up `'produce'` event handler
   - **This is important!** When you call `transport.produce()`, this event fires
   - Gets `kind` ('audio' or 'video') and `rtpParameters` (encoding parameters)
   - Sends `'create-producer'` socket event to backend
   - Backend creates a producer and returns `producerId`
   - Calls `cb({ id: producerId })` - **this tells mediasoup the producer ID**

**Backend:**
- When `'create-producer'` event arrives:
  - Creates a producer on the server's send transport
  - Stores it in the peer's producers map
  - **Notifies all other participants** via `'new-producer'` event
  - Returns `producerId` to the caller

---

**5e. Produce Media (Start Sending)**
```javascript
await produce(stream, callType);
```

**Location:** `client/context/rtc.js` - Line 263

```javascript
const produce = async (stream, callType) => {
  const audio = stream.getAudioTracks()[0];
  const video = stream.getVideoTracks()[0];
  
  if (audio) producers.current.set('audio', await sendTransport.current.produce({ track: audio }));
  if (callType === 'video' && video)
    producers.current.set('video', await sendTransport.current.produce({ track: video }));
};
```

**What happens:**
1. Gets audio and video tracks from your local stream
2. For **audio track:**
   - Calls `sendTransport.current.produce({ track: audio })`
   - This triggers the `'produce'` event handler (line 221)
   - Event handler sends `'create-producer'` to backend
   - Backend creates producer and returns `producerId`
   - Stores the producer in `producers.current` Map with key `'audio'`

3. For **video track** (if `callType === 'video'`):
   - Same process as audio
   - Stores producer with key `'video'`

**What `produce()` does internally:**
- Takes your `MediaStreamTrack` (from camera/mic)
- Encodes it using the negotiated codec (e.g., VP8 for video, Opus for audio)
- Starts sending encoded frames through the send transport to the server
- The `'produce'` event fires, which sends RTP parameters to backend

**Backend:**
- Creates producers for your audio/video
- Stores them in the server's peer data
- **Emits `'new-producer'` events to all other participants** (in this case, the callee)
- Each `'new-producer'` event contains `{ producerId, kind }`

---

**5f. Update UI State**
```javascript
setInfo({ id: partnerId, callId, type: callType });
setType('Outgoing');
InCallManager.start({ ringback: 'DEFAULT' });
```

**What happens:**
- `setInfo()`: Stores call information (who you're calling, call ID, call type)
- `setType('Outgoing')`: Tells UI this is an outgoing call
- `InCallManager.start()`: Starts playing ringback tone (the "ringing" sound you hear)

**UI:** Your app should now show the "Outgoing Call" screen with your local video preview.

---

### **Phase 2: Callee Receives Call (Callee Side)**

#### Step 6: Callee Receives 'incoming-call' Event
**Location:** `client/context/rtc.js` - Line 81

```javascript
socket.current.on('incoming-call', async (data) => {
  const { callId, fromUserId, callType, rtpCapabilities } = data;
```

**What happens:**
- Backend sends `'incoming-call'` event to the callee
- Contains: `callId`, `fromUserId` (caller's ID), `callType`, `rtpCapabilities`

---

#### Step 7: Callee Processes Incoming Call
**Location:** `client/context/rtc.js` - Line 82-152

```javascript
// Get caller name from contacts
let callerName = fromUserId.toString();
// ... (looks up caller name in contacts list)

currentCallId.current = callId;
setInfo({ id: fromUserId, callId, type: callType, name: callerName });
setType('Incoming');

await initDevice(rtpCapabilities);

const stream = await getLocalStream(callType);
setLocalStream(stream);

// ... (UUID handling for VoIP push notifications)

// Show incoming call UI
if (!isAppActive) {
  RNCallKeep.displayIncomingCall(...);  // Native call UI
} else {
  InCallManager.startRingtone();
  navigate('Incoming Call');  // Custom UI
}
```

**What happens:**
1. Looks up caller's name from contacts
2. Stores call info and sets type to `'Incoming'`
3. Initializes device with server's RTP capabilities
4. Gets local media stream (camera/mic access)
5. Shows incoming call UI (either native or custom)

**UI:** Callee sees incoming call screen with caller's name and local video preview.

---

### **Phase 3: Callee Accepts Call**

#### Step 8: Callee Calls `processAccept()`
**Location:** `client/context/rtc.js` - Line 558

```javascript
const processAccept = async () => {
  socket.current.emit(
    'accept-call',
    { callId: info.callId, fromUserId: info.id },
    async ({ sendTransport, recvTransport }) => {
      // Callback when server responds
    }
  );
};
```

**What happens:**
- Sends `'accept-call'` socket event to backend
- Sends `callId` and `fromUserId` (caller's ID)

**Backend:**
- Receives `'accept-call'` event
- Creates transports for the callee (sendTransport and recvTransport)
- **Sends `'new-producer'` events to callee** for any existing producers (caller's audio/video)
- Sends `'call-accepted'` event to caller
- Responds to callee with transport parameters

---

#### Step 9: Callee Sets Up Transports
**Location:** `client/context/rtc.js` - Line 562

```javascript
async ({ sendTransport, recvTransport }) => {
  const stream = localStream || (await getLocalStream(info.type));
  setLocalStream(stream);
  
  await createRecvTransport(recvTransport);
  await createSendTransport(sendTransport);
  
  setType('Join');
  await produce(stream, info.type);
  
  InCallManager.stopRingtone();
  RNCallKeep.endAllCalls();
}
```

**What happens:**
1. Gets or creates local stream
2. Creates receive transport (to receive caller's media)
3. Creates send transport (to send own media)
4. Sets type to `'Join'` (call is active)
5. **Produces own media** (starts sending audio/video)
6. Stops ringtone

**Backend:**
- When callee produces media:
  - Server creates producers
  - **Sends `'new-producer'` events to caller** (so caller can receive callee's media)

---

#### Step 10: Callee Receives Caller's Media
**Location:** `client/context/rtc.js` - Line 172

```javascript
socket.current.on('new-producer', async ({ producerId, kind }) => {
  await consume(producerId);
});
```

**What happens:**
- When callee's transports are created, backend sends `'new-producer'` events
- These are the caller's audio/video producers
- For each producer, calls `consume(producerId)`

---

### **Phase 4: Media Consumption (Receiving Remote Media)**

#### Step 11: `consume()` Function - The Heart of Receiving Media
**Location:** `client/context/rtc.js` - Line 361

```javascript
const consume = async (producerId) => {
```

**This function does a LOT. Let's break it down:**

---

**11a. Validation Checks**
```javascript
if (!recvTransport.current) {
  return;  // Can't consume without receive transport
}

if (!device.current) {
  return;  // Can't consume without device
}
```

**What happens:**
- Checks that receive transport and device are initialized
- If not, exits early (safety check)

---

**11b. Request Consumer from Server**
```javascript
const data = await new Promise((resolve, reject) => {
  socket.current.emit(
    'create-consumer',
    {
      callId: currentCallId.current,
      producerId,
      rtpCapabilities: device.current.rtpCapabilities,
    },
    (response) => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    }
  );
});
```

**What happens:**
- Sends `'create-consumer'` socket event to backend
- Sends:
  - `callId`: Which call this is for
  - `producerId`: Which producer you want to consume (e.g., caller's video)
  - `rtpCapabilities`: Your device's codec capabilities

**Backend:**
- Finds the producer (e.g., caller's video producer)
- Checks if your device can consume it (`router.canConsume()`)
- Creates a consumer on the server's receive transport
- **Consumer is created PAUSED** (mediasoup default)
- Returns consumer data: `{ id, producerId, kind, rtpParameters }`

---

**11c. Create Consumer on Client**
```javascript
const consumer = await recvTransport.current.consume(data);
```

**What happens:**
- Calls `recvTransport.consume(data)` with the data from server
- This creates a consumer on the client side
- **If recvTransport isn't connected yet, this triggers the `'connect'` event**
- The `'connect'` event handler (line 242) sends `'connect-transport'` to backend
- Backend connects the transport
- Consumer is created, but **still paused**

**Important:** The consumer now exists, but no media is flowing yet because it's paused.

---

**11d. Wait for Transport Connection**
```javascript
try {
  await ensureRecvTransportConnected();
} catch (error) {
  // Transport not connected - continue anyway
}
```

**Location:** `client/context/rtc.js` - Line 275

**What `ensureRecvTransportConnected()` does:**
- Checks if transport is already connected
- If not, sets up event listeners and polling
- Waits up to 30 seconds for transport to reach `'connected'` or `'completed'` state
- This ensures ICE/DTLS negotiation is complete before trying to receive media

**Why this matters:**
- Transport might be in `'new'` or `'connecting'` state
- Media won't flow until transport is fully connected
- This function ensures connection is established

---

**11e. Store Consumer**
```javascript
consumers.current.set(producerId, consumer);
```

**What happens:**
- Stores the consumer in a Map, keyed by `producerId`
- This allows you to find/close the consumer later
- Example: `consumers.current.get('audio-producer-id')` returns the audio consumer

---

**11f. Resume Consumer (CRITICAL!)**
```javascript
socket.current.emit('resume-consumer', {
  callId: currentCallId.current,
  consumerId: consumer.id,
}, (response) => {
  // Server resume response
});

await consumer.resume();
```

**What happens:**
1. **Server-side resume:**
   - Sends `'resume-consumer'` socket event to backend
   - Backend finds the consumer and calls `consumer.resume()`
   - This tells the mediasoup server: "Start forwarding media to this consumer"

2. **Client-side resume:**
   - Calls `consumer.resume()` on the client
   - This tells the client-side consumer: "Start processing received media"

**Why both?**
- Server resume: Starts media forwarding from server to client
- Client resume: Starts processing the received media frames
- **Both are required** for media to flow!

**Backend:**
- Receives `'resume-consumer'` event
- Finds consumer by ID
- Calls `consumer.resume()` on server side
- Media starts flowing from producer → server → consumer

---

**11g. Wait for Track to Be Ready**
```javascript
let attempts = 0;
while (consumer.track?.readyState !== 'live' && attempts < 20) {
  await new Promise(resolve => setTimeout(resolve, 50));
  attempts++;
}
```

**What happens:**
- Waits for `consumer.track.readyState` to become `'live'`
- Polls every 50ms, up to 20 attempts (1 second total)
- `readyState: 'live'` means the track is active and receiving data

**Why wait?**
- Track might not be ready immediately after resume
- Need to ensure track is actually receiving data before adding to stream

---

**11h. Wait for Video Frames (Video Only)**
```javascript
if (consumer.kind === 'video' && consumer.track) {
  let frameAttempts = 0;
  const maxFrameAttempts = 60;
  
  while (consumer.track.muted && frameAttempts < maxFrameAttempts) {
    await new Promise(resolve => setTimeout(resolve, 50));
    frameAttempts++;
  }
}
```

**What happens:**
- For video tracks, also waits for frames to actually arrive
- `track.muted: true` means no frames are arriving yet
- Waits up to 3 seconds (60 attempts × 50ms) for track to unmute
- `track.muted: false` means frames are arriving

**Why this matters:**
- Track can be `readyState: 'live'` but still `muted: true`
- This happens when connection exists but frames haven't arrived yet
- Adding a muted track to the stream would show a black screen

---

**11i. Create/Get Remote Stream**
```javascript
if (!remoteStreamRef.current) {
  remoteStreamRef.current = new MediaStream();
}
```

**What happens:**
- Creates a single `MediaStream` for all remote tracks
- Uses a ref so it persists across re-renders
- **Single stream is important** for React Native's `RTCView` component

---

**11j. Add Track to Stream**
```javascript
const track = consumer.track;
if (track && track.readyState === 'live') {
  const existingTracks = remoteStreamRef.current.getTracks();
  const trackExists = existingTracks.some(t => t.id === track.id);
  
  if (!trackExists) {
    remoteStreamRef.current.addTrack(track);
    // ... (event listeners for mute/unmute)
  }
}
```

**What happens:**
1. Gets the track from the consumer
2. Checks if track is `'live'`
3. Checks if track is already in the stream (avoid duplicates)
4. Adds track to the stream using `addTrack()`
5. Sets up event listeners for mute/unmute events (for video tracks)

**Event Listeners (Video Tracks Only):**
- `'mute'` event: Fired when track stops receiving frames (user turned off video)
- `'unmute'` event: Fired when track starts receiving frames
- `enabled` polling: Checks every 500ms if track was disabled (user turned off video)
- These listeners update `remoteStreamTracksCount` to force UI re-renders

---

**11k. Update React State**
```javascript
const tracksCount = remoteStreamRef.current.getTracks().length;

setRemoteStream(remoteStreamRef.current);
setRemoteStreamTracksCount(tracksCount);
```

**What happens:**
- Updates React state with the remote stream
- Updates track count (triggers re-render)
- **UI components** (like `VideoCall.js`) will re-render and display the remote video

**UI:** The remote video should now appear on screen!

---

### **Phase 5: Caller Receives Callee's Media**

#### Step 12: Caller Receives 'new-producer' Events
**Location:** `client/context/rtc.js` - Line 172

**What happens:**
- When callee produces media (Step 9), backend sends `'new-producer'` events to caller
- Caller receives events for callee's audio and video producers
- For each producer, calls `consume(producerId)` (same process as Step 11)

**Result:** Both sides now have:
- ✅ Their own media being sent (producers)
- ✅ Other person's media being received (consumers)
- ✅ Remote video/audio displayed in UI

---

### **Phase 6: Active Call**

#### Step 13: Call is Active
**What's happening:**
- Both users can see and hear each other
- Media is flowing:
  - **Your camera/mic** → Send Transport → Server → Other person's Receive Transport → Their screen/speakers
  - **Their camera/mic** → Send Transport → Server → Your Receive Transport → Your screen/speakers

**UI State:**
- `type: 'Join'` (both sides)
- `localStream`: Your camera/mic
- `remoteStream`: Other person's camera/mic
- Both streams displayed in `VideoCall.js` component

---

### **Phase 7: Call Ends**

#### Step 14: User Hangs Up - `endCall()` Function
**Location:** `client/context/rtc.js` - Line 578

```javascript
const endCall = async () => {
```

**What happens step-by-step:**

**14a. Notify Server**
```javascript
if (socket.current && currentCallId.current) {
  try {
    socket.current.emit('end-call', { callId: currentCallId.current });
  } catch (e) {
    // Error notifying server
  }
}
```

**Backend:**
- Receives `'end-call'` event
- Closes all producers and consumers for all participants
- Closes all transports
- Closes the router
- Removes call from `activeCalls` map
- Sends `'call-ended'` event to all participants

---

**14b. Clean Up Track Monitoring**
```javascript
if (remoteStreamRef.current) {
  remoteStreamRef.current.getTracks().forEach(track => {
    if (track._enabledCheckInterval) {
      clearInterval(track._enabledCheckInterval);
    }
    if (track._muteEventTimeout) {
      clearTimeout(track._muteEventTimeout);
      track._muteEventTimeout = null;
    }
    if (track._frameWaitInterval) {
      clearInterval(track._frameWaitInterval);
      track._frameWaitInterval = null;
    }
  });
}
```

**What happens:**
- Cleans up all intervals and timeouts set up for track monitoring
- Prevents memory leaks

---

**14c. Close Producers**
```javascript
producers.current.forEach(p => p.close());
```

**What happens:**
- Closes all producers (stops sending media)
- Each producer's `close()` method:
  - Stops the media track
  - Closes the producer on server side
  - Frees resources

---

**14d. Close Consumers**
```javascript
consumers.current.forEach(c => {
  // Clean up intervals/timeouts on consumer tracks
  if (c.track?._enabledCheckInterval) {
    clearInterval(c.track._enabledCheckInterval);
  }
  // ... (more cleanup)
  c.close();
});
```

**What happens:**
- Cleans up consumer track monitoring
- Closes all consumers (stops receiving media)
- Each consumer's `close()` method:
  - Stops processing received media
  - Closes the consumer on server side
  - Frees resources

---

**14e. Close Transports**
```javascript
sendTransport.current?.close();
recvTransport.current?.close();
```

**What happens:**
- Closes send transport (stops sending capability)
- Closes receive transport (stops receiving capability)
- This closes the WebRTC connections

---

**14f. Clear Maps and Refs**
```javascript
producers.current.clear();
consumers.current.clear();

setLocalStream(null);
setRemoteStream(null);
setRemoteStreamTracksCount(0);
setType('');
setInfo({});

device.current = null;
currentCallId.current = null;
remoteStreamRef.current = null;
```

**What happens:**
- Clears all stored producers/consumers
- Resets all React state
- Clears all refs
- **Everything is back to initial state**

---

**14g. Clean Up Native Modules**
```javascript
InCallManager.stop();
RNCallKeep.endAllCalls();
await AsyncStorage.removeItem('incomingCallData');
```

**What happens:**
- Stops InCallManager (releases audio session)
- Ends all CallKeep calls (native call UI)
- Removes stored call data

---

#### Step 15: Other Side Receives 'call-ended' Event
**Location:** `client/context/rtc.js` - Line 177

```javascript
socket.current.on('call-ended', () => {
  endCall();
});
```

**What happens:**
- When one person hangs up, backend sends `'call-ended'` to the other person
- Other person's `endCall()` function runs (same cleanup process)

---

## 🎯 Key Takeaways

### The Flow Summary:
1. **Caller:** `startCall()` → Get media → Create transports → Produce → Wait for callee
2. **Callee:** Receive `'incoming-call'` → Accept → Create transports → Produce → Consume caller's media
3. **Caller:** Receive `'new-producer'` → Consume callee's media
4. **Both:** Media flowing both ways
5. **Either:** `endCall()` → Clean up everything

### Critical Points:
- **Consumers are paused by default** - must resume on both client AND server
- **Transport must be connected** before consuming (ICE/DTLS negotiation)
- **Tracks can be 'live' but muted** - wait for frames to actually arrive
- **Single MediaStream** - add all remote tracks to one stream for RTCView
- **Producer/Consumer model** - explicit control over what you send/receive

### Socket Events Flow:
```
Caller → 'start-call' → Backend → 'incoming-call' → Callee
Callee → 'accept-call' → Backend → 'call-accepted' → Caller
Backend → 'new-producer' → Both sides (when media is produced)
Both → 'create-consumer' → Backend
Both → 'resume-consumer' → Backend
Both → 'connect-transport' → Backend (when transport needs to connect)
Either → 'end-call' → Backend → 'call-ended' → Other side
```

---

## 📚 Code Reference

All code references are from:
- **Client:** `client/context/rtc.js`
- **Backend:** `node-calls/server.js` (logic explained, code not shown)

---

## 🔍 Debugging Tips

If video/audio isn't working:
1. Check transport connection state (should be `'connected'`)
2. Verify consumers are resumed (both client and server)
3. Check track `readyState` (should be `'live'`)
4. For video, check track `muted` state (should be `false` for frames to arrive)
5. Verify track is added to `remoteStreamRef.current`
6. Check React state updates (`setRemoteStream`, `setRemoteStreamTracksCount`)

---

*This walkthrough covers the complete 1:1 call flow from button press to call end. Every function call, socket event, and state change is explained in the context of making a video call.*
