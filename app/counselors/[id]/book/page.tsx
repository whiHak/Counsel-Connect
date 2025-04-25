"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Clock, CalendarDays } from "lucide-react";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Availability {
  day: string;
  slots: TimeSlot[];
}

interface Counselor {
  name: string;
  hourlyRate: number;
  availability: Availability[];
}

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const fetchCounselor = async () => {
      try {
        const response = await fetch(`/api/counselors/${params.id}`);
        const data = await response.json();
        setCounselor(data);
      } catch (error) {
        console.error("Error fetching counselor:", error);
        toast({
          title: "Error",
          description: "Failed to load counselor information",
          variant: "destructive",
        });
      }
    };

    fetchCounselor();
  }, [params.id, toast]);

  useEffect(() => {
    if (selectedDate && counselor) {
      const daySchedule = counselor.availability.find(
        (a) => new Date(a.day).toDateString() === selectedDate.toDateString()
      );
      setAvailableSlots(daySchedule?.slots || []);
      setSelectedSlot("");
    }
  }, [selectedDate, counselor]);

  const handleBooking = async () => {
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          counselorId: params.id,
          date: selectedDate,
          startTime: selectedSlot,
          endTime: availableSlots.find((slot) => slot.startTime === selectedSlot)
            ?.endTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }

      toast({
        title: "Success!",
        description: "Your appointment has been booked.",
      });

      router.push("/dashboard/appointments");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!counselor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        <p className="text-muted-foreground">
          with {counselor.name} • ${counselor.hourlyRate}/hour
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) =>
                !counselor.availability.some(
                  (a) => new Date(a.day).toDateString() === date.toDateString()
                )
              }
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Select Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableSlots.length > 0 ? (
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot.startTime} value={slot.startTime}>
                      {slot.startTime} - {slot.endTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No available slots for the selected date
              </p>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!selectedDate || !selectedSlot}
              onClick={handleBooking}
            >
              Book Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 