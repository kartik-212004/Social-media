"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

const Message: React.FC = () => {
  const [clientCount, setClientCount] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { sender: string; text: string; time: string }[]
  >([]);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("connecting");
  const socketRef = useRef<WebSocket | null>(null);
  const session = useSession();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const WS_URL =
    process.env.NEXT_PUBLIC_WS_URL || "wss://quick-post-phi.vercel.app/8080";

  useEffect(() => {
    // Function to connect to WebSocket
    const connectWebSocket = () => {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.close();
      }

      setConnectionStatus("connecting");
      socketRef.current = new WebSocket(WS_URL);

      socketRef.current.onopen = () => {
        console.log("Connected to WebSocket");
        setConnectionStatus("connected");
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "clientCount") {
            setClientCount(data.count);
          } else if (data.sender && data.text) {
            setMessages((prev) => [...prev, data]);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        setConnectionStatus("disconnected");

        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      socketRef.current?.close();
    };
  }, [WS_URL]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (
      session.data?.user?.name &&
      message.trim() &&
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      const newMessage = {
        sender: session.data.user.name,
        text: message,
        time: new Date().toLocaleTimeString(),
      };
      socketRef.current.send(JSON.stringify(newMessage));
      setMessage("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex-1 dark:border-zinc-800 border-x-2 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-card">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-2">
              {session.data?.user?.name?.[0] || "C"}
            </div>
            <p className="font-medium">
              Chat {clientCount > 0 ? `(${clientCount} online)` : ""}
            </p>
          </div>
          <div className="text-xs flex items-center">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-1 ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            ></span>
            {connectionStatus === "connected"
              ? "Connected"
              : connectionStatus === "connecting"
              ? "Connecting"
              : "Disconnected"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[70%] mb-4 ${
                msg.sender === session.data?.user?.name ? "ml-auto" : "mr-auto"
              }`}
            >
              <div className="flex items-end">
                {msg.sender !== session.data?.user?.name && (
                  <div className="h-6 w-6 rounded-full bg-accent flex-shrink-0 mr-2 mb-1 flex items-center justify-center text-xs font-bold">
                    {msg.sender[0]}
                  </div>
                )}
                <div>
                  {msg.sender !== session.data?.user?.name && (
                    <p className="text-xs font-medium text-muted-foreground mb-1 ml-1">
                      {msg.sender}
                    </p>
                  )}
                  <div
                    className={`p-3 rounded-2xl ${
                      msg.sender === session.data?.user?.name
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-blue-100 dark:bg-blue-900 dark:text-blue-100 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div
                    className={`text-xs text-muted-foreground mt-1 ${
                      msg.sender === session.data?.user?.name
                        ? "text-right"
                        : ""
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-800 flex items-center bg-card">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-full bg-muted text-foreground"
            disabled={connectionStatus !== "connected"}
          />
          <Button
            onClick={handleSendMessage}
            className="ml-2 rounded-full h-10 w-10 p-0 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!message.trim() || connectionStatus !== "connected"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Message;
