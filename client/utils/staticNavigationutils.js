import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
let navQueue = [];
let previousUserState = null;

// Helper to check if we can safely navigate to a screen
function canNavigateToScreen(name, userData) {
  // Screens available in authenticated navigator
  const authScreens = ['Home', 'Profile', 'Edit Profile', 'Social Profile', 'Posts List', 'Flix List', 'Stories List', 'Solo Story Display', 'Archived', 'Notifications', 'Saved', 'New Chat', 'New Call', 'View Blocked Users', 'Chat Settings General', 'Account Settings', 'Security Settings', 'Deactivate', 'HelpnSupport', 'Contact Us'];
  
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
    navQueue.push({name, params});
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
    // Filter queue to only include valid navigations for current state
    const validNavs = navQueue.filter(({name}) => {
      if (userData === null) {
        // If userData not provided, try all (less safe but maintains backward compatibility)
        return true;
      }
      return canNavigateToScreen(name, userData);
    });
    
    validNavs.forEach(({name, params}) => {
      try {
        navigationRef.navigate(name, params);
      } catch (error) {
        console.warn(`Failed to flush navigation to ${name}:`, error.message);
      }
    });
    
    navQueue = [];
  }
}

// Export function to update user state tracking (optional, for better safety)
export function updateUserState(userData) {
  previousUserState = userData;
}
