import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Portal, Snackbar } from 'react-native-paper';
import { Text } from 'react-native';

const ToastContext = createContext();

// Duration constants matching react-native-root-toast
const DURATIONS = {
  SHORT: 2000,
  LONG: 3500,
};

// Visuals (keep consistent across light/dark modes)
const TOAST_BG = 'rgb(11,11,11)';
const TOAST_TEXT = 'rgba(255,255,255,0.85)'; // whitish-gray

// Global reference to the toast show function
let globalToastShow = null;

export const ToastProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(DURATIONS.SHORT);
  const [action, setAction] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(TOAST_BG);

  const show = useCallback((msg, options = {}) => {
    setMessage(msg);
    // Map duration constants to milliseconds
    let toastDuration = DURATIONS.SHORT;
    if (options.duration === DURATIONS.LONG) {
      toastDuration = DURATIONS.LONG;
    } else if (options.duration === DURATIONS.SHORT) {
      toastDuration = DURATIONS.SHORT;
    } else if (typeof options.duration === 'number') {
      toastDuration = options.duration;
    }
    setDuration(toastDuration);
    
    // Handle action if provided
    if (options.action) {
      setAction(options.action);
    } else {
      setAction(null);
    }
    
    // Always keep toast background black regardless of theme/options
    setBackgroundColor(TOAST_BG);
    
    // Note: position, shadow, animation, hideOnPress are ignored
    // as react-native-paper Snackbar doesn't support these options
    
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  // Set global reference on mount
  useEffect(() => {
    globalToastShow = show;
    return () => {
      globalToastShow = null;
    };
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      <Portal>
        <Snackbar
          visible={visible}
          onDismiss={hide}
          duration={duration}
          action={action}
          style={{ backgroundColor }}
        >
          <Text style={{ color: TOAST_TEXT }}>
            {message}
          </Text>
        </Snackbar>
      </Portal>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Export a Toast object that mimics react-native-root-toast API
export const Toast = {
  show: (message, options = {}) => {
    if (globalToastShow) {
      globalToastShow(message, options);
    } else {
      console.warn('Toast.show called before ToastProvider is mounted');
    }
  },
  durations: DURATIONS,
  positions: {
    TOP: 20,
    BOTTOM: -20,
    CENTER: 0,
  },
};

