import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FileUpload } from "@/components/ui/file-upload"
import { UseFormReturn } from "react-hook-form"

interface DocumentsStepProps {
  form: UseFormReturn<any>
}

export function DocumentsStep({ form }: DocumentsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Required Documents</div>
      <div className="grid gap-6">
        <FormField
          control={form.control}
          name="professionalLicense"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional License/Certificate</FormLabel>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(file) => field.onChange(file)}
                value={field.value}
                label="Upload License"
                error={form.formState.errors.professionalLicense?.message as string}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="educationalCredentials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Educational Credentials</FormLabel>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(file) => field.onChange(file)}
                value={field.value}
                label="Upload Credentials"
                error={form.formState.errors.educationalCredentials?.message as string}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identificationDocument"
          render={({ field }) => (
            <FormItem>
              <FormLabel>National ID or Passport</FormLabel>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(file) => field.onChange(file)}
                value={field.value}
                label="Upload ID"
                error={form.formState.errors.identificationDocument?.message as string}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photograph"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recent Passport-Sized Photograph</FormLabel>
              <FileUpload
                accept=".jpg,.jpeg,.png"
                onChange={(file) => field.onChange(file)}
                value={field.value}
                label="Upload Photo"
                error={form.formState.errors.photograph?.message as string}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Experience Letter(s) or Reference Letters</FormLabel>
              <FileUpload
                accept=".pdf"
                onChange={(file) => field.onChange(file)}
                value={field.value}
                label="Upload Letters"
                error={form.formState.errors.workExperience?.message as string}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cv"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Curriculum Vitae (CV)</FormLabel>
              <FileUpload
                accept=".pdf,.doc,.docx"
                onChange={(file) => field.onChange(file)}
                value={field.value}
                label="Upload CV"
                error={form.formState.errors.cv?.message as string}
              />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}