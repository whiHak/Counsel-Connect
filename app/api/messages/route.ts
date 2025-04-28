import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Message, ChatRoom } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { content, receiverId, chatRoomId } = await req.json();

    // Create or get chat room
    let chatRoom;
    if (chatRoomId) {
      chatRoom = await ChatRoom.findById(chatRoomId);
    } else {
      chatRoom = await ChatRoom.findOne({
        $or: [
          { user1Id: token.userId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: token.userId }
        ]
      });

      if (!chatRoom) {
        chatRoom = await ChatRoom.create({
          user1Id: token.userId,
          user2Id: receiverId,
          lastMessage: content,
          lastMessageDate: new Date()
        });
      }
    }

    // Create message
    const message = await Message.create({
      content,
      senderId: token.userId,
      receiverId,
      chatRoomId: chatRoom._id,
      read: false,
      createdAt: new Date()
    });

    // Update chat room's last message
    await ChatRoom.findByIdAndUpdate(chatRoom._id, {
      lastMessage: content,
      lastMessageDate: new Date()
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const chatRoomId = searchParams.get("chatRoomId");
    const after = searchParams.get("after");

    if (!chatRoomId) {
      return NextResponse.json({ error: "Chat room ID is required" }, { status: 400 });
    }

    // Verify user is part of the chat room
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom || (chatRoom.user1Id.toString() !== token.userId && chatRoom.user2Id.toString() !== token.userId)) {
      return NextResponse.json({ error: "Unauthorized access to chat room" }, { status: 403 });
    }

    // Build query
    const query: any = { chatRoomId };
    if (after) {
      query.createdAt = { $gt: new Date(after) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(50);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
} 