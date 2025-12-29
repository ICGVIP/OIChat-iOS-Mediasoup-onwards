/**
 * Stream Management Module
 * Handles per-participant stream creation and management
 */

export class StreamManager {
  constructor() {
    this.participantStreams = new Map(); // Map<userId, MediaStream>
    this.consumerToParticipant = new Map(); // Map<producerId, userId>

    // Debug toggle: global.__RTC_DEBUG__ = true/false
    this._dbgEnabled = () =>
      (typeof global !== 'undefined' && global.__RTC_DEBUG__ !== undefined)
        ? !!global.__RTC_DEBUG__
        : (typeof __DEV__ !== 'undefined' ? __DEV__ : false);
    this._dbg = (event, data = {}) => {
      if (!this._dbgEnabled()) return;
      try {
        console.log(`[StreamManager] ${event}`, data);
      } catch {
        // ignore
      }
    };
  }

  /**
   * Create or get stream for a participant
   * @param {string|number} userId - User ID
   * @returns {MediaStream} Participant's media stream
   */
  getOrCreateParticipantStream(userId) {
    const userIdStr = userId.toString();
    let stream = this.participantStreams.get(userIdStr);
    
    if (!stream) {
      const { MediaStream } = require('react-native-webrtc');
      stream = new MediaStream();
      this.participantStreams.set(userIdStr, stream);
      this._dbg('stream.created', { userId: userIdStr });
    }
    
    return stream;
  }

  /**
   * Add track to participant's stream.
   *
   * IMPORTANT (React Native):
   * RTCView can fail to update when tracks are added to an existing MediaStream instance.
   * To make rendering reliable, we create and store a NEW MediaStream instance whenever
   * the track set changes.
   * @param {string|number} userId - User ID
   * @param {MediaTrack} track - Media track to add
   * @param {Object} [options]
   * @param {boolean} [options.replaceSameKind=true] - Replace existing track of the same kind (audio/video)
   * @returns {MediaStream} Updated participant stream (NEW instance when changed)
   */
  addTrackToParticipantStream(userId, track, options = {}) {
    const { replaceSameKind = true } = options;
    const userIdStr = userId.toString();
    const { MediaStream } = require('react-native-webrtc');

    const current = this.getOrCreateParticipantStream(userIdStr);
    const existingTracks = current.getTracks();

    // If we already have this exact track, keep the current stream instance.
    if (existingTracks.some(t => t.id === track.id)) {
      return current;
    }

    const nextTracks = replaceSameKind
      ? existingTracks.filter(t => t.kind !== track.kind)
      : existingTracks.slice();

    nextTracks.push(track);

    // Create a NEW stream instance to force RTCView to refresh.
    const nextStream = new MediaStream(nextTracks);
    this.participantStreams.set(userIdStr, nextStream);
    this._dbg('track.added', {
      userId: userIdStr,
      kind: track?.kind,
      newAudioTracks: nextStream?.getAudioTracks?.()?.length || 0,
      newVideoTracks: nextStream?.getVideoTracks?.()?.length || 0,
    });
    return nextStream;
  }

  /**
   * Map consumer to participant
   * @param {string} producerId - Producer ID
   * @param {string|number} userId - User ID
   */
  mapConsumerToParticipant(producerId, userId) {
    this.consumerToParticipant.set(producerId, userId.toString());
  }

  /**
   * Get participant ID from producer ID
   * @param {string} producerId - Producer ID
   * @returns {string|null} User ID or null
   */
  getParticipantFromProducer(producerId) {
    return this.consumerToParticipant.get(producerId) || null;
  }

  /**
   * Get stream for participant
   * @param {string|number} userId - User ID
   * @returns {MediaStream|null} Stream or null
   */
  getParticipantStream(userId) {
    return this.participantStreams.get(userId.toString()) || null;
  }

  /**
   * Remove participant stream
   * @param {string|number} userId - User ID
   */
  removeParticipantStream(userId) {
    const userIdStr = userId.toString();
    const stream = this.participantStreams.get(userIdStr);
    
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error('❌ [StreamManager] Error stopping track:', e);
        }
      });
      this.participantStreams.delete(userIdStr);
    }

    // Clean up consumer mapping
    for (const [producerId, mappedUserId] of this.consumerToParticipant.entries()) {
      if (mappedUserId === userIdStr) {
        this.consumerToParticipant.delete(producerId);
      }
    }
  }

  /**
   * Clear all streams
   */
  clear() {
    this.participantStreams.forEach((stream, userId) => {
      if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {
            console.error('❌ [StreamManager] Error stopping track:', e);
          }
        });
      }
    });
    
    this.participantStreams.clear();
    this.consumerToParticipant.clear();
  }
}

