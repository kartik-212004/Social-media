"use client";
import React, { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ThemeCompatibleMessaging: React.FC = () => {
  const [message, setMessage] = useState("");
  const [names, setNames] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/search");
        const users = response.data.Users;
        setNames(users);
        console.log(users);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  const conversations = [
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      time: "10:30 AM",
      unread: 0,
    },
    {
      id: "2",
      name: "Sarah Smith",
      lastMessage: "Can we talk tomorrow?",
      time: "09:15 AM",
      unread: 2,
    },
    {
      id: "3",
      name: "Mike Johnson",
      lastMessage: "Thanks for your help!",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: "4",
      name: "Emma Wilson",
      lastMessage: "The document looks good",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: "5",
      name: "Alex Brown",
      lastMessage: "When is the meeting?",
      time: "Monday",
      unread: 1,
    },
  ];

  const messages = [
    {
      id: "1",
      sender: "other",
      text: "Hey there! How are you doing?",
      time: "10:20 AM",
    },
    {
      id: "2",
      sender: "me",
      text: "I'm good, thanks! Just working on that project we discussed.",
      time: "10:22 AM",
    },
    {
      id: "3",
      sender: "other",
      text: "That sounds great. How is it coming along?",
      time: "10:25 AM",
    },
    {
      id: "4",
      sender: "me",
      text: "Making good progress. I should have the first draft ready by tomorrow.",
      time: "10:27 AM",
    },
    {
      id: "5",
      sender: "other",
      text: "Perfect! Looking forward to seeing it.",
      time: "10:30 AM",
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-1/4 bg-card dark:border-zinc-800 border-x-2  p-4">
        <h1 className="text-xl font-semibold mb-4">Messages</h1>
        <div className="space-y-1">
          {names.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center border dark:border-zinc-800 rounded-xl px-3 hover:bg-accent transition cursor-pointer"
            >
              <Avatar className="h-10 w-10 bg-muted text-primary font-medium flex items-center justify-center">
                {chat.name.charAt(0)}
              </Avatar>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{chat.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-zinc-800  flex items-center bg-card">
          <Avatar className="h-10 w-10 bg-muted text-primary flex items-center justify-center">
            S
          </Avatar>
          <div className="ml-3">
            <p className="font-medium">Sarah Smith</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[70%] mb-4 ${
                msg.sender === "me" ? "ml-auto text-right" : "text-left"
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.sender === "me"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-accent text-foreground rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {msg.time}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800  flex items-center bg-card">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-full bg-muted text-foreground"
          />
          <Button
            onClick={handleSendMessage}
            className="ml-2 rounded-full h-10 w-10 p-0 flex items-center justify-center"
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

export default ThemeCompatibleMessaging;
