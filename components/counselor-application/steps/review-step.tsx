import { UseFormReturn } from "react-hook-form"

interface ReviewStepProps {
  form: UseFormReturn<any>
}

export function ReviewStep({ form }: ReviewStepProps) {
  const values = form.getValues()

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Review Your Application</div>
      
      <div className="space-y-4">
        <section>
          <h3 className="font-medium">Personal Information</h3>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>Full Name: {values.firstName} {values.lastName}</div>
            <div>Email: {values.email}</div>
            <div>Phone: {values.phone}</div>
            <div>Address: {values.address}</div>
            <div>Date of Birth: {values.dateOfBirth}</div>
          </div>
        </section>

        <section>
          <h3 className="font-medium">Professional Information</h3>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>Education: {values.education}</div>
            <div>Specialization: {values.specialization}</div>
            <div>Experience: {values.experience} years</div>
            <div>License Number: {values.licenseNumber}</div>
            <div>Languages: {values.languages?.join(", ")}</div>
            <div>Hourly Rate: ${values.hourlyRate}</div>
          </div>
        </section>

        <section>
          <h3 className="font-medium">Documents</h3>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>Professional License: {values.professionalLicense?.name}</div>
            <div>Educational Credentials: {values.educationalCredentials?.name}</div>
            <div>ID/Passport: {values.identificationDocument?.name}</div>
            <div>Photograph: {values.photograph?.name}</div>
            <div>Work Experience: {values.workExperience?.name}</div>
            <div>CV: {values.cv?.name}</div>
          </div>
        </section>
      </div>

      <p className="text-sm text-muted-foreground text-rose-500">
        Please review all information carefully before submitting your application.
      </p>
    </div>
  )
}