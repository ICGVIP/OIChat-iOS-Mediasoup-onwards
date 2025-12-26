// contexts/SocketContext.js
import React, { createContext, useEffect } from 'react';
import io from 'socket.io-client';
import { SOCKET_ENDPOINT } from '../services/baseURL';

export const SocketContext = createContext(null);

export const social_socket = io(`${SOCKET_ENDPOINT}`, {
  transports: ['websocket'],
});
 
export const SocketProvider = ({ children }) => {
  useEffect(() => {
    social_socket.on('connect', () => {
      console.log('Socket connected:', social_socket.id);
    });

    // social_socket.on('social message received', (data) => {
    //   console.log('social message received:', data);
    // });
    social_socket.on('edit this social message', (data) => {
      console.log('edit this social message:', data);
    });

    return () => {
      social_socket.disconnect();
      console.log('Socket disconnected');
    };
  }, []);

  return (
    <SocketContext.Provider value={social_socket}>
      {children}
    </SocketContext.Provider>
  );
};
