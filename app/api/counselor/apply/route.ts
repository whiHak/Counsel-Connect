import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CounselorApplication } from "@/lib/db/schema"
import connectDB  from "@/lib/db/connect"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()

    await connectDB()

    const application = await CounselorApplication.create({
      userId: session.user.id,
      personalInfo: {
        fullName: `${data.firstName} ${data.lastName}`,
        phoneNumber: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth,
      },
      professionalInfo: {
        education: [{
          degree: data.education,
          certificateUrl: data.educationalCredentials,
        }],
        specializations: [data.specialization],
        languages: data.languages,
        yearsOfExperience: parseInt(data.experience),
        licenseNumber: data.licenseNumber,
        licenseUrl: data.professionalLicense,
        resumeUrl: data.cv,
      },
      workPreferences: {
        hourlyRate: data.hourlyRate,
        availability: [], // This can be set later
      },
      documents: {
        identificationUrl: data.identificationDocument,
        photographUrl: data.photograph,
        workExperienceUrl: data.workExperience,
      },
      status: "PENDING",
      submittedAt: new Date(),
    })

    return NextResponse.json({ 
      message: "Application submitted successfully",
      applicationId: application._id 
    })
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json(
      { error: "Error submitting application" },
      { status: 500 }
    )
  }
}