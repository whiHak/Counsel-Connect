import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Counselor, ClientProfile } from "@/lib/db/schema";
import connectDB from "@/lib/db/connect";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get client profile
    const clientProfile = await ClientProfile.findOne({ userId: token.userId });
    if (!clientProfile) {
      // If no profile exists, return general recommendations
      const counselors = await Counselor.find()
        .sort({ "professionalInfo.yearsOfExperience": -1 })
        .limit(3);
      
      return NextResponse.json({ 
        counselors: counselors.map(c => ({
          ...c.toObject(),
          matchScore: 100
        }))
      });
    }

    // Get all counselors
    const allCounselors = await Counselor.find();

    // Calculate match score for each counselor
    const counselorsWithScores = allCounselors.map(counselor => {
      let score = 0;
      let matchPoints = 0;

      // Language match (30 points)
      const languageMatches = counselor.professionalInfo.languages.filter(
        lang => clientProfile.preferences.preferredLanguages.includes(lang)
      ).length;
      if (languageMatches > 0) {
        score += 30 * (languageMatches / counselor.professionalInfo.languages.length);
        matchPoints++;
      }

      // Gender preference match (20 points)
      if (
        clientProfile.preferences.preferredGender === 'No Preference' ||
        !clientProfile.preferences.preferredGender ||
        counselor.personalInfo.gender === clientProfile.preferences.preferredGender
      ) {
        score += 20;
        matchPoints++;
      }

      // Counseling type match (30 points)
      const specialtyMatches = counselor.professionalInfo.specializations.filter(
        spec => clientProfile.preferences.counselingType.includes(spec)
      ).length;
      if (specialtyMatches > 0) {
        score += 30 * (specialtyMatches / counselor.professionalInfo.specializations.length);
        matchPoints++;
      }

      // Experience bonus (20 points)
      if (counselor.professionalInfo.yearsOfExperience >= 5) {
        score += 20;
      } else {
        score += (counselor.professionalInfo.yearsOfExperience / 5) * 20;
      }

      return {
        ...counselor.toObject(),
        matchScore: Math.round(score)
      };
    });

    // Sort by match score and take top 6
    const recommendedCounselors = counselorsWithScores
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    return NextResponse.json({ counselors: recommendedCounselors });
  } catch (error) {
    console.error("Error fetching recommended counselors:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommended counselors" },
      { status: 500 }
    );
  }
} 