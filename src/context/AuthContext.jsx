import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const resyncCallbacks = useRef(new Set());

  const registerResync = useCallback((callback) => {
    resyncCallbacks.current.add(callback);
    return () => resyncCallbacks.current.delete(callback);
  }, []);

  const triggerResync = useCallback(() => {
    resyncCallbacks.current.forEach((cb) => {
      try { cb(); } catch (e) { console.error('Resync callback error:', e); }
    });
  }, []);

  const connectSocket = useCallback((token) => {
    const newSocket = io(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setSocketStatus('connected');
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setSocketStatus('connected');
      triggerResync();
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketStatus('disconnected');
    });

    newSocket.on('connect_error', () => {
      setSocketStatus('reconnecting');
    });

    setSocket(newSocket);
    return newSocket;
  }, [triggerResync]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        connectSocket(token);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [connectSocket]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    connectSocket(data.token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket) socket.disconnect();
    setUser(null);
    setSocket(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, socket, socketStatus, registerResync }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export function useSocketResync(fetchFn) {
  const { registerResync } = useAuth();
  useEffect(() => {
    if (fetchFn) return registerResync(fetchFn);
  }, [fetchFn, registerResync]);
}
