"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

interface CounselorProfile {
  id: string;
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
  rating: number;
  reviewCount: number;
}

export default function CounselorDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [counselor, setCounselor] = useState<CounselorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [sessionType, setSessionType] = useState<"video" | "chat">("video");

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

  const handleBookSession = async () => {
    if (!selectedDate || !selectedSlot) {
      toast({
        title: "Error",
        description: "Please select a date and time slot",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          counselorId: params.id,
          date: selectedDate,
          timeSlot: selectedSlot,
          sessionType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book session");
      }

      toast({
        title: "Success",
        description: "Session booked successfully!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive",
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
        <div className="md:col-span-2 space-y-6">
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
                        {counselor.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      ({counselor.reviewCount} reviews)
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
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Experience</h3>
                <p>
                  {counselor.professionalInfo.yearsOfExperience} years of
                  professional experience
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Languages</h3>
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
            </CardContent>
          </Card>
        </div>

        {/* Booking Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-lg font-semibold mb-2">
                  ${counselor.workPreferences.hourlyRate}/hour
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
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                  <Button
                    variant={sessionType === "chat" ? "default" : "outline"}
                    onClick={() => setSessionType("chat")}
                    className="flex-1"
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
                  <SelectContent>
                    {counselor.workPreferences.availability
                      .find(
                        (a) =>
                          a.day.toLowerCase() ===
                          selectedDate?.toLocaleDateString("en-US", {
                            weekday: "long",
                          }).toLowerCase()
                      )
                      ?.slots.map((slot) => (
                        <SelectItem
                          key={`${slot.startTime}-${slot.endTime}`}
                          value={`${slot.startTime}-${slot.endTime}`}
                        >
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleBookSession}
              >
                Book Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 