"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const specializations = [
  { value: "clinical", label: "Clinical Psychology" },
  { value: "counseling", label: "Counseling Psychology" },
  { value: "child", label: "Child Psychology" },
  { value: "family", label: "Family Therapy" },
  { value: "addiction", label: "Addiction Counseling" },
  { value: "cognitive", label: "Cognitive Behavioral Therapy" },
  { value: "trauma", label: "Trauma and PTSD" },
  { value: "relationship", label: "Relationship Counseling" },
  { value: "anxiety", label: "Anxiety and Depression" },
  { value: "other", label: "Other" },
]

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Hindi",
  "Arabic",
  "Portuguese",
  "Japanese",
  "Korean",
]

interface ProfessionalInfoStepProps {
  form: UseFormReturn<any>
}

export function ProfessionalInfoStep({ form }: ProfessionalInfoStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Professional Information
        </h2>
        <p className="text-slate-500 mt-1">Tell us about your professional background and expertise</p>
      </div>

      <div className="grid gap-8">
        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-slate-700">Specialization</FormLabel>
              <FormDescription className="text-slate-500">
                Choose your primary area of expertise
              </FormDescription>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full bg-white border-slate-200 hover:border-violet-300 transition-colors">
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-slate-200">
                  {specializations.map((spec) => (
                    <SelectItem 
                      key={spec.value} 
                      value={spec.value}
                      className="hover:bg-violet-50 cursor-pointer"
                    >
                      {spec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-slate-700">Years of Experience</FormLabel>
              <FormDescription className="text-slate-500">
                Total years of professional counseling experience
              </FormDescription>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Enter years of experience"
                  {...field}
                  className="max-w-[200px] bg-white border-slate-200 focus:border-violet-300 focus:ring-violet-300"
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licenseNumber"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-slate-700">License Number</FormLabel>
              <FormDescription className="text-slate-500">
                Your professional counseling license number
              </FormDescription>
              <FormControl>
                <Input
                  placeholder="Enter your professional license number"
                  {...field}
                  className="bg-white border-slate-200 focus:border-violet-300 focus:ring-violet-300"
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="languages"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-slate-700">Languages</FormLabel>
              <FormDescription className="text-slate-500">
                Select all languages you can provide counseling in
              </FormDescription>
              <div className="space-y-4">
                <Select
                  onValueChange={(value) => {
                    if (!field.value.includes(value)) {
                      field.onChange([...field.value, value])
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white border-slate-200 hover:border-violet-300 transition-colors">
                      <SelectValue placeholder="Add a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-slate-200">
                    {languages.map((lang) => (
                      <SelectItem
                        key={lang}
                        value={lang}
                        disabled={field.value.includes(lang)}
                        className="hover:bg-violet-50 cursor-pointer"
                      >
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {field.value.map((lang: string) => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="py-1.5 px-3 text-sm bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 border-0"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => {
                          field.onChange(
                            field.value.filter((l: string) => l !== lang)
                          )
                        }}
                        className="ml-2 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hourlyRate"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-slate-700">Hourly Rate (USD)</FormLabel>
              <FormDescription className="text-slate-500">
                Set your counseling session rate per hour
              </FormDescription>
              <FormControl>
                <div className="relative max-w-[200px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    className="pl-7 bg-white border-slate-200 focus:border-violet-300 focus:ring-violet-300"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-slate-700">Professional Bio</FormLabel>
              <FormDescription className="text-slate-500">
                Write a brief description of your professional background, approach, and areas of expertise (50-500 characters)
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Share your counseling philosophy and what makes your approach unique..."
                  className="min-h-[120px] resize-y bg-white border-slate-200 focus:border-violet-300 focus:ring-violet-300"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center text-xs">
                <div className="text-slate-500">
                  {field.value?.length || 0}/500 characters
                </div>
                {field.value?.length > 0 && (
                  <div className={`font-medium ${
                    field.value.length < 50 ? 'text-amber-500' :
                    field.value.length <= 500 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {field.value.length < 50 ? 'Too short' :
                     field.value.length <= 500 ? 'Perfect length' : 'Too long'}
                  </div>
                )}
              </div>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}