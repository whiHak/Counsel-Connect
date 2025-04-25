import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Counselor } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const counselor = await Counselor.findOne({ userId: session.user.id });

    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      availability: counselor.availability,
      hourlyRate: counselor.hourlyRate,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Error fetching schedule" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    // Get the authenticated session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get request body
    const { schedules, hourlyRate } = await req.json();

    // Format the availability data to match schema
    const availability = schedules.map((schedule: any) => ({
      day: schedule.day,
      slots: schedule.slots.map((slot: any) => ({
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    }));

    // Update counselor's work preferences
    const updatedCounselor = await Counselor.findOneAndUpdate(
      { userId: session.user.id },
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