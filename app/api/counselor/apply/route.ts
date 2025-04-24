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
        professionalLicenseUrl: data.professionalLicense,
        educationalCredentialsUrl: data.educationalCredentials,
        cvUrl: data.cv,

      },
      status: "PENDING",
      submittedAt: new Date(),
    })

    // Send an email to the user confirming the application submission
    // await sendEmail({
    //   to: session.user.email,
    //   subject: "Application Submitted",
    //   body: `Dear ${data.firstName},\n\nYour application has been submitted successfully. We will review it and get back to you soon.\n\nBest regards,\nThe Team`
    // })  


    return NextResponse.json({ 
      message: "Application submitted successfully",
      application: application 
    })
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json(
      { error: "Error submitting application" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const application = await CounselorApplication.findOne({
      userId: session.user.id,
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { error: "Error fetching application" },
      { status: 500 }
    )
  }
}