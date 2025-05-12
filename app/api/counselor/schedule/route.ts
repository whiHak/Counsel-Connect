import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Counselor } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    console.log("Session:", token?.userId);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectDB();

    // Update counselor's schedule and hourly rate
    const counselor = await Counselor.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          availability: data.schedules.map((schedule: any) => ({
            day: schedule.date,
            slots: schedule.timeSlots.map((slot: any) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
          })),
          hourlyRate: parseFloat(data.hourlyRate),
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ counselor });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Error updating schedule" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const counselor = await Counselor.findOne({ userId: token.id });

    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      availability: counselor.workPreferences.availability,
      hourlyRate: counselor.workPreferences.hourlyRate,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Error fetching schedule" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Get the authenticated session
    const token = await getToken({
      req: req,
      secret: process.env.NEXTAUTH_SECRET
    });
    if (!token?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    const { schedules, hourlyRate } = await req.json();

    // Format the availability data to match schema
    const availability = schedules.map((schedule: any) => ({
      day: schedule.date,
      slots: schedule.timeSlots.map((slot: any) => ({
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    }));

    // Update counselor's work preferences
    const updatedCounselor = await Counselor.findOneAndUpdate(
      { userId: token.id },
      {
        $set: {
          'workPreferences.hourlyRate': hourlyRate,
          'workPreferences.availability': availability
        }
      },
      { new: true }
    );

    if (!updatedCounselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Schedule updated successfully",
      data: updatedCounselor
    });

  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}