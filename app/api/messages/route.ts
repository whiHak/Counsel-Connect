import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { content, receiverId } = await req.json();

    const message = await Message.create({
      content,
      senderId: session.user.id,
      receiverId,
      createdAt: new Date(),
    });

    // Emit the message through socket.io
    const io = (global as any).io;
    if (io) {
      io.to(receiverId).emit("message", message);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    const messages = await Message.find({
      $or: [
        { senderId: session.user.id, receiverId: chatId },
        { senderId: chatId, receiverId: session.user.id },
      ],
    })
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