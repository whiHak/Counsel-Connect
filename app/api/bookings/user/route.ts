import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import { Booking, Counselor } from "@/lib/db/schema";

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

    // First, get all bookings for the user
    const bookings = await Booking.find({ userId: token.userId })
      .sort({ date: -1, startTime: 1 });

    // Then, for each booking, get the counselor details
    const populatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const counselor = await Counselor.findOne(
          { userId: booking.counselorId },
          "personalInfo.fullName imageUrl"
        );
        
        return {
          ...booking.toObject(),
          counselorId: counselor ? {
            _id: counselor._id,
            personalInfo: counselor.personalInfo,
            imageUrl: counselor.imageUrl
          } : null
        };
      })
    );

    return NextResponse.json({ bookings: populatedBookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
} 