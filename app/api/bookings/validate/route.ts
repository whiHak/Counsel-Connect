import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Booking, Counselor } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";
import formatDate from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { counselorId, date, startTime, endTime } = await req.json();

    // Validate counselor exists
    const counselor = await Counselor.findOne({
      userId: counselorId,
    });
    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    // Convert date to proper format for comparison
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.toLocaleDateString();

    // Check if the time slot exists in counselor's availability
    const availableSlot = counselor.workPreferences.availability
      .find((a: any) => formatDate(a.day) === formatDate(dayOfWeek))
      ?.slots.find(
        (slot: any) =>
          slot.startTime === startTime && slot.endTime === endTime
      );

    if (!availableSlot) {
      return NextResponse.json(
        { error: "Time slot not available in counselor's schedule" },
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
      status: { $ne: "cancelled" }, // Exclude cancelled bookings
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot has already been booked" },
        { status: 400 }
      );
    }

    // All validations passed
    return NextResponse.json({ 
      success: true,
      message: "Time slot is available" 
    });
  } catch (error) {
    console.error("Error validating booking:", error);
    return NextResponse.json(
      { error: "Failed to validate booking" },
      { status: 500 }
    );
  }
} 