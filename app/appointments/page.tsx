"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MessageSquare, Video } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

interface Booking {
  _id: string;
  counselorId: {
    _id: string;
    personalInfo: {
      fullName: string;
    };
    imageUrl: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  sessionType: "video" | "chat";
  status: "scheduled" | "completed" | "cancelled";
}

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings/user");
        const data = await response.json();
        setBookings(data.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchBookings();
    }
  }, [session]);

  const currentDate = new Date();

  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const bookingTime = booking.startTime.split(':');
    const bookingDateTime = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate(),
      parseInt(bookingTime[0]),
      parseInt(bookingTime[1])
    );
    return bookingDateTime >= currentDate;
  }).sort((a, b) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);
    const aTime = a.startTime.split(':');
    const bTime = b.startTime.split(':');
    const aDateTime = new Date(
      aDate.getFullYear(),
      aDate.getMonth(),
      aDate.getDate(),
      parseInt(aTime[0]),
      parseInt(aTime[1])
    );
    const bDateTime = new Date(
      bDate.getFullYear(),
      bDate.getMonth(),
      bDate.getDate(),
      parseInt(bTime[0]),
      parseInt(bTime[1])
    );
    return aDateTime.getTime() - bDateTime.getTime();
  });

  const pastBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const bookingTime = booking.startTime.split(':');
    const bookingDateTime = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate(),
      parseInt(bookingTime[0]),
      parseInt(bookingTime[1])
    );
    return bookingDateTime < currentDate;
  }).sort((a, b) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);
    const aTime = a.startTime.split(':');
    const bTime = b.startTime.split(':');
    const aDateTime = new Date(
      aDate.getFullYear(),
      aDate.getMonth(),
      aDate.getDate(),
      parseInt(aTime[0]),
      parseInt(aTime[1])
    );
    const bDateTime = new Date(
      bDate.getFullYear(),
      bDate.getMonth(),
      bDate.getDate(),
      parseInt(bTime[0]),
      parseInt(bTime[1])
    );
    return bDateTime.getTime() - aDateTime.getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const AppointmentCard = ({ booking }: { booking: Booking }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={booking.counselorId.imageUrl || ""} />
              <AvatarFallback>
                {booking.counselorId.personalInfo.fullName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {t('appointments.card.with')} {booking.counselorId.personalInfo.fullName}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(booking.date), "MMMM d, yyyy")}</span>
                <Clock className="w-4 h-4 ml-2" />
                <span>
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge
              className={`${getStatusColor(booking.status)} capitalize`}
              variant="secondary"
            >
              {t(`appointments.card.status.${booking.status}`)}
            </Badge>
            <div className="flex items-center space-x-1">
              {booking.sessionType === "video" ? (
                <Video className="w-4 h-4" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              <span className="text-sm capitalize">{booking.sessionType}</span>
            </div>
          </div>
        </div>
        {new Date(booking.date) >= currentDate && booking.status === "scheduled" && (
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/chat/${booking.counselorId._id}`)}
            >
              {t('appointments.card.actions.message')}
            </Button>
            <Button
              variant="default"
              onClick={() => router.push(`/video/${booking.counselorId._id}`)}
            >
              {t('appointments.card.actions.join')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t('appointments.title')}</h1>
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">{t('appointments.upcoming')}({(upcomingBookings.length)})</TabsTrigger>
          <TabsTrigger value="past">{t('appointments.past') }({(pastBookings.length)})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <AppointmentCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                {t('appointments.noUpcoming')}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastBookings.length > 0 ? (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <AppointmentCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                {t('appointments.noPast')}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 