import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
let navQueue = [];
let previousUserState = null;

function hasSomethingToPopToTop(state) {
  try {
    // Walk down nested navigators to find a stack with index > 0
    let cur = state;
    while (cur && typeof cur === 'object') {
      // Stack/Tab states usually have: { index, routes }
      const idx = typeof cur.index === 'number' ? cur.index : 0;
      const routes = Array.isArray(cur.routes) ? cur.routes : [];

      // React Navigation state objects do not reliably expose a `type` field.
      // We only need to know if there is a nested navigator with something to pop.
      // (For call flows, we're inside a stack/native-stack; this prevents false negatives.)
      if (idx > 0 && routes.length > 1) return true;

      // Try to descend into the currently focused route's nested state
      const focusedRoute = routes[idx] || routes[routes.length - 1];
      cur = focusedRoute?.state;
    }
  } catch {
    // ignore
  }
  return false;
}

// Helper to check if we can safely navigate to a screen
function canNavigateToScreen(name, userData) {
  // Screens available in authenticated navigator
  const authScreens = ['Home', 'Profile', 'Edit Profile', 'Social Profile', 'Posts List', 'Flix List', 'Stories List', 'Solo Story Display', 'Archived', 'Notifications', 'Saved', 'New Chat', 'New Call', 'View Blocked Users', 'Chat Settings General', 'Account Settings', 'Security Settings', 'Deactivate', 'HelpnSupport', 'Contact Us', 'Incoming Call', 'Outgoing Call', 'Video Call'];
  
  // Screens available in unauthenticated navigator
  const unauthScreens = ['Opening', 'Login', 'SignUp', 'Verify', 'Forgot Password', 'Money Transfer', 'Easy Chat', 'Screen 3'];
  
  if (userData) {
    // User is logged in - can only navigate to auth screens
    return authScreens.includes(name);
  } else {
    // User is logged out - can only navigate to unauth screens
    return unauthScreens.includes(name);
  }
}

export function navigate(name, params = {}) {
  if (!navigationRef.isReady()) {
    console.warn('Navigation not ready, queuing:', name);
    navQueue.push({ type: 'navigate', name, params });
    return;
  }

  try {
    // Get current user state from navigation state if available
    // This is a safety check - the main check should be done by the caller
    navigationRef.navigate(name, params);
  } catch (error) {
    console.warn(`Failed to navigate to ${name}:`, error.message);
    // Don't queue failed navigations
  }
}

export function replace(name, params = {}) {
  if (!navigationRef.isReady()) {
    console.warn('Navigation not ready, queuing replace:', name);
    navQueue.push({ type: 'replace', name, params });
    return;
  }
  try {
    navigationRef.dispatch(StackActions.replace(name, params));
  } catch (error) {
    console.warn(`Failed to replace to ${name}:`, error.message);
  }
}

export function resetTo(name, params = {}) {
  if (!navigationRef.isReady()) {
    console.warn('Navigation not ready, queuing resetTo:', name);
    navQueue.push({ type: 'resetTo', name, params });
    return;
  }
  try {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }],
    });
  } catch (error) {
    console.warn(`Failed to resetTo ${name}:`, error.message);
  }
}

export function safeNavigate(name, params = {}, userData) {
  // Check if navigation is safe before attempting
  if (!canNavigateToScreen(name, userData)) {
    console.warn(`Cannot navigate to ${name} - screen not available in current navigator context`);
    return false;
  }
  
  navigate(name, params);
  return true;
}

export function flushNavQueue(userData = null){
  if(navigationRef.isReady()){
    // Process queued actions
    navQueue.forEach((action) => {
      try {
        if (action.type === 'navigate') {
          // Filter to only include valid navigations for current state
          if (userData === null || canNavigateToScreen(action.name, userData)) {
            navigationRef.navigate(action.name, action.params);
          }
        } else if (action.type === 'replace') {
          if (userData === null || canNavigateToScreen(action.name, userData)) {
            navigationRef.dispatch(StackActions.replace(action.name, action.params));
          }
        } else if (action.type === 'resetTo') {
          if (userData === null || canNavigateToScreen(action.name, userData)) {
            navigationRef.reset({ index: 0, routes: [{ name: action.name, params: action.params }] });
          }
        } else if (action.type === 'popToTop') {
          popToTop();
        }
      } catch (error) {
        console.warn(`Failed to flush navigation action:`, error.message);
      }
    });
    
    navQueue = [];
  }
}

// Pop to top of navigation stack (goes back to root screen)
export function popToTop() {
  if (!navigationRef.isReady()) {
    console.warn('Navigation not ready, queuing popToTop');
    navQueue.push({ type: 'popToTop' });
    return;
  }

  try {
    // Fast guard: if nothing to go back to, do nothing (prevents "POP_TO_TOP was not handled" dev warning).
    if (typeof navigationRef.canGoBack === 'function' && !navigationRef.canGoBack()) {
      return;
    }
    const rootState = navigationRef.getRootState?.();
    // If we can't read state, safest is to do nothing (avoid noisy unhandled action warnings).
    if (!rootState) return;
    // Avoid development warnings: POP_TO_TOP is "unhandled" when already at top / nothing to pop.
    if (rootState && !hasSomethingToPopToTop(rootState)) {
      return;
    }
    navigationRef.dispatch(StackActions.popToTop());
  } catch (error) {
    console.warn('Failed to pop to top:', error.message);
    // Don't queue failed actions
  }
}

// Export function to update user state tracking (optional, for better safety)
export function updateUserState(userData) {
  previousUserState = userData;
}
