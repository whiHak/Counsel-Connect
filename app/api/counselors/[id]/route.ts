import { NextResponse } from "next/server";
import { Counselor, User } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";

interface Review {
  rating: number;
  comment: string;
  userId: string;
  createdAt: Date;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const counselor = await Counselor.findById(params.id).populate({
      path: "userId",
      model: User,
      select: "name email",
    });

    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 }
      );
    }

    // Calculate average rating from reviews
    const rating = counselor.reviews?.length
      ? counselor.reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) /
        counselor.reviews.length
      : 0;

    return NextResponse.json({
      id: counselor._id,
      personalInfo: counselor.personalInfo,
      professionalInfo: counselor.professionalInfo,
      workPreferences: counselor.workPreferences,
      imageUrl: counselor.imageUrl,
      rating,
      reviewCount: counselor.reviews?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching counselor:", error);
    return NextResponse.json(
      { error: "Failed to fetch counselor" },
      { status: 500 }
    );
  }
} 