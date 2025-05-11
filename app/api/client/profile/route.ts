import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User, ClientProfile } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";
import { getToken } from "next-auth/jwt";

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

    // Create or update client profile
    const clientProfile = await ClientProfile.findOneAndUpdate(
      { userId: session.user.id },
      {
        personalInfo: {
          address: data.address,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          emergencyContact: data.emergencyContact,
          nationalIdUrl: data.nationalIdUrl
        },
        preferences: {
          preferredLanguages: data.preferredLanguages,
          counselingType: data.counselingType,
          preferredGender: data.preferredGender
        },
        medicalHistory: {
          currentMedications: data.currentMedications,
          previousCounseling: data.previousCounseling,
          previousCounselingDetails: data.previousCounselingDetails,
          relevantHealthConditions: data.relevantHealthConditions
        },
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    // Update user's profile completion status
    await User.findByIdAndUpdate(session.user.id, {
      isProfileComplete: true,
      phoneNumber: data.phoneNumber
    });

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (token) {
      token.isProfileComplete = true;
      token.phoneNumber = data.phoneNumber;
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: clientProfile
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
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

    const clientProfile = await ClientProfile.findOne({ userId: session.user.id });
    const user = await User.findById(session.user.id);

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: {
        ...clientProfile.toObject(),
        phoneNumber: user?.phoneNumber
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
} 