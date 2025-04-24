"use client"
import { CounselorApplicationForm } from "@/components/counselor-application/counselor-application-form"
import React from "react"

// export const metadata: Metadata = {
//   title: "Become a Counselor",
//   description: "Join our platform as a mental health counselor and help others in their journey to mental wellness.",
// }

export default function BecomeCounselorPage() {
  const [isPending, setIsPending] = React.useState(false)
  React.useEffect(() => {
    const checkStatus = async () => {
      const response = await fetch("/api/counselor/apply")
      if (!response.ok) {
        throw new Error("Failed to fetch application status")
      }
      const result = await response.json()
      if (result.application.status === "PENDING") {
        setIsPending(true)
      }
    }
    
      checkStatus()
  },[])
  return (
    <div className="relative min-h-screen py-10">
      <div className="mx-auto max-w-4Ixl space-y-6">
        <div className="space-y-2 text-center">
          {!isPending && (
            <>
              <h1 className="text-3xl font-bold">Become a Counselor</h1>
              <p className="text-muted-foreground">
                Join our platform as a mental health professional and make a difference in people&apos;s lives.
              </p>
            </>
          )}
        </div>
        <CounselorApplicationForm  isPending={isPending} setIsPending={setIsPending} />
      </div>
    </div>
  )
}