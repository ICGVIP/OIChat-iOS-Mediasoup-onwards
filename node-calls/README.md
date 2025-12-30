# Node Calls - Mediasoup Signaling Server

This is a mediasoup-based WebRTC signaling server for OIChat's calling functionality.

## Overview

This server handles WebRTC signaling using Socket.io and manages mediasoup routers, transports, producers, and consumers for 1:1 video/audio calls.

## Architecture

- **Mediasoup Worker**: Handles media processing and routing
- **Router**: Manages media routing for each call session
- **Transport**: WebRTC transport for sending/receiving media
- **Producer**: Sends media from client to server
- **Consumer**: Receives media from server to client

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure the server IP in `server.js`:
   - Update `announcedIp` in `createWebRtcTransport` to your server's public IP
   - Default port is 8501 (configurable via `PORT` environment variable)

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Socket.io Events

### Client → Server

- `register` - Register user with their userId
- `start-call` - Initiate a call
  - Parameters: `{ callId, toUserId, callType }`
  - Response: Transport parameters and RTP capabilities
- `accept-call` - Accept an incoming call
  - Parameters: `{ callId, fromUserId }`
  - Response: Transport parameters
- `connect-transport` - Connect transport with DTLS parameters
  - Parameters: `{ callId, transportId, dtlsParameters }`
- `create-producer` - Create a producer (send media)
  - Parameters: `{ callId, transportId, kind, rtpParameters }`
  - Response: `{ producerId }`
- `create-consumer` - Create a consumer (receive media)
  - Parameters: `{ callId, transportId, producerId, rtpCapabilities }`
  - Response: Consumer parameters
- `ice-candidate` - Send ICE candidate
  - Parameters: `{ callId, transportId, candidate }`
- `end-call` - End the call
  - Parameters: `{ callId }`

### Server → Client

- `incoming-call` - Notify about incoming call
  - Parameters: `{ callId, fromUserId, callType, rtpCapabilities }`
- `call-accepted` - Notify that call was accepted
  - Parameters: `{ callId, calleeUserId }`
- `new-producer` - Notify about new producer from other peer
  - Parameters: `{ callId, producerId, kind, userId }`
- `ice-candidate` - Forward ICE candidate from other peer
  - Parameters: `{ callId, transportId, candidate, userId }`
- `call-ended` - Notify that call ended
  - Parameters: `{ callId }`

## Configuration

### Mediasoup Worker Settings

- `rtcMinPort`: 40000
- `rtcMaxPort`: 49999
- `logLevel`: 'warn'

### Supported Codecs

- **Audio**: Opus (48kHz, 2 channels)
- **Video**: VP8, VP9, H.264

## Network Requirements

- UDP ports 40000-49999 must be open for RTP/RTCP
- TCP port 8501 (or configured PORT) for Socket.io
- Ensure proper firewall/NAT configuration for WebRTC

## Notes

- Currently supports 1:1 calls only
- Each call creates a new router
- Transports are created per peer
- Producers/consumers are created per media track (audio/video)












