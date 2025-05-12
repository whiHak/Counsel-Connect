import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import { ChatRoom, Message, User } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find all chat rooms where the user is either user1 or user2
    const chatRooms = await ChatRoom.find({
      $or: [
        { user1Id: token.id },
        { user2Id: token.id }
      ]
    }).sort({ lastMessageDate: -1 });

    // Get all other user IDs from the chat rooms
    const otherUserIds = chatRooms.map(room => 
      room.user1Id.toString() === token.id 
        ? room.user2Id 
        : room.user1Id
    );

    // Get user details for all other users
    const users = await User.find(
      { _id: { $in: otherUserIds } },
      "name image role"
    );

    // Get unread message counts for each chat room
    const unreadCounts = await Promise.all(
      chatRooms.map(async (room) => {
        return Message.countDocuments({
          chatRoomId: room._id,
          receiverId: token.id,
          read: false
        });
      })
    );

    // Format the response
    const formattedChatRooms = chatRooms.map((room, index) => {
      const otherUserId = room.user1Id.toString() === token.id 
        ? room.user2Id 
        : room.user1Id;
      const otherUser = users.find(u => u._id.toString() === otherUserId.toString());

      return {
        _id: room._id,
        user: {
          _id: otherUserId,
          name: otherUser?.name || "Unknown User",
          image: otherUser?.image,
          role: otherUser?.role || "CLIENT"
        },
        lastMessage: room.lastMessage,
        lastMessageDate: room.lastMessageDate ? formatMessageTime(room.lastMessageDate) : null,
        unreadCount: unreadCounts[index]
      };
    });

    return NextResponse.json({ chatRooms: formattedChatRooms });

  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat rooms" },
      { status: 500 }
    );
  }
}

function formatMessageTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const minutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString();
  }
} 