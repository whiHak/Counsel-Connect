import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ChatRoom, User } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";
import { createMeetingEvent } from "@/lib/google/calendar";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { chatRoomId, type } = await req.json();

    // Verify user is part of the chat room
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom || (chatRoom.user1Id.toString() !== token.userId && chatRoom.user2Id.toString() !== token.userId)) {
      return NextResponse.json({ error: "Unauthorized access to chat room" }, { status: 403 });
    }

    // Check if Google Calendar credentials are set
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      return NextResponse.json({ error: "Google Calendar not authorized" }, { status: 401 });
    }

    // Get both users' details for the meeting
    const [user1, user2] = await Promise.all([
      User.findById(chatRoom.user1Id),
      User.findById(chatRoom.user2Id)
    ]);

    if (!user1?.email || !user2?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Create event start and end times (30 minutes from now)
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes

    try {
      // Create calendar event with Meet link
      const { meetLink, eventLink, eventId } = await createMeetingEvent(
        `${type.charAt(0).toUpperCase() + type.slice(1)} Call: ${user1.name} and ${user2.name}`,
        `${type} call between ${user1.name} and ${user2.name}`,
        startTime,
        endTime,
        [user1.email, user2.email]
      );

      // Update chat room with meeting info
      await ChatRoom.findByIdAndUpdate(chatRoomId, {
        $set: {
          activeMeeting: {
            type,
            meetingLink: meetLink,
            eventLink: eventLink,
            eventId: eventId,
            createdAt: new Date(),
            createdBy: token.userId
          }
        }
      });

      return NextResponse.json({ 
        meetingLink: meetLink,
        eventLink: eventLink
      });
    } catch (error: any) {
      console.error("Google Calendar Error:", error);
      if (error.message?.includes('invalid_grant')) {
        return NextResponse.json({ error: "Google Calendar not authorized" }, { status: 401 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
} 