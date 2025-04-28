import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import { User, Booking, Message, ChatRoom } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all clients who have had sessions with this counselor
    const bookings = await Booking.find({
      counselorId: token.userId,
      status: { $in: ["scheduled", "completed"] }
    }).populate("userId", "name email image");

    // Get unique client IDs
    const clientIds = [...new Set(bookings.map(booking => booking.userId._id.toString()))];

    // Get session counts for each client
    const clientSessions = await Promise.all(
      clientIds.map(async (clientId) => {
        const totalSessions = await Booking.countDocuments({
          counselorId: token.userId,
          userId: clientId,
        });

        // Get the last interaction (message or booking)
        const lastChatRoom = await ChatRoom.findOne({
          $or: [
            { user1Id: clientId, user2Id: token.userId },
            { user1Id: token.userId, user2Id: clientId }
          ]
        }).sort({ lastMessageDate: -1 });

        const lastBooking = await Booking.findOne({
          counselorId: token.userId,
          userId: clientId,
          status: { $in: ["scheduled", "completed"] }
        }).sort({ date: -1 });

        let lastInteraction = null;
        if (lastChatRoom?.lastMessageDate || lastBooking?.date) {
          lastInteraction = formatLastInteraction(
            lastChatRoom?.lastMessageDate || lastBooking?.date
          );
        }

        const clientInfo = bookings.find(
          booking => booking.userId._id.toString() === clientId
        )?.userId;

        return {
          _id: clientId,
          name: clientInfo.name,
          email: clientInfo.email,
          image: clientInfo.image,
          totalSessions,
          lastInteraction
        };
      })
    );

    return NextResponse.json({ clients: clientSessions });

  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

function formatLastInteraction(date: Date): string {
  const now = new Date();
  const interactionDate = new Date(date);
  const diffInHours = (now.getTime() - interactionDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const minutes = Math.floor((now.getTime() - interactionDate.getTime()) / (1000 * 60));
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return interactionDate.toLocaleDateString();
  }
}
