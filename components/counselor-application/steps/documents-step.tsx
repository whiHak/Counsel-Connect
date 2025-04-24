import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { FileUpload } from "@/components/ui/file-upload"
import { UseFormReturn } from "react-hook-form"

interface DocumentsStepProps {
  form: UseFormReturn<any>
}

export const DocumentsStep = ({ form }: DocumentsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Required Documents</div>
      <div className="grid gap-6">
        <FormField
          control={form.control}
          name="professionalLicense"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional License</FormLabel>
              <FileUpload
                endpoint="counselorDocument"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage className="text-red-500" />
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
                endpoint="counselorDocument"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identificationDocument"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identification Document</FormLabel>
              <FileUpload
                endpoint="counselorDocument"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photograph"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Photograph</FormLabel>
              <FileUpload
                endpoint="counselorDocument"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Experience Documents</FormLabel>
              <FileUpload
                endpoint="counselorDocument"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage className="text-red-500" />
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
                endpoint="counselorDocument"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}