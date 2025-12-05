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
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectDelay?: number;
};

export function useWebSocket(clientId: string, options: UseWebSocketOptions = {}) {
  const { reconnect = true, reconnectDelay = 3000 } = options;

  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const wsUrl = `${import.meta.env.VITE_WS_URL || "ws://localhost:8000"}/ws/${clientId}`;
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
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [clientId, reconnect, reconnectDelay]);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      logger.debug("Sent:", message);
    } else {
      logger.warn("Cannot send - not connected");
    }
  }, []);

  const sendMessage = useCallback((content: string) => send({ type: "message", content }), [send]);
  const joinRoom = useCallback((room: string) => send({ type: "join_room", room }), [send]);
  const leaveRoom = useCallback((room: string) => send({ type: "leave_room", room }), [send]);
  const sendToRoom = useCallback((room: string, content: string) => send({ type: "room_message", room, content }), [send]);
  const sendPrivate = useCallback((to: string, content: string) => send({ type: "private", to, content }), [send]);
  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isConnected, send, sendMessage, joinRoom, leaveRoom, sendToRoom, sendPrivate, clearMessages };
}
