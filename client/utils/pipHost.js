import { NativeModules, Platform, findNodeHandle } from 'react-native';

/**
 * Global PiP ref holder.
 *
 * Important:
 * - We must have exactly ONE RTCPIPView ref in the whole app to avoid Fabric recycling crashes.
 * - Keep the PiP host view mounted at app root; only change props (enabled/streamURL/overlay).
 */
let _pipRef = null;

export function setGlobalPipRef(ref) {
  _pipRef = ref || null;
}

export function startGlobalIOSPIP() {
  // Manual PiP start intentionally disabled.
  // We rely on RTCPIPView's `iosPIP.startAutomatically` / `stopAutomatically`.
  return;
}

export function stopGlobalIOSPIP() {
  // Manual PiP stop intentionally disabled.
  // We rely on RTCPIPView's `iosPIP.stopAutomatically`.
  return;
}


