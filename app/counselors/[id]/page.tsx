"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Clock, MessageSquare, Star, Video } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import formatDate, { disablePastDates } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface CounselorProfile {
  id: string;
  userId: string;
  personalInfo: {
    fullName: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
  };
  professionalInfo: {
    specializations: string[];
    languages: string[];
    yearsOfExperience: number;
    licenseNumber: string;
  };
  workPreferences: {
    hourlyRate: number;
    availability: {
      day: string;
      slots: {
        startTime: string;
        endTime: string;
      }[];
    }[];
  };
  imageUrl: string;
  reviews: {
    rating: number
  }[]
  rating: number;
  reviewCount: number;
}

export default function CounselorDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [counselor, setCounselor] = useState<CounselorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [sessionType, setSessionType] = useState<"video" | "chat">("video");
  const router = useRouter();
  const {t} = useLanguage();

  useEffect(() => {
    const fetchCounselor = async () => {
      try {
        const response = await fetch(`/api/counselors/${params.id}`);
        const data = await response.json();
        setCounselor(data);
      } catch (error) {
        console.error("Error fetching counselor:", error);
      }
    };

    if (params.id) {
      fetchCounselor();
    }
  }, [params.id]);

  const handleBookSession = async (e: any) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      toast({
        title: "Error",
        description: "Please select a date and time slot",
        variant: "destructive",
        style: {
          backgroundColor: "#f44336",
          color: "#fff",
        },
      });
      return;
    }

    try {
      // First, validate the time slot availability
      const [startTime, endTime] = selectedSlot.split("-");
      const validationResponse = await fetch("/api/bookings/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          counselorId: counselor?.userId,
          date: selectedDate,
          startTime,
          endTime,
        }),
      });

      const validationData = await validationResponse.json();

      if (!validationResponse.ok) {
        toast({
          title: "Error",
          description: validationData.error || "This time slot is not available",
          variant: "destructive",
          style: {
            backgroundColor: "#f44336",
            color: "#fff",
          },
        });
        return;
      }

      // If validation passes, create checkout session
      const response = await fetch("/api/checkout_session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          counselorId: counselor?.userId,
          date: selectedDate,
          timeSlot: selectedSlot,
          sessionType,
          amount: counselor?.workPreferences.hourlyRate
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      toast({
        title: "Redirecting to checkout",
        description: "Please complete your payment to confirm the booking",
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
        },
      });

      // Use router.push for the redirect
      router.push(data.url);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book session. Please try again.",
        variant: "destructive",
        style: {
          backgroundColor: "#f44336",
          color: "#fff",
        },
      });
    }
  };

  if (!counselor) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={counselor.imageUrl} />
                  <AvatarFallback>
                    {counselor.personalInfo.fullName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    {counselor.personalInfo.fullName}
                  </h1>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">
                        {counselor.reviews ? counselor.reviews[0]?.rating?.toFixed(1) : 0}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      (1 reviews)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {counselor.professionalInfo.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('counselors.card.about')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('counselors.filters.experience')}</h3>
                <p>
                  {counselor.professionalInfo.yearsOfExperience} years of
                  professional experience
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('counselors.filters.language')}</h3>
                <div className="flex flex-wrap gap-2">
                  {counselor.professionalInfo.languages.map((lang) => (
                    <Badge key={lang} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">License</h3>
                <p>License Number: {counselor.professionalInfo.licenseNumber}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <p>Phone Number: {counselor.personalInfo.phoneNumber}</p>
                <p>Address: {counselor.personalInfo.address}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Section */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('counselors.card.bookSession')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-lg font-semibold mb-2">
                  ETB {counselor.workPreferences.hourlyRate}/hour
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Session Type
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={sessionType === "video" ? "default" : "outline"}
                    onClick={() => setSessionType("video")}
                    className={`flex-1 cursor-pointer ${
                      sessionType === "video" ? "bg-gradient-primary text-white" : ""}`}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                  <Button
                    variant={sessionType === "chat" ? "default" : "outline"}
                    onClick={() => setSessionType("chat")}
                    className={`flex-1 cursor-pointer ${
                      sessionType === "chat" ? "bg-gradient-primary text-white" : ""}`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  disabled={disablePastDates}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time Slot</label>
                <Select
                  value={selectedSlot}
                  onValueChange={setSelectedSlot}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50">
                    {(() => {
                      const availableDay = counselor.workPreferences.availability
                        .find(
                          (a) =>
                            formatDate(a.day) ===
                            formatDate(selectedDate?.toDateString() || "")
                        );

                      if (!availableDay) {
                        return (
                          <SelectItem value="-" disabled>
                            No time slots available for this date
                          </SelectItem>
                        );
                      }

                      const currentTime = new Date();
                      const filteredSlots = availableDay.slots.filter((slot) => {
                        if (!isToday(selectedDate!)) return true;
                        
                        const [hours, minutes] = slot.startTime.split(':');
                        const slotTime = new Date();
                        slotTime.setHours(parseInt(hours), parseInt(minutes), 0);
                        return slotTime > currentTime;
                      });

                      if (filteredSlots.length === 0) {
                        return (
                          <SelectItem value="-" disabled>
                            {isToday(selectedDate!) 
                              ? "No more time slots available today"
                              : "No time slots available for this date"}
                          </SelectItem>
                        );
                      }

                      return filteredSlots.map((slot) => (
                        <SelectItem
                          key={`${slot.startTime}-${slot.endTime}`}
                          value={`${slot.startTime}-${slot.endTime}`}
                        >
                          <div className="flex items-center">                            
                            <Clock className="w-4 h-4 mr-2" />
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>


              {/* <form method="POST" action="https://api.chapa.co/v1/hosted/pay" >
                <input type="hidden" name="public_key" value={process.env.NEXT_PUBLIC_TEST_KEY} />
                <input type="hidden" name="tx_ref" value={`booking-${counselor.userId}-${selectedDate?.toISOString().replace(/[-:]/g, '_')}-${selectedSlot.replace(/[^a-zA-Z0-9_.-]/g, '_')}`} />
                <input type="hidden" name="amount" value={counselor.workPreferences.hourlyRate} />
                <input type="hidden" name="currency" value="ETB" />
                <input type="hidden" name="email" value={session?.user?.email} />
                <input type="hidden" name="first_name" value={session?.user?.name?.split(' ')[0]} />
                <input type="hidden" name="last_name" value={session?.user?.name?.split(' ')[1] || ''} />
                <input type="hidden" name="title" value={`Counseling Session with ${counselor.personalInfo.fullName}`} />
                <input type="hidden" name="description" value={`${sessionType} session on ${selectedDate?.toLocaleDateString()} at ${selectedSlot}`} />
                <input type="hidden" name="logo" value={counselor.imageUrl} />
                <input type="hidden" name="callback_url" value={`${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/verify-payment`} />
                <input type="hidden" name="return_url" value={process.env.NEXT_PUBLIC_CHAPA_RETURN_URL} />
                <input type="hidden" name="meta[counselorId]" value={counselor.userId} />
                <input type="hidden" name="meta[date]" value={selectedDate?.toISOString()} />
                <input type="hidden" name="meta[timeSlot]" value={selectedSlot} />
                <input type="hidden" name="meta[sessionType]" value={sessionType} />
                <Button
                  className="w-full bg-gradient-primary text-white cursor-pointer"
                  size="lg"
                  type="submit"
                  disabled={!selectedDate || !selectedSlot}
                >
                  Pay & Book Session
                </Button>
            </form> */}
            <form method="POST" onSubmit={handleBookSession}>
              <Button
                  className="w-full bg-gradient-primary text-white cursor-pointer"
                  size="lg"
                  type="submit"
                  disabled={!selectedDate || !selectedSlot}
                >
                  {t('counselors.card.payAndBook')}
                </Button>
            </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 