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
} from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  _id: string;
  client: {
    name: string;
    email: string;
  };
  counselor: {
    name: string;
    email: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  notes?: string;
}

const statusConfig = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  CONFIRMED: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments");
        const data = await response.json();
        setAppointments(data.appointments);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [toast]);

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: "CONFIRMED" | "CANCELLED"
  ) => {
    try {
      const response = await fetch("/api/appointments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }

      setAppointments((prev) =>
        prev.map((app) =>
          app._id === appointmentId ? { ...app, status } : app
        )
      );

      toast({
        title: "Success",
        description: `Appointment ${status.toLowerCase()} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
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

  const upcomingAppointments = appointments.filter(
    (app) => new Date(`${app.date}T${app.startTime}`) > new Date()
  );
  const pastAppointments = appointments.filter(
    (app) => new Date(`${app.date}T${app.startTime}`) <= new Date()
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No upcoming appointments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment._id} className="relative overflow-hidden">
                <div
                  className={`absolute top-0 right-0 px-3 py-1 text-sm ${
                    statusConfig[appointment.status].color
                  }`}
                >
                  {appointment.status}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {session?.user?.email === appointment.client.email
                      ? appointment.counselor.name
                      : appointment.client.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(appointment.date), "MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                  {appointment.status === "PENDING" &&
                    session?.user?.email === appointment.counselor.email && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            updateAppointmentStatus(appointment._id, "CONFIRMED")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            updateAppointmentStatus(appointment._id, "CANCELLED")
                          }
                        >
                          Decline
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
        <h2 className="text-2xl font-bold mb-6">Past Appointments</h2>
        {pastAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No past appointments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastAppointments.map((appointment) => (
              <Card
                key={appointment._id}
                className="bg-muted/50 relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 px-3 py-1 text-sm ${
                    statusConfig[appointment.status].color
                  }`}
                >
                  {appointment.status}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {session?.user?.email === appointment.client.email
                      ? appointment.counselor.name
                      : appointment.client.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(appointment.date), "MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {appointment.startTime} - {appointment.endTime}
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