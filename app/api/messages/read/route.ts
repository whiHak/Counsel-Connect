import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Message } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { chatRoomId } = await req.json();

    // Mark all messages in the chat room as read where the current user is the receiver
    await Message.updateMany(
      {
        chatRoomId,
        receiverId: token.id,
        read: false
      },
      {
        $set: { read: true }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
} 