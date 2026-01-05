import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { RTCPIPView } from 'react-native-webrtc';
import { useSelector } from 'react-redux';

import { useRTC } from '../context/rtc';
import { setGlobalPipRef } from '../utils/pipHost';

const windowWidth = Dimensions.get('window').width;

function buildGroupSummary(names) {
  const clean = (Array.isArray(names) ? names : [])
    .map((x) => (x ?? '').toString().trim())
    .filter(Boolean);
  if (clean.length === 0) return 'Group Call';
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]}, ${clean[1]}`;
  return `${clean[0]}, ${clean[1]} & ${clean.length - 2} others`;
}

export default function CallPIPHost() {
  const pipRef = useRef(null);
  const { info, remoteStream, participantsList, callInfo, activeScreenShare, remoteVideoMuted } = useRTC();
  const user = useSelector((s) => s.user.value);
  const [pipAspectRatio, setPipAspectRatio] = useState(3 / 4); // default portrait-ish until we learn real dimensions

  useEffect(() => {
    setGlobalPipRef(pipRef);
    return () => setGlobalPipRef(null);
  }, []);

  const hasActiveCall = !!info?.callId;
  const isGroupCall = useMemo(() => {
    const pLen = Array.isArray(participantsList) ? participantsList.length : 0;
    const participantCount = typeof callInfo?.participantCount === 'number' ? callInfo.participantCount : null;
    return (pLen > 2) || (participantCount != null && participantCount > 2);
  }, [participantsList, callInfo?.participantCount]);

  // IMPORTANT:
  // Keep the view mounted, but ONLY enable PiP during a live call. This prevents PiP on normal app usage.
  const pipEnabled = Platform.OS === 'ios' && hasActiveCall;

  const pipStreamURL = useMemo(() => {
    if (!pipEnabled) return undefined;

    // If group call and someone is screensharing, feed that as the PiP video source (even if we overlay text).
    if (isGroupCall && activeScreenShare?.stream && typeof activeScreenShare.stream?.toURL === 'function') {
      // Prefer remote screenshare; if local screenshare is present, it's still a stable video source for PiP.
      return activeScreenShare.stream.toURL();
    }

    // 1:1 (audio or video): always prefer the remoteStream as the PiP video source.
    // IMPORTANT: if remote has muted video, do NOT keep rendering the last frame (set streamURL undefined so fallback renders).
    if (!isGroupCall && remoteVideoMuted) {
      return undefined;
    }
    if (!isGroupCall && remoteStream && typeof remoteStream?.toURL === 'function') {
      const hasVideo = (remoteStream.getVideoTracks?.()?.length || 0) > 0;
      if (!hasVideo) return undefined;
      return remoteStream.toURL();
    }

    // Group call without screenshare: pick any remote participant stream with video if present.
    if (isGroupCall) {
      const list = Array.isArray(participantsList) ? participantsList : [];
      const candidate =
        list.find((p) => !p?.isLocal && p?.stream && (p.stream.getVideoTracks?.()?.length || 0) > 0 && !p?.muted?.video) ||
        list.find((p) => !p?.isLocal && p?.stream && (p.stream.getVideoTracks?.()?.length || 0) > 0) ||
        list.find((p) => !p?.isLocal && p?.stream);
      if (candidate?.stream && typeof candidate.stream?.toURL === 'function') {
        const hasVideo = (candidate.stream.getVideoTracks?.()?.length || 0) > 0;
        if (!hasVideo || candidate?.muted?.video) return undefined;
        return candidate.stream.toURL();
      }
    }

    return undefined;
  }, [pipEnabled, isGroupCall, activeScreenShare?.stream, remoteStream, participantsList, remoteVideoMuted]);

  const overlay = useMemo(() => {
    if (!pipEnabled) return null;

    // Group: show a simple summary view: "Lucky, Red & 2 others" + "Video Call".
    if (isGroupCall) {
      const list = Array.isArray(participantsList) ? participantsList : [];
      const names = [];

      // Prefer including local user's name first (if present).
      const localName = (() => {
        const fn = user?.data?.first_name || user?.data?.firstName || '';
        const ln = user?.data?.last_name || user?.data?.lastName || '';
        const full = `${fn} ${ln}`.trim();
        return full || user?.data?.username || 'You';
      })();
      if (localName) names.push(localName);

      // Add up to a few remote names from participant list.
      list.forEach((p) => {
        if (!p || p.isLocal) return;
        const display =
          (p.name && p.name !== 'Unknown') ||
          (p.firstName || p.lastName ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : '') ||
          p.username ||
          '';
        if (display) names.push(display);
      });

      const title = buildGroupSummary(names);
      return (
        <View style={styles.groupOverlay}>
          <Text style={styles.groupTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.groupSubtitle}>Video Call</Text>
        </View>
      );
    }

    // 1:1: we only need a fallback overlay if remote video isn't available (audio-only / video off / connecting).
    const remoteName = info?.name || 'OIChat User';
    return (
      <View style={styles.fallbackOverlay}>
        <Avatar.Text size={56} label={(remoteName || 'U').slice(0, 1).toUpperCase()} />
        <Text style={styles.fallbackName} numberOfLines={1}>{remoteName}</Text>
        <Text style={styles.fallbackStatus}>{remoteVideoMuted ? 'Video is off' : 'Video Call'}</Text>
      </View>
    );
  }, [pipEnabled, isGroupCall, participantsList, user?.data, info?.name, remoteVideoMuted]);

  const onPipDimensionsChange = useCallback((event) => {
    try {
      const w = event?.nativeEvent?.width;
      const h = event?.nativeEvent?.height;
      if (typeof w !== 'number' || typeof h !== 'number') return;
      if (!(w > 0) || !(h > 0)) return;
      const ar = w / h;
      // Guard against junk values
      if (!Number.isFinite(ar) || ar < 0.2 || ar > 5) return;
      setPipAspectRatio(ar);
    } catch {
      // ignore
    }
  }, []);

  const preferredPipSize = useMemo(() => {
    const width = windowWidth * 0.25;
    const ar = (typeof pipAspectRatio === 'number' && Number.isFinite(pipAspectRatio) && pipAspectRatio > 0)
      ? pipAspectRatio
      : (3 / 4);
    // If ar = w/h => h = w/ar
    const rawHeight = width / ar;
    // Keep within reasonable bounds (iOS may clamp anyway)
    const height = Math.max(80, Math.min(260, rawHeight));
    return { width, height };
  }, [pipAspectRatio]);

  if (Platform.OS !== 'ios') return null;

  return (
    <View style={{position:'absolute',opacity:0.01, width:2, height:2}}>
      <RTCPIPView
        ref={pipRef}
        streamURL={pipStreamURL}
        objectFit="contain"
        mirror={false}
        onDimensionsChange={onPipDimensionsChange}
        iosPIP={{
          enabled: pipEnabled,
          startAutomatically: true,
          stopAutomatically: true,
          preferredSize: preferredPipSize,
        }}
        style={{ width: preferredPipSize.width, height: preferredPipSize.height }}
      >
        {overlay}
      </RTCPIPView>
    </View>
  );
}

const styles = StyleSheet.create({
  groupOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  groupTitle: {
    color: 'white',
    fontWeight: '800',
    fontSize: 14,
    maxWidth: '95%',
  },
  groupSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '700',
    fontSize: 12,
  },
  fallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  fallbackName: {
    color: 'white',
    marginTop: 8,
    fontWeight: '800',
    fontSize: 14,
  },
  fallbackStatus: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '700',
    fontSize: 12,
  },
});


