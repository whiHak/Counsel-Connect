import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Booking, Counselor, ChatRoom } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";
import { getToken } from "next-auth/jwt";
import formatDate from "@/lib/utils";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Availability {
  day: string;
  slots: TimeSlot[];
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { counselorId, date, timeSlot, sessionType } = await req.json();
    console.log(counselorId)

    // Validate the time slot is available
    const [startTime, endTime] = timeSlot.split("-");
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.toLocaleDateString()

    const counselor = await Counselor.findOne({userId: counselorId});
    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    // Check if the time slot exists in counselor's availability
    const availableSlot = counselor.workPreferences.availability
      .find((a: Availability) => formatDate(a.day) === formatDate(dayOfWeek))
      ?.slots.find(
        (slot: TimeSlot) =>
          slot.startTime === startTime && slot.endTime === endTime
      );

    if (!availableSlot) {
      return NextResponse.json(
        { error: "Time slot not available" },
        { status: 400 }
      );
    }

    // Check if the slot is already booked
    const existingBooking = await Booking.findOne({
      counselorId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
      },
      startTime,
      endTime,
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Time slot already booked" },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await Booking.create({
      userId: token.id,
      counselorId,
      date: bookingDate,
      startTime,
      endTime,
      sessionType,
      status: "scheduled",
      amount: counselor.workPreferences.hourlyRate,
    });

    // Create a chat room for the session if it doesn't exist
    const chatRoom = await ChatRoom.findOneAndUpdate(
      {
        $or: [
          { user1Id: token.id, user2Id: counselorId },
          { user1Id: counselorId, user2Id: token.id },
        ],
      },
      {
        $setOnInsert: {
          user1Id: token.id,
          user2Id: counselorId,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      booking,
      chatRoomId: chatRoom._id,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    
    const bookings = await Booking.find({
      counselorId: token.id,
      status: "scheduled" 
    })
    .sort({ date: 1, startTime: 1 })
    .limit(5)
    .populate("userId", "name image");
    console.log(bookings)

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
} 

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { bookingId, status } = await req.json();

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}