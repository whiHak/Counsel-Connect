"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { PersonalInfoStep } from "./steps/personal-info-step"
import { ProfessionalInfoStep } from "./steps/professional-info-step"
import { DocumentsStep } from "./steps/documents-step"
import { ReviewStep } from "./steps/review-step"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, Loader2 } from "lucide-react"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const fileSchema = z.custom<File>()
  .refine((file) => file instanceof File, "File is required")
  // .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 5MB")

const formSchema = z.object({
  // Personal Info
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string({
    required_error: "Date of birth is required",
  }),
  address: z.string().min(1, "Address is required"),
  
  // Professional Info
  specialization: z.string().min(1, "Specialization is required"),
  experience: z.string().min(1, "Years of experience is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  hourlyRate: z.string().min(0, "Hourly rate must be positive"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(500, "Bio must not exceed 500 characters"),
  
  // Documents
  professionalLicense: fileSchema,
  educationalCredentials: fileSchema,
  identificationDocument: fileSchema,
  photograph: fileSchema,
  workExperience: fileSchema,
  cv: fileSchema,
})

type FormValues = z.infer<typeof formSchema>

const steps = [
  { 
    id: 1, 
    name: "Personal Information",
    description: "Basic details about you"
  },
  { 
    id: 2, 
    name: "Professional Information",
    description: "Your expertise and experience"
  },
  { 
    id: 3, 
    name: "Documents",
    description: "Required certifications and files"
  },
  { 
    id: 4, 
    name: "Review",
    description: "Verify your information"
  },
]

async function uploadFile(file: File, type: string) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("type", type)
  
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error("Failed to upload file")
  }
  
  const data = await response.json()
  return data.url
}

export function CounselorApplicationForm({isPending, setIsPending}: {isPending: boolean, setIsPending: React.Dispatch<React.SetStateAction<boolean>>}) {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialization: "",
      experience: "",
      licenseNumber: "",
      languages: [],
      hourlyRate: "0",
      bio: "",
    },
    mode: "onChange", // Enable real-time validation
  })

  const currentStepValid = async () => {
    let fieldsToValidate: string[] = []
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'address']
        break
      case 2:
        fieldsToValidate = ['specialization', 'experience', 'licenseNumber', 'languages', 'hourlyRate', 'bio']
        break
      case 3:
        fieldsToValidate = ['professionalLicense', 'educationalCredentials', 'identificationDocument', 'photograph', 'workExperience', 'cv']
        break
      default:
        return true
    }
    
    const result = await form.trigger(fieldsToValidate as any)
    return result
  }

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)
      
      // Upload all files first
      const [
        licenseUrl,
        credentialsUrl,
        idUrl,
        photoUrl,
        experienceUrl,
        cvUrl
      ] = await Promise.all([
        uploadFile(data.professionalLicense, "license"),
        uploadFile(data.educationalCredentials, "credentials"),
        uploadFile(data.identificationDocument, "id"),
        uploadFile(data.photograph, "photo"),
        uploadFile(data.workExperience, "experience"),
        uploadFile(data.cv, "cv")
      ])

      // Submit the application
      const response = await fetch("/api/counselor/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          professionalLicense: licenseUrl,
          educationalCredentials: credentialsUrl,
          identificationDocument: idUrl,
          photograph: photoUrl,
          workExperience: experienceUrl,
          cv: cvUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit application")
      }

      const result = await response.json()
      if(result.application.status !== "PENDING") {
        setIsPending(true)
      }
      toast({
        title: "Application Submitted Successfully! 🎉",
        description: "We'll review your application and get back to you soon.",
        duration: 5000,
        style: { color: "green", backgroundColor: "white" },
      })

      window.location.reload()

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
        style: { color: "red", backgroundColor: "white" },
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    const isValid = await currentStepValid()
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly before proceeding.",
        variant: "destructive",
        style: { color: "red", backgroundColor: "white" },
      })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }



  if (isPending) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-10 space-y-6 flex flex-col items-center justify-center text-center">
        
        {/* SVG Spinner Animation */}
        <svg
          className="w-16 h-16 animate-spin text-violet-600 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
  
        {/* Headline */}
        <h2 className=" text-2xl font-bold inset-0 bg-[linear-gradient(to_right,#7C3AED,#2563EB)] bg-clip-text text-transparent">Application Submitted!</h2>
  
        {/* Message */}
        <p className="text-md text-slate-600 max-w-lg">
          Your application is currently <span className="font-semibold text-slate-700">pending review</span>.
          We'll notify you once the process is complete. Thank you for your patience!
        </p>
      </div>
    );
  }
  

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 space-y-8 bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
      {/* Progress Steps */}
      <nav aria-label="Progress" className="mb-12">
        <ol role="list" className="flex items-center justify-between">
          {steps.map((step, index) => (
            <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
              <div className="group flex items-center">
                <span className="flex items-center">
                  <span
                    className={`
                      h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold
                      transition-all duration-300 ease-in-out
                      ${step.id === currentStep 
                        ? 'bg-gradient-primary text-white ring-2 ring-offset-2 ring-violet-600' 
                        : step.id < currentStep
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-600'
                      }
                      ${step.id <= currentStep ? 'shadow-lg' : ''}
                    `}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </span>
                </span>
                <div className="ml-4 min-w-0 flex flex-col">
                  <span className={`text-sm font-semibold ${
                    step.id === currentStep ? 'text-violet-600' : 'text-slate-700'
                  }`}>
                    {step.name}
                  </span>
                  <span className="text-sm text-slate-500">{step.description}</span>
                </div>
              </div>
              {index !== steps.length - 1 && (
                <div className="absolute left-1/2 pl-50 top-5 w-full -translate-x-1/2">
                  <div className="h-0.5 bg-slate-200 w-full relative">
                    <div
                      className={`
                        h-0.5 absolute pl-50 left-0 top-0 transition-all duration-500 
                        ${step.id < currentStep ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-200'}
                      `}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {currentStep === 1 && <PersonalInfoStep form={form} />}
                {currentStep === 2 && <ProfessionalInfoStep form={form} />}
                {currentStep === 3 && <DocumentsStep form={form} />}
                {currentStep === 4 && <ReviewStep form={form} />}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSubmitting}
                  className="w-32 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                >
                  Back
                </Button>
                {currentStep === steps.length ? (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-32 bg-gradient-primary hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={isSubmitting}
                    className="w-32 bg-gradient-primary hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}