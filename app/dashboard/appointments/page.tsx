"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

interface Booking {
  _id: string;
  userId: {
    name: string;
    image: string;
  };
  counselorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled";
  amount: number;
}

const statusConfig = {
  scheduled: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  completed: {
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  cancelled: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings");
        const data = await response.json();
        setBookings(data.bookings);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [toast]);

  const updateBookingStatus = async (
    bookingId: string,
    status: "completed" | "cancelled"
  ) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking");
      }

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId ? { ...booking, status } : booking
        )
      );

      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (booking) => 
      booking.status === "scheduled" && 
      new Date(`${booking.date}`) > new Date()
  );
  
  const pastBookings = bookings.filter(
    (booking) => 
      booking.status !== "scheduled" || 
      new Date(`${booking.date}`) <= new Date()
  );

  console.log(upcomingBookings, pastBookings);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Upcoming Sessions</h2>
        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No upcoming sessions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBookings.map((booking) => (
              <Card key={booking._id} className="relative overflow-hidden">
                <div
                  className={`absolute top-0 right-0 px-3 py-1 text-sm ${
                    statusConfig[booking.status].color
                  }`}
                >
                  {booking.status}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {booking.userId.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(booking.date), "MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {booking.startTime} - {booking.endTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    ${booking.amount}
                  </div>
                  {booking.status === "scheduled" && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1 cursor-pointer bg-gradient-primary text-white"
                        onClick={() =>
                          updateBookingStatus(booking._id, "completed")
                        }
                      >
                        Mark Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 cursor-pointer" 
                        onClick={() =>
                          updateBookingStatus(booking._id, "cancelled")
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Past Sessions</h2>
        {pastBookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No past sessions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastBookings.map((booking) => (
              <Card
                key={booking._id}
                className="bg-muted/50 relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 px-3 py-1 text-sm ${
                    statusConfig[booking.status].color
                  }`}
                >
                  {booking.status}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {booking.userId.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(booking.date), "MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {booking.startTime} - {booking.endTime}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    ${booking.amount}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 