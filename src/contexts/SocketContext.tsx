/**
 * SocketContext – Admin Panel
 *
 * Maintains a single authenticated WebSocket connection per browser session.
 * Provides real-time notifications to the entire admin panel.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from '../context/AuthContext';

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const [, payloadBase64] = parts;
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

// Derive ws:// / wss:// from the HTTP API base URL
const WS_URL = API_URL.replace(/^https/, 'wss').replace(/^http/, 'ws').replace('/api/v1', '');

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface SocketContextValue {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const SocketContext = createContext<SocketContextValue>({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token || isTokenExpired(token)) return null;
    return token;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Fetch existing notifications from REST API ──────────────────────────
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/notifications?limit=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json?.data ?? json;
      const items: Notification[] = data?.items ?? [];
      setNotifications(items);
    } catch (err) {
      console.error('[SocketContext] fetch notifications error:', err);
    }
  }, []);

  // ── WebSocket connection ─────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }

    const token = getToken();
    if (!token) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('[SocketContext] WS connected');
      fetchNotifications();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        if (msg.event === 'new_notification' && msg.data) {
          const notif: Notification = msg.data;
          setNotifications((prev) => {
            // Avoid duplicates
            if (prev.some((n) => n.id === notif.id)) return prev;
            return [notif, ...prev];
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      // Auto-reconnect after 5 s if user is still logged in
      reconnectTimer.current = setTimeout(() => {
        if (getToken()) connect();
      }, 5000);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) {
      // User logged out – disconnect websocket and clear state
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      setNotifications([]);
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      return;
    }

    connect();
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, user]);

  // ── REST helpers ─────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error('[SocketContext] markAsRead error:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('[SocketContext] markAllAsRead error:', err);
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{ notifications, unreadCount, isConnected, markAsRead, markAllAsRead }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
