/**
 * WebSocket feature - hook for real-time communication.
 *
 * Enable in backend config.py:
 *   enable_websockets: bool = True
 *
 * Usage:
 *   const { messages, send, isConnected } = useWebSocket("user123");
 *
 *   // Send message
 *   send({ type: "message", content: "Hello!" });
 *
 *   // Messages received automatically update
 *   messages.map(m => <div>{m.content}</div>)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createLogger } from "@/lib/logger";

const logger = createLogger("WebSocket");

export type WebSocketMessage = {
  type: string;
  content?: string;
  from?: string;
  room?: string;
  event?: string;
  data?: unknown;
  [key: string]: unknown;
};

type UseWebSocketOptions = {
  /** Called when connection opens */
  onOpen?: () => void;
  /** Called when connection closes */
  onClose?: () => void;
  /** Called when a message is received */
  onMessage?: (message: WebSocketMessage) => void;
  /** Called on error */
  onError?: (error: Event) => void;
  /** Auto-reconnect on disconnect */
  reconnect?: boolean;
  /** Reconnect delay in ms */
  reconnectDelay?: number;
};

/**
 * Hook for WebSocket connection.
 *
 * @param clientId - Unique identifier for this client
 * @param options - Configuration options
 */
export function useWebSocket(clientId: string, options: UseWebSocketOptions = {}) {
  const { reconnect = true, reconnectDelay = 3000 } = options;

  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Use refs for callbacks to avoid reconnection on callback change
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      // Don't connect if already connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      const wsUrl = `${
        import.meta.env.VITE_WS_URL || "ws://localhost:8000"
      }/ws/${clientId}`;

      logger.info(`Connecting to ${wsUrl}`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (!isMounted) return;
        logger.info("Connected");
        setIsConnected(true);
        optionsRef.current.onOpen?.();
      };

      ws.onclose = () => {
        if (!isMounted) return;
        logger.info("Disconnected");
        setIsConnected(false);
        optionsRef.current.onClose?.();

        // Auto-reconnect
        if (reconnect && isMounted) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              logger.info("Reconnecting...");
              connect();
            }
          }, reconnectDelay);
        }
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          logger.debug("Received:", message);
          setMessages((prev) => [...prev, message]);
          optionsRef.current.onMessage?.(message);
        } catch (err) {
          logger.error("Failed to parse message:", err);
        }
      };

      ws.onerror = (error) => {
        if (!isMounted) return;
        logger.error("Error:", error);
        optionsRef.current.onError?.(error);
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [clientId, reconnect, reconnectDelay]);

  /**
   * Send a message through WebSocket.
   */
  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      logger.debug("Sent:", message);
    } else {
      logger.warn("Cannot send - not connected");
    }
  }, []);

  /**
   * Send a chat message (shorthand).
   */
  const sendMessage = useCallback(
    (content: string) => {
      send({ type: "message", content });
    },
    [send]
  );

  /**
   * Join a room.
   */
  const joinRoom = useCallback(
    (room: string) => {
      send({ type: "join_room", room });
    },
    [send]
  );

  /**
   * Leave a room.
   */
  const leaveRoom = useCallback(
    (room: string) => {
      send({ type: "leave_room", room });
    },
    [send]
  );

  /**
   * Send message to a room.
   */
  const sendToRoom = useCallback(
    (room: string, content: string) => {
      send({ type: "room_message", room, content });
    },
    [send]
  );

  /**
   * Send private message to another client.
   */
  const sendPrivate = useCallback(
    (to: string, content: string) => {
      send({ type: "private", to, content });
    },
    [send]
  );

  /**
   * Clear received messages.
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isConnected,
    send,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendToRoom,
    sendPrivate,
    clearMessages,
  };
}
