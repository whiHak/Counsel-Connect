"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    relationship: z.string().min(1, "Relationship is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  }),
  preferredLanguages: z.array(z.string()).min(1, "Select at least one language"),
  counselingType: z.array(z.string()).min(1, "Select at least one counseling type"),
  preferredGender: z.enum(["Male", "Female", "No Preference"]),
  currentMedications: z.array(z.string()).optional(),
  previousCounseling: z.boolean(),
  previousCounselingDetails: z.string().optional(),
  relevantHealthConditions: z.array(z.string()).optional(),
});

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
];

const counselingTypes = [
  "Individual",
  "Group",
  "Family",
  "Couples",
  "Child/Adolescent",
  "Career",
];

export default function ProfileCompletePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      address: "",
      dateOfBirth: "",
      gender: "Male",
      emergencyContact: {
        name: "",
        relationship: "",
        phoneNumber: "",
      },
      preferredLanguages: [],
      counselingType: [],
      preferredGender: "No Preference",
      currentMedications: [],
      previousCounseling: false,
      previousCounselingDetails: "",
      relevantHealthConditions: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/client/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been completed successfully.",
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
        },
      });

      await signOut({redirect:false})
      router.push("/");
      // router.push("/counselors");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
        style: {
          backgroundColor: "#f44336",
          color: "#fff",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container px-[80px] mx-auto mb-10 max-w-4Ixl space-y-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Complete Your Profile First</h1>
        <p className="text-muted-foreground">
          Please provide some additional information to help us serve you better.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your address" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergencyContact.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter emergency contact name" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContact.relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter relationship" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContact.phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter emergency contact phone" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preferredLanguages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Languages</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange([...field.value, value])}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select languages" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((lang) => (
                        <Button
                          key={lang}
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            field.onChange(field.value.filter((l) => l !== lang))
                          }
                        >
                          {lang} ×
                        </Button>
                      ))}
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="counselingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Counseling Type</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange([...field.value, value])}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select counseling types" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {counselingTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((type) => (
                        <Button
                          key={type}
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            field.onChange(field.value.filter((t) => t !== type))
                          }
                        >
                          {type} ×
                        </Button>
                      ))}
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredGender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Counselor Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="No Preference">No Preference</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Medical History */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Medical History</h2>
            <FormField
              control={form.control}
              name="previousCounseling"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </FormControl>
                  <FormLabel>Have you received counseling before?</FormLabel>
                </FormItem>
              )}
            />

            {form.watch("previousCounseling") && (
              <FormField
                control={form.control}
                name="previousCounselingDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Counseling Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide details about your previous counseling experience"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-primary text-white cursor-pointer">
            {isSubmitting ? "Saving..." : "Complete Profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 