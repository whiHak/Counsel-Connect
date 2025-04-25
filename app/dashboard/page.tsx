"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  MessageSquare,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const stats = [
    {
      title: "Total Sessions",
      value: "24",
      description: "Last 30 days",
      icon: Calendar,
      color: "text-violet-500",
      bgColor: "bg-violet-50",
    },
    {
      title: "Total Earnings",
      value: "$2,840",
      description: "Last 30 days",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Clients",
      value: "12",
      description: "Current clients",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Average Rating",
      value: "4.8",
      description: "From 56 reviews",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  const upcomingSessions = [
    {
      client: "Sarah Johnson",
      date: "Today",
      time: "2:00 PM",
      status: "Confirmed",
    },
    {
      client: "Michael Chen",
      date: "Tomorrow",
      time: "10:30 AM",
      status: "Pending",
    },
  ];

  const recentMessages = [
    {
      from: "Abebe Rodriguez",
      message: "Thank you for the session yesterday...",
      time: "2 hours ago",
    },
    {
      from: "Haile Wilson",
      message: "Looking forward to our next meeting...",
      time: "5 hours ago",
    },
    {
      from: "Tesfa Rodriguez",
      message: "Thank you for the session yesterday...",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/dashboard/schedule")}
            className="bg-gradient-primary text-white hover:from-violet-700 hover:to-indigo-700 cursor-pointer"
          >
            <Clock className="mr-2 h-4 w-4" />
            Set Availability
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon
                className={cn("h-4 w-4", stat.color)}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming Sessions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-violet-500" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((session, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{session.client}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {session.date} at {session.time}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium",
                      session.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    )}
                  >
                    {session.status}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => router.push("/dashboard/appointments")}
              >
                View All Appointments
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-500" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{message.from}</p>
                    <span className="text-xs text-muted-foreground">
                      {message.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {message.message}
                  </p>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => router.push("/dashboard/messages")}
              >
                View All Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 