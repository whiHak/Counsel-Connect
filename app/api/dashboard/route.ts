import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import { Booking, Message, ChatRoom, User } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get the last 30 days date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total sessions and earnings for last 30 days
    const bookings = await Booking.find({
      counselorId: token.id,
      date: { $gte: thirtyDaysAgo },
    });

    const totalSessions = bookings.length;
    const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);

    // Get active clients (clients with non-cancelled bookings in last 30 days)
    const activeClientsIds = await Booking.distinct("userId", {
      counselorId: token.id,
      date: { $gte: thirtyDaysAgo },
      status: { $ne: "CANCELLED" }
    });

    // Get average rating
    const completedBookings = await Booking.find({
      counselorId: token.id,
      status: "completed",
      rating: { $exists: true }
    });

    const averageRating = completedBookings.length > 0
      ? completedBookings.reduce((sum, booking) => sum + (booking.rating || 0), 0) / completedBookings.length
      : 0;

    // Get upcoming sessions
    const sessions = await Booking.find({
      counselorId: token.id,
      status: "scheduled" 
    })
    .sort({ date: 1, startTime: 1 })
    .limit(5)
    .populate("userId", "name image");

    const currentDate = new Date();
    const upcomingSessions = sessions.filter((booking) => {
      const bookingDate = new Date(booking.date);
      const bookingTime = booking.startTime.split(':');
      const bookingDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        parseInt(bookingTime[0]),
        parseInt(bookingTime[1])
      );
      return bookingDateTime >= currentDate;
    }).sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      const aTime = a.startTime.split(':');
      const bTime = b.startTime.split(':');
      const aDateTime = new Date(
        aDate.getFullYear(),
        aDate.getMonth(),
        aDate.getDate(),
        parseInt(aTime[0]),
        parseInt(aTime[1])
      );
      const bDateTime = new Date(
        bDate.getFullYear(),
        bDate.getMonth(),
        bDate.getDate(),
        parseInt(bTime[0]),
        parseInt(bTime[1])
      );
      return aDateTime.getTime() - bDateTime.getTime();
    });

    // Get recent messages
    const chatRooms = await ChatRoom.find({
      $or: [
        { user1Id: token.id },
        { user2Id: token.id }
      ]
    }).sort({ lastMessageDate: -1 }).limit(5);

    const chatRoomIds = chatRooms.map((chatRoom: any) => chatRoom._id);
    
    const recentMessages = await Message.aggregate([
      {
        $match: {
          chatRoomId: { $in: chatRoomIds }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$chatRoomId",
          message: { $first: "$content" },
          from: { $first: "$senderId" },
          time: { $first: "$createdAt" }
        }
      }
    ]);

    // Get user details for messages
    const userIds = recentMessages.map(msg => msg.from);
    const users = await User.find({ _id: { $in: userIds } }, "name");
    const userMap = Object.fromEntries(users.map(user => [user._id.toString(), user]));

    const formattedMessages = recentMessages.map(msg => ({
      from: {
        _id: msg.from,
        name: userMap[msg.from.toString()]?.name || "Unknown User"
      },
      message: msg.message,
      time: formatMessageTime(msg.time)
    }));

    return NextResponse.json({
      totalSessions,
      totalEarnings,
      activeClients: activeClientsIds.length,
      averageRating,
      upcomingSessions: upcomingSessions.map(session => ({
        _id: session._id,
        client: {
          name: session.userId.name,
          image: session.userId.image
        },
        date: session.date,
        startTime: session.startTime,
        status: session.status
      })),
      recentMessages: formattedMessages
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
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