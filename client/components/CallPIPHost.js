import React, { useMemo, useRef } from 'react';
import { View, Text, Platform } from 'react-native';
import { Avatar } from 'react-native-paper';
import { RTCPIPView } from 'react-native-webrtc';
import { useRTC } from '../context/rtc';

/**
 * Global PiP host view.
 *
 * Reason:
 * Unmounting an active PiP RTC view during call teardown can crash Fabric with:
 * "RCTComponentViewRegistry: Attempt to recycle a mounted view."
 *
 * Keeping the PiP source view mounted at the app root avoids recycling while PiP is active.
 */
export default function CallPIPHost() {
  const pipRef = useRef(null);
  const {
    info,
    remoteStream,
    remoteVideoMuted,
    participantsList,
    callInfo,
    activeScreenShare,
  } = useRTC();

  const isGroupUI = !!(
    (participantsList && participantsList.length > 2) ||
    (typeof callInfo?.participantCount === 'number' && callInfo.participantCount > 2)
  );

  const pipCandidate = useMemo(() => {
    try {
      // Only enable PiP when we're in an active call screen context.
      // (If call ended, keep streamURL undefined so PiP has nothing to render.)
      if (!info?.callId) {
        return { streamURL: undefined, title: 'OIChat', status: '' };
      }

      // 1:1: always remote stream.
      if (!isGroupUI) {
        const rs = remoteStream;
        const streamURL = (rs && typeof rs.toURL === 'function') ? rs.toURL() : undefined;
        const hasVideo = !!rs && (rs.getVideoTracks?.()?.length || 0) > 0 && !remoteVideoMuted;
        return {
          streamURL: hasVideo ? streamURL : undefined,
          title: info?.name || 'OIChat User',
          status: remoteVideoMuted ? 'Video is off' : 'Connecting…',
        };
      }

      // Group: prefer screen share if present (viewer can watch it in PiP).
      if (activeScreenShare?.stream && typeof activeScreenShare.stream?.toURL === 'function') {
        return {
          streamURL: activeScreenShare.stream.toURL(),
          title: 'Screen share',
          status: '',
        };
      }

      // Otherwise pick a remote participant with video.
      const list = Array.isArray(participantsList) ? participantsList : [];
      const candidate =
        list.find(p => !p?.isLocal && p?.stream && (p.stream.getVideoTracks?.()?.length || 0) > 0 && !p?.muted?.video) ||
        list.find(p => !p?.isLocal && p?.stream && (p.stream.getVideoTracks?.()?.length || 0) > 0) ||
        list.find(p => !p?.isLocal && p?.stream);

      const streamURL = candidate?.stream && typeof candidate.stream?.toURL === 'function' ? candidate.stream.toURL() : undefined;
      const hasVideo = !!candidate?.stream && (candidate.stream.getVideoTracks?.()?.length || 0) > 0 && !candidate?.muted?.video;
      const title = candidate?.name || candidate?.username || 'OIChat User';
      return {
        streamURL: hasVideo ? streamURL : undefined,
        title,
        status: hasVideo ? '' : 'Video is off',
      };
    } catch {
      return { streamURL: undefined, title: 'OIChat', status: '' };
    }
  }, [info?.callId, info?.name, isGroupUI, remoteStream, remoteVideoMuted, participantsList, activeScreenShare]);

  if (Platform.OS !== 'ios') return null;

  return (
    <View style={{ position: 'absolute', width: 2, height: 2, opacity: 0.01 }}>
      <RTCPIPView
        ref={pipRef}
        streamURL={pipCandidate?.streamURL}
        objectFit="cover"
        mirror={false}
        iosPIP={{
          enabled: true,
          startAutomatically: true,
          stopAutomatically: true,
          preferredSize: { width: 80, height: 120 },
          fallbackView: (
            <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar.Text size={48} label={(pipCandidate?.title || 'O').slice(0, 1).toUpperCase()} />
              <Text style={{ color: 'white', marginTop: 10, fontWeight: '700' }} numberOfLines={1}>
                {pipCandidate?.title || 'OIChat User'}
              </Text>
              {!!pipCandidate?.status && (
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                  {pipCandidate.status}
                </Text>
              )}
            </View>
          ),
        }}
        style={{ width: 2, height: 2 }}
      />
    </View>
  );
}


