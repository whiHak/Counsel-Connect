"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface ChatRoom {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch("/api/chats");
        const data = await response.json();
        setChatRooms(data.chatRooms);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load chat rooms",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
      </div>

      {chatRooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No messages yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {chatRooms.map((chatRoom) => (
            <Card
              key={chatRoom._id}
              className="hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/chat/${chatRoom._id}`)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chatRoom.user.image} alt={chatRoom.user.name} />
                  <AvatarFallback>{chatRoom.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{chatRoom.user.name}</h3>
                    {chatRoom.lastMessageDate && (
                      <span className="text-sm text-muted-foreground">
                        {chatRoom.lastMessageDate}
                      </span>
                    )}
                  </div>
                  {chatRoom.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {chatRoom.lastMessage}
                    </p>
                  )}
                </div>
                {chatRoom.unreadCount > 0 && (
                  <div className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                    {chatRoom.unreadCount}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 