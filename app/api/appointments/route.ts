import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Appointment, Counselor } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log("Booking appointment data:", data);
    await connectDB();

    // Verify counselor exists and slot is available
    const counselor = await Counselor.findOne({ userId: data.counselorId });
    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    // Check if slot is still available
    const existingAppointment = await Appointment.findOne({
      counselor: data.counselorId,
      date: data.date,
      startTime: data.startTime,
      status: "CONFIRMED",
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "Time slot is no longer available" },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await Appointment.create({
      client: token.userId,
      counselor: data.counselorId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "CONFIRMED",
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return NextResponse.json(
      { error: "Error booking appointment" },
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

    if (!token?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // "client" or "counselor"

    await connectDB();

    const query = role === "counselor"
      ? { counselor: token.userId }
      : { client: token.userId };

    const appointments = await Appointment.find(query)
      .populate("client", "name email")
      .populate("counselor", "name email")
      .sort({ date: 1, startTime: 1 });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Error fetching appointments" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: data.appointmentId,
        $or: [
          { client: session.user.id },
          { counselor: session.user.id }
        ]
      },
      {
        $set: {
          status: data.status,
          notes: data.notes,
        }
      },
      { new: true }
    );

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Error updating appointment" },
      { status: 500 }
    );
  }
} 