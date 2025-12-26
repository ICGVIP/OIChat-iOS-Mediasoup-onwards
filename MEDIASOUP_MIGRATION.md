# Mediasoup Migration Guide

This document explains the migration from native WebRTC to mediasoup-based calling in OIChat.

## Overview

The calling functionality has been migrated from using `react-native-webrtc`'s native RTCPeerConnection to `mediasoup-client`. This provides better scalability, server-side media processing, and more control over the media pipeline.

## Architecture Changes

### Before (Native WebRTC)
- Direct peer-to-peer connections using RTCPeerConnection
- SDP offer/answer exchange via Socket.io
- ICE candidate exchange via Socket.io
- Client-side media routing

### After (Mediasoup)
- Server-mediated connections using mediasoup
- Router-based media routing on the server
- Separate send/receive transports per peer
- Producer/Consumer model for media tracks

## File Changes

### Frontend (`client/context/rtc.js`)

**Key Changes:**
- Old WebRTC code is commented out (lines ~75-486)
- New mediasoup implementation maintains the same API for UI compatibility
- Uses `mediasoup-client` for Device, Transport, Producer, Consumer
- Still uses `react-native-webrtc` for `mediaDevices`, `RTCView`, and `MediaStream` (for UI compatibility)

**Maintained Functions:**
- `startCall(partnerId, callType)` - Initiates a call
- `endCall(emitTo)` - Ends a call
- `processAccept()` - Accepts an incoming call
- `processIncomingVoIPOffer({ from, offer, type })` - Handles VoIP push notifications (may need adjustment)

**New Concepts:**
- `device` - Mediasoup Device instance (replaces RTCPeerConnection)
- `sendTransport` - Transport for sending media
- `recvTransport` - Transport for receiving media
- `producers` - Map of media producers (audio/video)
- `consumers` - Map of media consumers

### Backend (`node-calls/`)

**New Server Structure:**
- `server.js` - Main mediasoup signaling server
- `package.json` - Dependencies (mediasoup, socket.io, express)
- `README.md` - Server documentation

**Key Features:**
- Mediasoup worker for media processing
- Router per call session
- Separate send/receive transports per peer
- Producer/Consumer management
- Socket.io signaling

## Socket.io Events

### Client → Server

1. **register** - Register user with userId
2. **start-call** - Initiate call
   - Response includes: `sendTransport`, `recvTransport`, `rtpCapabilities`
3. **accept-call** - Accept incoming call
   - Response includes: `sendTransport`, `recvTransport`, `rtpCapabilities`
4. **connect-transport** - Connect transport with DTLS
5. **create-producer** - Create producer (send media)
6. **create-consumer** - Create consumer (receive media)
7. **end-call** - End the call

### Server → Client

1. **incoming-call** - Notify about incoming call
2. **call-accepted** - Notify call was accepted
3. **new-producer** - Notify about new producer from other peer
4. **call-ended** - Notify call ended

## Setup Instructions

### Backend

1. Navigate to `node-calls/`:
```bash
cd node-calls
```

2. Install dependencies:
```bash
npm install
```

3. Update server IP in `server.js`:
   - Change `announcedIp` in `createWebRtcTransport` to your server's public IP
   - Default port is 8501

4. Start server:
```bash
npm start
```

### Frontend

1. Ensure `mediasoup-client` is installed (already in package.json)
2. Update socket connection URL in `rtc.js`:
   - Change `http://216.126.78.3:8501/calls` to your server URL

## Network Requirements

- **UDP ports 40000-49999**: For RTP/RTCP media
- **TCP port 8501**: For Socket.io signaling
- **Public IP**: Server must have a public IP or proper NAT configuration

## Testing

1. Start the backend server
2. Ensure both clients can connect to the server
3. Initiate a call from one client
4. Accept the call from the other client
5. Verify audio/video transmission

## Troubleshooting

### Connection Issues
- Check firewall settings for UDP ports 40000-49999
- Verify server's public IP is correct
- Check Socket.io connection in browser console

### Media Issues
- Verify device permissions (camera/microphone)
- Check mediasoup worker logs
- Verify RTP capabilities match between client and server

### Transport Issues
- Ensure both send and receive transports are created
- Check DTLS connection state
- Verify ICE candidates are being exchanged

## Notes

- The UI remains unchanged - all function signatures are maintained
- VoIP push notifications may need adjustment for mediasoup
- Currently supports 1:1 calls only
- Each call creates a new router on the server

## Future Enhancements

- Group calling support
- Screen sharing
- Recording capabilities
- Better error handling and reconnection logic
- Statistics and monitoring

