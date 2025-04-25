"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Plus, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  date: Date;
  timeSlots: TimeSlot[];
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [hourlyRate, setHourlyRate] = useState("150");

  const addTimeSlot = (date: Date) => {
    setSchedules((prev) => {
      const existingSchedule = prev.find(
        (s) => s.date.toDateString() === date.toDateString()
      );

      if (existingSchedule) {
        return prev.map((schedule) =>
          schedule.date.toDateString() === date.toDateString()
            ? {
                ...schedule,
                timeSlots: [
                  ...schedule.timeSlots,
                  {
                    id: Math.random().toString(),
                    startTime: "09:00",
                    endTime: "10:00",
                  },
                ],
              }
            : schedule
        );
      }

      return [
        ...prev,
        {
          date,
          timeSlots: [
            {
              id: Math.random().toString(),
              startTime: "09:00",
              endTime: "10:00",
            },
          ],
        },
      ];
    });
  };

  const removeTimeSlot = (date: Date, slotId: string) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.date.toDateString() === date.toDateString()
          ? {
              ...schedule,
              timeSlots: schedule.timeSlots.filter((slot) => slot.id !== slotId),
            }
          : schedule
      )
    );
  };

  const updateTimeSlot = (
    date: Date,
    slotId: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.date.toDateString() === date.toDateString()
          ? {
              ...schedule,
              timeSlots: schedule.timeSlots.map((slot) =>
                slot.id === slotId ? { ...slot, [field]: value } : slot
              ),
            }
          : schedule
      )
    );
  };

  const selectedSchedule = selectedDate
    ? schedules.find((s) => s.date.toDateString() === selectedDate.toDateString())
    : null;

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('/api/counselor/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedules, hourlyRate })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update schedule');
      }

      toast({
        title: "Success",
        description: "Schedule updated successfully",
        variant: "default",
        style: {
          backgroundColor: "#4caf50",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again.",
        variant: "destructive",
        style: {
          backgroundColor: "#f44336",
          color: "#fff",
        },
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Set Your Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Time Slots</CardTitle>
            <Button
              size="sm"
              onClick={() => selectedDate && addTimeSlot(selectedDate)}
              disabled={!selectedDate}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Slot
            </Button>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-muted-foreground text-center py-8">
                Select a date to manage time slots
              </p>
            ) : selectedSchedule?.timeSlots.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No time slots added for this date
              </p>
            ) : (
              <div className="space-y-4">
                {selectedSchedule?.timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={slot.startTime}
                      onValueChange={(value) =>
                        updateTimeSlot(selectedDate, slot.id, "startTime", value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-50">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem
                            key={i}
                            value={`${i.toString().padStart(2, "0")}:00`}
                          >
                            {`${i.toString().padStart(2, "0")}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>to</span>
                    <Select
                      value={slot.endTime}
                      onValueChange={(value) =>
                        updateTimeSlot(selectedDate, slot.id, "endTime", value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-50">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem
                            key={i}
                            value={`${i.toString().padStart(2, "0")}:00`}
                          >
                            {`${i.toString().padStart(2, "0")}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => removeTimeSlot(selectedDate, slot.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hourly Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">$</span>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="max-w-[200px]"
            />
            <span className="text-muted-foreground">per hour</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSaveChanges}
          className="bg-gradient-primary text-white hover:bg-gradient-to-r from-blue-500 to-purple-500"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}