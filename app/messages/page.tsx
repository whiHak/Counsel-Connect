"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Phone, Video, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

interface Message {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  chatRoomId: string;
  read: boolean;
  createdAt: Date;
}

interface ChatRoom {
  _id: string;
  user1Id: string;
  user2Id: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  user: {
    _id: string;
    name: string;
    image?: string;
    role: string;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Fetch chat rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/chats");
        const data = await response.json();
        if (data.chatRooms) {
          setChatRooms(data.chatRooms);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchChatRooms();
    }
  }, [session?.user?.id]);

  // Fetch messages for selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      try {
        const response = await fetch(`/api/messages?chatRoomId=${selectedChat._id}`);
        const data = await response.json();
        if (data.messages) {
          setMessages(data.messages);
          // Mark messages as read
          markMessagesAsRead(selectedChat._id);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!selectedChat) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/messages?chatRoomId=${selectedChat._id}&after=${messages[messages.length - 1]?.createdAt}`);
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(prev => [...prev, ...data.messages]);
          markMessagesAsRead(selectedChat._id);
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [selectedChat, messages]);

  // Mark messages as read
  const markMessagesAsRead = async (chatRoomId: string) => {
    try {
      await fetch(`/api/messages/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatRoomId })
      });

      // Update unread count in chat rooms
      setChatRooms(prev => 
        prev.map(room => 
          room._id === chatRoomId 
            ? { ...room, unreadCount: 0 }
            : room
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !session?.user?.id) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedChat.user._id,
          chatRoomId: selectedChat._id
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const message = await response.json();
      setMessages(prev => [...prev, message]);
      setNewMessage("");

      // Update chat room's last message
      setChatRooms(prev =>
        prev.map(room =>
          room._id === selectedChat._id
            ? {
                ...room,
                lastMessage: newMessage,
                lastMessageDate: new Date()
              }
            : room
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCallFeature = async (type: 'audio' | 'video') => {
    if (!selectedChat) return;

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.user?.googleRefreshToken}`
        },
        body: JSON.stringify({
          chatRoomId: selectedChat._id,
          type
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === "Google Calendar not authorized") {
          toast({
            title: "Authorization Required",
            description: "Please authorize Google Calendar access first",
            variant: "destructive",
            className:"bg-red-500 text-white",
          });
          // Redirect to Google authorization
          window.location.href = '/api/auth/google';
          return;
        }
        throw new Error("Failed to create meeting");
      }

      const { meetingLink, eventLink } = await response.json();
      
      // Open meeting link in a new tab
      window.open(meetingLink, '_blank');

      // Send a system message about the meeting
      const messageContent = `${session?.user?.name} started a ${type} call.`;
      const messageContent2 = `Join the meeting👉: ${meetingLink}`;
      const messageContent3 = `Check your calendar for details: ${eventLink}`;
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageContent,
          receiverId: selectedChat.user._id,
          chatRoomId: selectedChat._id
        }),
      });

      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageContent2,
          receiverId: selectedChat.user._id,
          chatRoomId: selectedChat._id
        }),
      });

      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageContent3,
          receiverId: selectedChat.user._id,
          chatRoomId: selectedChat._id
        }),
      });
      toast({
        title: "Meeting Created!",
        description: `Your ${type} call has been scheduled and started. Check your calendar for details.`,
        variant: "default",
        className: "bg-gradient-primary text-white",
      });
      window.open(meetingLink, '_blank');
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive",
        style: { backgroundColor: "red", color: "white" },
      });
    }
  };

  const renderMessageContent = (content: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    if (content.includes('Join the meeting👉:')) {
      const parts = content.split('Join the meeting👉:');
      return (
        <>
          {parts[0]}
          {parts[1] && (
            <>
              Join the meeting👉:{' '}
              <a 
                href={parts[1].trim()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600 underline"
              >
                Click here to join
              </a>
            </>
          )}
        </>
      );
    } else if (content.includes('Check your calendar for details:')) {
      const parts = content.split('Check your calendar for details:');
      return (
        <>
          {parts[0]}
          {parts[1] && (
            <>
              Check your calendar for details:{' '}
              <a 
                href={parts[1].trim()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600 underline"
              >
                View in Calendar
              </a>
            </>
          )}
        </>
      );
    } else if (urlRegex.test(content)) {
      return content.split(urlRegex).map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600 underline"
            >
              {part}
            </a>
          );
        }
        return part;
      });
    }
    
    return content;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] container mx-auto gap-4 p-4">
      {/* Chat List */}
      <Card className="w-1/4 p-4 overflow-y-auto bg-gray-50/30 backdrop-blur-sm">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 bg-white"
            />
          </div>
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading chats...</div>
          ) : chatRooms.length === 0 ? (
            <div className="text-center text-muted-foreground">No chats found, Book a session first.</div>
          ) : (
            chatRooms.map((room) => (
              <div
                key={room._id}
                onClick={() => setSelectedChat(room)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gradient-to-r from-indigo-50 to-purple-50 ${
                  selectedChat?._id === room._id 
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 shadow-sm" 
                    : ""
                }`}
              >
                <Avatar>
                  <AvatarImage src={room.user.image} />
                  <AvatarFallback className="bg-gradient-to-r from-indigo-400 to-purple-400 text-white">
                    {room.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{room.user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {room.lastMessage || "No messages yet"}
                  </p>
                </div>
                {room.unreadCount > 0 && (
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                    {room.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col bg-gray-50/30 backdrop-blur-sm">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white/50 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedChat.user.image} />
                  <AvatarFallback className="bg-gradient-to-r from-indigo-400 to-purple-400 text-white">
                    {selectedChat.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedChat.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.user.role.toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-indigo-50 cursor-pointer"
                  onClick={() => handleCallFeature('audio')}
                >
                  <Phone className="h-4 w-4 text-indigo-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-purple-50 cursor-pointer"
                  onClick={() => handleCallFeature('video')}
                >
                  <Video className="h-4 w-4 text-purple-600" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.senderId === session?.user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                      message.senderId === session?.user?.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-tr-none"
                        : "bg-white rounded-tl-none"
                    }`}
                  >
                    <p>{renderMessageContent(message.content)}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === session?.user?.id
                        ? "text-indigo-100"
                        : "text-gray-400"
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white/50 backdrop-blur-sm">
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
                  className="flex-1 bg-white"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-full inline-block">
                <Send className="h-6 w-6" />
              </div>
              <p className="text-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Select a chat to start messaging
              </p>
              <p className="text-muted-foreground">
                Choose a conversation from the list to begin
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 