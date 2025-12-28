# Call Architecture Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Unified Design Philosophy](#unified-design-philosophy)
3. [Manager Classes](#manager-classes)
4. [Call Flow - 1:1 Calls](#call-flow---11-calls)
5. [Call Flow - Group Calls](#call-flow---group-calls)
6. [Adding Members to Existing Call](#adding-members-to-existing-call)
7. [Muting/Unmuting Flow](#mutingunmuting-flow)
8. [VideoCall Rendering](#videocall-rendering)
9. [State Management](#state-management)
10. [Key Concepts](#key-concepts)

---

## Architecture Overview

The call system is built on **mediasoup** (SFU - Selective Forwarding Unit) architecture, which allows efficient multi-party video/audio communication. The design supports both **1:1 calls** and **group calls** (up to 10 participants) using a unified codebase.

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    RTCProvider (Context)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Participant │  │   Stream     │  │    Sound     │       │
│  │   Manager   │  │   Manager    │  │   Manager    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  • State Management (localStream, remoteStream, etc.)        │
│  • WebRTC Setup (device, transports, producers, consumers)   │
│  • Socket.io Communication                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    VideoCall Component                       │
│  • Renders UI based on call type (1:1 vs Group)            │
│  • Handles user interactions (mute, video, add members)     │
│  • Displays streams using RTCView                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mediasoup Server                          │
│  • Router (manages RTP streams)                              │
│  • Transports (WebRTC connections)                           │
│  • Producers/Consumers (media tracks)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Unified Design Philosophy

The system uses a **unified approach** that works for both 1:1 and group calls:

### Key Principles

1. **Per-Participant Streams**: Each participant has their own `MediaStream` object
   - **1:1 calls**: Uses `remoteStreamRef` for backward compatibility
   - **Group calls**: Uses `participantStreams` Map (via StreamManager)

2. **Unified `startCall()` Function**: Accepts either single ID or array
   ```javascript
   startCall(partnerIdOrIds, callType)
   // partnerIdOrIds can be: 9 (1:1) or [9, 10, 11] (group)
   ```

3. **Conditional Rendering**: VideoCall component checks `participantsList.length`
   - `length <= 2`: 1:1 call UI (big remote view + small local preview)
   - `length > 2`: Group call UI (grid layout with all participants)

4. **State Management**:
   - **1:1**: Uses `remoteStream`, `remoteMicMuted`, `remoteVideoMuted`
   - **Group**: Uses `participantsList` array with per-participant mute status

---

## Manager Classes

### 1. ParticipantManager (`participantManager.js`)

**Purpose**: Manages participant data, mute status, and metadata.

**Key Data Structures**:
```javascript
participantsMap: Map<userId, {
  userId: string,
  name: string,
  avatar: string,
  isLocal: boolean,
  muted: { mic: boolean, video: boolean },
  stream: MediaStream | null,
  joinedAt: number
}>
```

**Key Methods**:
- `initializeParticipants(participantIds, localUser, localStream, contacts, includeLocal)`
  - Creates participant objects for all call participants
  - Looks up names/avatars from contacts
  - Returns array for React state

- `addParticipant(userId, participantData)`
  - Adds new participant when someone joins
  - Returns participant object or null if already exists

- `removeParticipant(userId)`
  - Removes participant and cleans up their stream

- `updateParticipantMute(userId, kind, muted)`
  - Updates mute status for audio or video
  - `kind`: 'audio' or 'video'
  - `muted`: boolean

- `getParticipant(userId)`
  - Retrieves participant data

- `getParticipantsList()`
  - Returns array of all participants

**Usage Example**:
```javascript
// Initialize for a call
const participants = participantManager.initializeParticipants(
  [9, 10], // participant IDs
  user,    // local user data
  localStream,
  contacts,
  false    // don't include local user in list
);

// Update mute status
participantManager.updateParticipantMute('9', 'audio', true);
```

---

### 2. StreamManager (`streamManager.js`)

**Purpose**: Manages per-participant `MediaStream` objects and tracks.

**Key Data Structures**:
```javascript
participantStreams: Map<userId, MediaStream>
consumerToParticipant: Map<producerId, userId>
```

**Key Methods**:
- `getOrCreateParticipantStream(userId)`
  - Creates new `MediaStream` if doesn't exist
  - Returns existing stream if already created
  - Each participant gets their own stream

- `addTrackToParticipantStream(userId, track)`
  - Adds a media track (audio/video) to participant's stream
  - Prevents duplicate tracks (checks by track.id)

- `mapConsumerToParticipant(producerId, userId)`
  - Maps mediasoup producer ID to user ID
  - Used when consuming remote tracks

- `getParticipantFromProducer(producerId)`
  - Gets user ID from producer ID
  - Used in `new-producer` event handler

- `removeParticipantStream(userId)`
  - Stops all tracks and removes stream
  - Cleans up consumer mappings

**Usage Example**:
```javascript
// When consuming a track
const participantStream = streamManager.getOrCreateParticipantStream('9');
streamManager.addTrackToParticipantStream('9', consumer.track);

// Map producer to participant
streamManager.mapConsumerToParticipant('producer-123', '9');
```

---

### 3. SoundManager (`soundManager.js`)

**Purpose**: Handles join/leave sounds for group calls (currently placeholder).

**Key Methods**:
- `initialize()` - Loads sound files
- `playJoinSound()` - Plays when participant joins
- `playLeaveSound()` - Plays when participant leaves
- `cleanup()` - Unloads sound resources

**Note**: Currently uses placeholder functions. To implement, use `expo-audio`:
```javascript
import { Audio } from 'expo-audio';

async initialize() {
  const { sound } = await Audio.Sound.createAsync(
    require('../assets/sounds/join.mp3')
  );
  this.joinSoundRef = sound;
}
```

---

## Call Flow - 1:1 Calls

### Starting a Call

```
User clicks "Video Call" button
    │
    ▼
startCall(9, 'video')
    │
    ├─► Normalize to array: [9]
    ├─► Get local stream (camera + microphone)
    ├─► Emit 'start-call' to server
    │   └─► Server creates router, transports
    │   └─► Server sends back: callId, rtpCapabilities, transports
    │
    ├─► Initialize mediasoup device
    ├─► Create sendTransport (for sending media)
    ├─► Create recvTransport (for receiving media)
    ├─► Produce local stream (audio + video)
    │   └─► Creates producers on server
    │
    ├─► Initialize participants (via ParticipantManager)
    │   └─► Creates participant object for user 9
    │   └─► Sets participantsList = [{ userId: '9', ... }]
    │
    └─► Navigate to "Outgoing Call" screen
```

### Receiving a Call

```
Server emits 'incoming-call' event
    │
    ▼
Socket handler receives event
    │
    ├─► Initialize device and transports
    ├─► Display CallKeep UI (native iOS call screen)
    ├─► Save call data to AsyncStorage
    │
    └─► User accepts call
        │
        ▼
processAccept()
    │
    ├─► Get local stream
    ├─► Produce local stream
    ├─► Emit 'accept-call' to server
    │   └─► Server sends existing producers (caller's audio/video)
    │
    └─► Navigate to "Video Call" screen
```

### Consuming Remote Media (1:1)

```
Server emits 'new-producer' event
    │
    ▼
consume(producerId, userId)
    │
    ├─► Create consumer via socket ('create-consumer')
    ├─► Get consumer track from mediasoup
    ├─► Resume consumer
    │
    ├─► Add track to participant stream (StreamManager)
    ├─► Add track to remoteStreamRef (for 1:1 compatibility)
    │   └─► This is the key: tracks go into remoteStreamRef
    │
    ├─► Setup event handlers (mute/unmute)
    ├─► Update mute status (ParticipantManager)
    │
    └─► Update remoteStream state (at end of consume)
        └─► setRemoteStream(remoteStreamRef.current)
        └─► setRemoteStreamTracksCount(tracks.length)
```

**Important**: For 1:1 calls, all remote tracks (audio + video) go into a single `remoteStreamRef.current` MediaStream. This is then set to `remoteStream` state, which VideoCall uses to render.

---

## Call Flow - Group Calls

### Starting a Group Call

```
User selects multiple contacts and clicks "Video Call"
    │
    ▼
startCall([9, 10, 11], 'video')
    │
    ├─► Normalize: Already an array
    ├─► Get local stream
    ├─► Emit 'start-call' with array of IDs
    │   └─► Server creates router, transports for all participants
    │
    ├─► Initialize participants (via ParticipantManager)
    │   └─► Creates participant objects for [9, 10, 11]
    │   └─► Sets participantsList = [
    │         { userId: '9', ... },
    │         { userId: '10', ... },
    │         { userId: '11', ... }
    │       ]
    │
    └─► Navigate to "Outgoing Call" screen
```

### Consuming Remote Media (Group)

```
Server emits 'new-producer' event (for each participant)
    │
    ▼
consume(producerId, userId)
    │
    ├─► Create consumer
    ├─► Get consumer track
    │
    ├─► Get/Create participant stream (StreamManager)
    │   └─► streamManager.getOrCreateParticipantStream(userId)
    │   └─► Each participant has their own MediaStream
    │
    ├─► Add track to participant stream
    │   └─► streamManager.addTrackToParticipantStream(userId, track)
    │
    ├─► Update participant mute status
    │
    └─► Update participantsList state (if group call)
        └─► setParticipantsList(prev => 
              prev.map(p => p.userId === userId ? 
                { ...p, stream: participantStream } : p
              )
            )
```

**Key Difference**: In group calls, each participant has their own `MediaStream` stored in `StreamManager.participantStreams` Map. The `participantsList` array contains references to these streams.

---

## Adding Members to Existing Call

### Flow Diagram

```
User clicks "Add Members" in VideoCall
    │
    ▼
handleAddMembers()
    │
    ├─► Opens bottom sheet with contact list
    ├─► User selects contacts
    │
    └─► User clicks "Add"
        │
        ▼
addToCall()
    │
    ├─► Calls addParticipantsToCall([12, 13])
    │   │
    │   └─► Emits 'add-participants' to server
    │       │
    │       └─► Server:
    │           ├─► Creates transports for new participants
    │           ├─► Adds to call.peers Map
    │           ├─► Emits 'call-invitation' to new participants
    │           └─► Emits 'participant-joined' to existing participants
    │
    └─► Two paths:
        │
        ├─► Path 1: New Participant Receives Invitation
        │   │
        │   └─► Socket handler: 'call-invitation'
        │       │
        │       ├─► Initialize device/transports (if needed)
        │       ├─► Get local stream
        │       ├─► Produce local stream
        │       ├─► Emit 'accept-call'
        │       │   └─► Server sends existing producers
        │       │
        │       └─► Navigate to "Video Call" screen
        │           └─► Will consume existing participants' media
        │
        └─► Path 2: Existing Participants Receive Notification
            │
            └─► Socket handler: 'participant-joined'
                │
                ├─► Add participant to ParticipantManager
                │   └─► participantManager.addParticipant(userId, data)
                │
                ├─► Update participantsList state
                │   └─► setParticipantsList(prev => [...prev, newParticipant])
                │
                ├─► Play join sound (SoundManager)
                │
                └─► Wait for 'new-producer' events
                    └─► When new participant produces, consume their tracks
```

### Code Flow

**1. Initiator Side (VideoCall.js)**:
```javascript
const addToCall = async () => {
    const memberIds = addingMembers.map(member => member.id);
    await addParticipantsToCall(memberIds);
    // Server handles the rest
};
```

**2. Server Side (server.js)**:
```javascript
socket.on('add-participants', async ({ callId, participantIds }, cb) => {
    // For each new participant:
    // 1. Create transports
    // 2. Add to peers Map
    // 3. Emit 'call-invitation' to new participant
    // 4. Emit 'participant-joined' to existing participants
});
```

**3. New Participant Side (rtc.js)**:
```javascript
socket.on('call-invitation', async (data) => {
    // Setup device/transports
    // Get local stream
    // Produce local stream
    // Emit 'accept-call'
    // Navigate to Video Call
});
```

**4. Existing Participants Side (rtc.js)**:
```javascript
socket.on('participant-joined', (data) => {
    // Add to ParticipantManager
    // Update participantsList state
    // Play join sound
    // Wait for new-producer events
});
```

---

## Muting/Unmuting Flow

### Architecture

The system uses **mediasoup producers** for muting. When you mute, you **pause the producer** on the server, which stops sending media to other participants.

### Local Mute (Your Mic/Video)

```
User clicks mute button in VideoCall
    │
    ▼
toggleMuteProducer() or toggleVideoProducer()
    │
    ├─► Get producer from producers Map
    │   └─► producers.current.get('audio') or .get('video')
    │
    ├─► Check if paused
    │   ├─► If paused: producer.resume() (unmute)
    │   └─► If not paused: producer.pause() (mute)
    │
    ├─► Emit 'mute-audio' or 'mute-video' to server
    │   └─► Server updates producer state
    │
    └─► Update local state
        └─► setMicStatus() or setVideoStatus()
```

**Code**:
```javascript
const toggleMuteProducer = async () => {
    const audioProducer = producers.current.get('audio');
    if (audioProducer.paused) {
        await audioProducer.resume(); // Unmute
        socket.emit('mute-audio', { muted: false });
        return true;
    } else {
        await audioProducer.pause(); // Mute
        socket.emit('mute-audio', { muted: true });
        return false;
    }
};
```

### Remote Mute Detection (Other Participants)

When a remote participant mutes, their producer is paused on the server. The **consumer track** on your device doesn't change, but the track stops receiving data.

**Detection Methods**:

1. **Track Events** (Primary):
   ```javascript
   track.addEventListener('mute', () => {
       // Remote user muted
       setRemoteVideoMuted(true); // For 1:1
       // OR
       updateParticipantMute(userId, 'video', true); // For group
   });
   ```

2. **Polling** (Fallback):
   ```javascript
   // Check every 500ms if track.enabled changed
   setInterval(() => {
       if (track.enabled !== track._lastEnabledState) {
           handleEnabledChange();
       }
   }, 500);
   ```

3. **Server Notification** (Future):
   - Server could emit 'participant-muted' event
   - Currently not implemented

### Mute Status Storage

**1:1 Calls**:
- `micStatus`: Your mic status (local)
- `videoStatus`: Your video status (local)
- `remoteMicMuted`: Remote user's mic status
- `remoteVideoMuted`: Remote user's video status

**Group Calls**:
- `micStatus`: Your mic status (local)
- `videoStatus`: Your video status (local)
- `participantsList[].muted.mic`: Each participant's mic status
- `participantsList[].muted.video`: Each participant's video status

**Storage Location**:
- **1:1**: React state (`remoteMicMuted`, `remoteVideoMuted`)
- **Group**: ParticipantManager (`participant.muted.mic/video`)

---

## VideoCall Rendering

### Component Structure

```javascript
VideoCall Component
    │
    ├─► Conditional Rendering Based on participantsList.length
    │   │
    │   ├─► length > 2: Group Call View
    │   │   └─► GroupCallView Component
    │   │       └─► ScrollView with grid layout
    │   │           └─► ParticipantView for each participant
    │   │
    │   └─► length <= 2: 1:1 Call View
    │       │
    │       ├─► Full Screen View (remote or local based on streamsSwapped)
    │       │   ├─► If !streamsSwapped: Remote video (RTCView with remoteStream)
    │       │   └─► If streamsSwapped: Local video (RTCView with localStream)
    │       │
    │       └─► Small Preview (local or remote based on streamsSwapped)
    │           ├─► If !streamsSwapped: Local video
    │           └─► If streamsSwapped: Remote video
    │
    └─► Call Controls (bottom)
        ├─► Mute button
        ├─► Video toggle
        ├─► Flip camera
        ├─► Emoji picker
        └─► Three-dots menu (add members, etc.)
```

### 1:1 Call Rendering

**Full Screen Remote View**:
```javascript
{!remoteVideoMuted && remoteStream && typeof remoteStream?.toURL === 'function' && (
    <RTCView
        key={`remote-${remoteStream.id}-${remoteStreamTracksCount}`}
        streamURL={remoteStream.toURL()}
        objectFit="cover"
        style={StyleSheet.absoluteFill}
        mirror={false}
    />
)}
```

**Key Points**:
- Uses `remoteStream` from RTC context
- `remoteStreamTracksCount` in key forces re-render when tracks added
- Falls back to avatar if `remoteVideoMuted` is true

**Small Local Preview**:
```javascript
{video ? (
    <RTCView
        streamURL={localStream?.toURL()}
        objectFit="cover"
        style={{ width: '100%', height: '100%' }}
        mirror={true}
    />
) : (
    <View>Video Off Fallback</View>
)}
```

### Group Call Rendering

**GroupCallView Component**:
```javascript
<ScrollView>
    {sortedParticipants.map((participant) => (
        <ParticipantView
            key={participant.userId}
            participant={participant}
            style={{ width: '50%', aspectRatio: 1 }}
        />
    ))}
</ScrollView>
```

**ParticipantView Component**:
```javascript
{stream && stream.getVideoTracks().length > 0 && !muted.video ? (
    <RTCView
        streamURL={stream.toURL()}
        objectFit="cover"
        style={StyleSheet.absoluteFill}
        mirror={isLocal}
    />
) : (
    <View>
        <Avatar.Image source={{ uri: avatar }} />
        <Text>{name}</Text>
    </View>
)}
```

**Key Points**:
- Each participant has their own `stream` from `participantsList`
- Checks `muted.video` to show/hide video
- Falls back to avatar if video is off

### Stream Swapping (1:1 Only)

Users can tap the small preview to swap full screen and preview:
```javascript
const toggleStreams = () => {
    setStreamsSwapped(!streamsSwapped);
};
```

- `streamsSwapped = false`: Remote full screen, local preview
- `streamsSwapped = true`: Local full screen, remote preview

---

## State Management

### React State (RTC Context)

**1:1 Call State**:
```javascript
const [localStream, setLocalStream] = useState(null);
const [remoteStream, setRemoteStream] = useState(null);
const [remoteStreamTracksCount, setRemoteStreamTracksCount] = useState(0);
const [micStatus, setMicStatus] = useState(true);
const [videoStatus, setVideoStatus] = useState(true);
const [remoteMicMuted, setRemoteMicMuted] = useState(false);
const [remoteVideoMuted, setRemoteVideoMuted] = useState(false);
```

**Group Call State**:
```javascript
const [participantsList, setParticipantsList] = useState([]);
const [callInfo, setCallInfo] = useState({
    callId: null,
    type: 'video',
    participantCount: 0,
});
```

### Refs (Non-Reactive Data)

```javascript
const device = useRef(null);                    // Mediasoup device
const sendTransport = useRef(null);             // Send transport
const recvTransport = useRef(null);             // Receive transport
const producers = useRef(new Map());            // Map<'audio'|'video', Producer>
const consumers = useRef(new Map());            // Map<producerId, {consumer, userId, kind}>
const remoteStreamRef = useRef(null);           // 1:1 compatibility stream
const participantManager = useRef(new ParticipantManager());
const streamManager = useRef(new StreamManager());
const soundManager = useRef(new SoundManager());
```

### State Update Guards

To prevent unnecessary re-renders, we use refs to track previous values:

```javascript
const lastRemoteStreamTracksCount = useRef(0);
const remoteVideoMutedRef = useRef(false);

// Only update if value changed
if (tracksCount !== lastRemoteStreamTracksCount.current) {
    lastRemoteStreamTracksCount.current = tracksCount;
    setRemoteStreamTracksCount(tracksCount);
}

if (muted !== remoteVideoMutedRef.current) {
    remoteVideoMutedRef.current = muted;
    setRemoteVideoMuted(muted);
}
```

---

## Key Concepts

### 1. Producer vs Consumer

- **Producer**: Your local media (mic/camera) sent to server
  - Created when you call `sendTransport.produce({ track })`
  - Stored in `producers.current` Map
  - Can be paused/resumed for muting

- **Consumer**: Remote participant's media received from server
  - Created when you call `recvTransport.consume(data)`
  - Stored in `consumers.current` Map
  - Track is added to participant's stream

### 2. Transport

- **Send Transport**: Sends your media to server
  - Created once per call
  - Used to create producers

- **Receive Transport**: Receives remote media from server
  - Created once per call
  - Used to create consumers

### 3. Stream vs Track

- **Track**: Single media source (one audio track OR one video track)
- **Stream**: Container for tracks (can have multiple tracks)

In this system:
- Each participant has one `MediaStream`
- Each stream can have:
  - 0-1 audio track
  - 0-1 video track

### 4. 1:1 Compatibility Layer

For backward compatibility with existing 1:1 call code, we maintain:
- `remoteStreamRef`: Single MediaStream with all remote tracks
- `remoteStream`: React state pointing to `remoteStreamRef.current`
- `remoteMicMuted` / `remoteVideoMuted`: Global mute status

This allows VideoCall to work with both:
- Old 1:1 code: Uses `remoteStream`
- New group code: Uses `participantsList[].stream`

### 5. Call Type Detection

```javascript
const isGroupCall = participantsList.length > 2;
```

- `length <= 2`: 1:1 call
- `length > 2`: Group call

This determines:
- Which state to update (remoteStream vs participantsList)
- Which UI to render (1:1 view vs group grid)
- Which manager methods to use

### 6. Participant Join Order

`participantsList` maintains join order:
- First participant: Usually the caller (or first person to join)
- Local user: Can be included or excluded based on `includeLocal` flag
- New participants: Added to end of array

For UI, local user is always shown first:
```javascript
const sortedParticipants = useMemo(() => {
    const local = participants.find(p => p.isLocal);
    const remote = participants.filter(p => !p.isLocal);
    return local ? [local, ...remote] : participants;
}, [participants]);
```

---

## Common Patterns

### Pattern 1: Adding Track to Stream

```javascript
// Get or create stream
const stream = streamManager.getOrCreateParticipantStream(userId);

// Add track (prevents duplicates)
const existingTracks = stream.getTracks();
if (!existingTracks.some(t => t.id === track.id)) {
    stream.addTrack(track);
}
```

### Pattern 2: Updating Mute Status

```javascript
// For 1:1
if (!isGroupCall) {
    setRemoteVideoMuted(!isVideoOn);
}

// For group
if (isGroupCall) {
    updateParticipantMute(userId, 'video', !isVideoOn);
}
```

### Pattern 3: State Update with Guard

```javascript
// Always check if value changed before updating
if (newValue !== ref.current) {
    ref.current = newValue;
    setState(newValue);
}
```

### Pattern 4: Conditional Rendering

```javascript
// Check call type
const isGroupCall = participantsList.length > 2;

// Render accordingly
{isGroupCall ? (
    <GroupCallView participants={participantsList} />
) : (
    <OneOnOneView remoteStream={remoteStream} />
)}
```

---

## Troubleshooting

### Issue: Remote video not showing (1:1)

**Check**:
1. Is `remoteStream` state set? (`hasRemoteStream: true` in logs)
2. Is video track in `remoteStreamRef`? (`remoteStream.getVideoTracks().length > 0`)
3. Is `remoteVideoMuted` false?
4. Does `remoteStream.toURL()` return valid string?

**Solution**: Ensure `setRemoteStream(remoteStreamRef.current)` is called after track is added.

### Issue: Too many re-renders

**Check**:
1. Are state updates guarded? (check if value changed before updating)
2. Are intervals cleared? (check `_enabledCheckInterval`)
3. Are event listeners removed? (check cleanup in `endCall`)

**Solution**: Add refs to track previous values and only update if changed.

### Issue: Participant not showing in group call

**Check**:
1. Is participant in `participantsList`?
2. Does participant have a stream? (`participant.stream !== null`)
3. Are tracks in the stream? (`participant.stream.getVideoTracks().length > 0`)
4. Is `muted.video` false?

**Solution**: Ensure `setParticipantsList` is called after stream is set.

---

## Summary

This architecture provides:

✅ **Unified codebase** for 1:1 and group calls
✅ **Modular design** with manager classes
✅ **Efficient rendering** with per-participant streams
✅ **Scalable** up to 10 participants
✅ **Maintainable** with clear separation of concerns

The key insight is using **conditional logic** based on `participantsList.length` to switch between 1:1 and group call modes, while maintaining backward compatibility with existing 1:1 code through `remoteStreamRef`.

