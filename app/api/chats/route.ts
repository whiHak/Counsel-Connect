import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ChatRoom, User, Message } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find all chat rooms where the user is either user1 or user2
    const chatRooms = await ChatRoom.find({
      $or: [
        { user1Id: token.userId },
        { user2Id: token.userId }
      ]
    }).sort({ lastMessageDate: -1 });

    // Get unread message counts for each chat room
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: token.userId,
          read: false
        }
      },
      {
        $group: {
          _id: "$chatRoomId",
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of chatRoomId to unread count
    const unreadCountMap = new Map(
      unreadCounts.map(({ _id, count }) => [_id.toString(), count])
    );

    // Get other user details for each chat room
    const chatRoomsWithDetails = await Promise.all(
      chatRooms.map(async (room) => {
        const otherUserId = room.user1Id.toString() === token.userId 
          ? room.user2Id 
          : room.user1Id;

        const otherUser = await User.findById(otherUserId);

        return {
          _id: room._id,
          user1Id: room.user1Id,
          user2Id: room.user2Id,
          lastMessage: room.lastMessage,
          lastMessageDate: room.lastMessageDate,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            image: otherUser.image,
            role: otherUser.role
          },
          unreadCount: unreadCountMap.get(room._id.toString()) || 0
        };
      })
    );

    return NextResponse.json({ chatRooms: chatRoomsWithDetails });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat rooms" },
      { status: 500 }
    );
  }
} 