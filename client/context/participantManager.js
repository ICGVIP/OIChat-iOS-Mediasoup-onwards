/**
 * Participant Management Module
 * Handles participant state, adding/removing participants, and mute status
 */

export class ParticipantManager {
  constructor() {
    this.participantsMap = new Map(); // Map<userId, participantData>
    this.participantStreams = new Map(); // Map<userId, MediaStream>

    // Debug toggle: global.__RTC_DEBUG__ = true/false
    this._dbgEnabled = () =>
      (typeof global !== 'undefined' && global.__RTC_DEBUG__ !== undefined)
        ? !!global.__RTC_DEBUG__
        : (typeof __DEV__ !== 'undefined' ? __DEV__ : false);
    this._dbg = (event, data = {}) => {
      if (!this._dbgEnabled()) return;
      try {
        console.log(`[ParticipantManager] ${event}`, data);
      } catch {
        // ignore
      }
    };
  }

  /**
   * Initialize participants for a call
   * @param {Array} participantIds - Array of user IDs
   * @param {Object} localUser - Current user data
   * @param {MediaStream} localStream - Local media stream
   * @param {Array} contacts - Contacts list for name lookup
   * @param {boolean} includeLocal - Whether to include local user
   * @returns {Array} Array of participant objects
   */
  initializeParticipants(participantIds, localUser, localStream, contacts, includeLocal = false) {
    const newMap = new Map();
    const newList = [];

    if (includeLocal && localUser?.data?.id) {
      const localParticipant = {
        userId: localUser.data.id.toString(),
        name: localUser.data.name || localUser.data.firstName || 'You',
        avatar: localUser.data.avatar,
        isLocal: true,
        muted: { mic: false, video: false },
        stream: localStream,
        streamKey: 0,
        joinedAt: Date.now(),
      };
      newMap.set(localUser.data.id.toString(), localParticipant);
      newList.push(localParticipant);
    }

    // Add remote participants
    participantIds.forEach(userId => {
      const contact = contacts.find(c => 
        c.server_info?.id === userId || 
        c.server_info?.id === parseInt(userId)
      );
      const participant = {
        userId: userId.toString(),
        name: contact?.item?.name || contact?.item?.firstName || 'Unknown',
        avatar: contact?.server_info?.avatar,
        isLocal: false,
        muted: { mic: false, video: false },
        stream: null,
        streamKey: 0,
        joinedAt: Date.now(),
      };
      newMap.set(userId.toString(), participant);
      newList.push(participant);
    });

    this.participantsMap = newMap;
    return newList;
  }

  /**
   * Add a participant to the call
   * @param {string|number} userId - User ID
   * @param {Object} participantData - Participant data (name, avatar, etc.)
   * @returns {Object|null} Added participant or null if already exists
   */
  addParticipant(userId, participantData) {
    const userIdStr = userId.toString();
    if (this.participantsMap.has(userIdStr)) {
      this._dbg('addParticipant.exists', { userId: userIdStr });
      return null;
    }

    const participant = {
      userId: userIdStr,
      name: participantData.name || 'Unknown',
      avatar: participantData.avatar,
      isLocal: false,
      muted: { mic: false, video: false },
      stream: null,
      streamKey: 0,
      joinedAt: Date.now(),
      ...participantData,
    };

    this.participantsMap.set(userIdStr, participant);
    this._dbg('addParticipant.added', { userId: userIdStr, name: participant.name });
    return participant;
  }

  /**
   * Remove a participant from the call
   * @param {string|number} userId - User ID
   * @returns {boolean} True if participant was removed, false if not found
   */
  removeParticipant(userId) {
    const userIdStr = userId.toString();
    if (!this.participantsMap.has(userIdStr)) {
      this._dbg('removeParticipant.not_found', { userId: userIdStr });
      return false;
    }

    // Clean up stream
    const stream = this.participantStreams.get(userIdStr);
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error('❌ [ParticipantManager] Error stopping track:', e);
        }
      });
      this.participantStreams.delete(userIdStr);
    }

    this.participantsMap.delete(userIdStr);
    this._dbg('removeParticipant.removed', { userId: userIdStr });
    return true;
  }

  /**
   * Update participant mute status
   * @param {string|number} userId - User ID
   * @param {string} kind - 'audio' or 'video'
   * @param {boolean} muted - Mute status
   * @returns {boolean} True if updated, false if participant not found
   */
  updateParticipantMute(userId, kind, muted) {
    const userIdStr = userId.toString();
    const participant = this.participantsMap.get(userIdStr);
    if (!participant) return false;

    participant.muted[kind === 'audio' ? 'mic' : 'video'] = muted;
    this.participantsMap.set(userIdStr, participant);
    return true;
  }

  /**
   * Set participant stream
   * @param {string|number} userId - User ID
   * @param {MediaStream} stream - Media stream
   */
  setParticipantStream(userId, stream) {
    const userIdStr = userId.toString();
    this.participantStreams.set(userIdStr, stream);
    
    const participant = this.participantsMap.get(userIdStr);
    if (participant) {
      participant.stream = stream;
      this.participantsMap.set(userIdStr, participant);
    }
  }

  /**
   * Get participant by ID
   * @param {string|number} userId - User ID
   * @returns {Object|null} Participant object or null
   */
  getParticipant(userId) {
    return this.participantsMap.get(userId.toString()) || null;
  }

  /**
   * Get all participants as array
   * @returns {Array} Array of participant objects
   */
  getParticipantsList() {
    return Array.from(this.participantsMap.values());
  }

  /**
   * Get participant count
   * @returns {number} Number of participants
   */
  getParticipantCount() {
    return this.participantsMap.size;
  }

  /**
   * Clear all participants
   */
  clear() {
    // Clean up all streams
    this.participantStreams.forEach((stream, userId) => {
      if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {
            console.error('❌ [ParticipantManager] Error stopping track:', e);
          }
        });
      }
    });
    
    this.participantsMap.clear();
    this.participantStreams.clear();
  }
}

