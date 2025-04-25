"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}

interface Chat {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  lastMessage?: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Fetch user's chats
    const fetchChats = async () => {
      const response = await fetch("/api/chats");
      const data = await response.json();
      setChats(data.chats);
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      // Fetch messages for selected chat
      const fetchMessages = async () => {
        const response = await fetch(`/api/messages/${selectedChat.id}`);
        const data = await response.json();
        setMessages(data.messages);
      };

      fetchMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    if (session?.user?.id) {
      // Initialize socket connection
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");

      socketRef.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      socketRef.current.on("message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [session?.user?.id]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedChat.userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Chat List */}
      <Card className="w-1/4 p-4 overflow-y-auto">
        <div className="space-y-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted ${
                selectedChat?.id === chat.id ? "bg-muted" : ""
              }`}
            >
              <Avatar>
                <AvatarImage src={chat.imageUrl} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{chat.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedChat.imageUrl} />
                <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedChat.name}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === session?.user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.senderId === session?.user?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a chat to start messaging
          </div>
        )}
      </Card>
    </div>
  );
} 