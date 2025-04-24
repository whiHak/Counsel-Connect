import { Metadata } from "next"
import { CounselorApplicationForm } from "@/components/counselor-application/counselor-application-form"

export const metadata: Metadata = {
  title: "Become a Counselor",
  description: "Join our platform as a mental health counselor and help others in their journey to mental wellness.",
}

export default function BecomeCounselorPage() {
  return (
    <div className="container relative min-h-screen py-10">
      <div className="mx-auto max-w-4Ixl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Become a Counselor</h1>
          <p className="text-muted-foreground">
            Join our platform as a mental health professional and make a difference in people&apos;s lives.
          </p>
        </div>
        <CounselorApplicationForm />
      </div>
    </div>
  )
}