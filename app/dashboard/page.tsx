"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  MessageSquare,
  Star,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalSessions: number;
  totalEarnings: number;
  activeClients: number;
  averageRating: number;
  upcomingSessions: Array<{
    _id: string;
    client: {
      name: string;
      image?: string;
    };
    date: string;
    startTime: string;
    status: string;
  }>;
  recentMessages: Array<{
    from: {
      name: string;
      _id: string;
    };
    message: string;
    time: string;
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  const statCards = [
    {
      title: "Total Sessions",
      value: stats?.totalSessions || 0,
      description: "Last 30 days",
      icon: Calendar,
      color: "text-violet-500",
      bgColor: "bg-violet-50",
    },
    {
      title: "Total Earnings",
      value: `$${stats?.totalEarnings || 0}`,
      description: "Last 30 days",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Clients",
      value: stats?.activeClients || 0,
      description: "Current clients",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Average Rating",
      value: stats?.averageRating?.toFixed(1) || "0.0",
      description: "Overall rating",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-full", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
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
              {stats?.upcomingSessions?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming sessions
                </p>
              ) : (
                stats?.upcomingSessions?.map((session) => (
                  <div
                    key={session._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{session.client.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(session.date).toLocaleDateString()} at {session.startTime}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        session.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {session.status}
                    </div>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                className="w-full cursor-pointer hover:bg-muted/50"
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
              {stats?.recentMessages?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No recent messages
                </p>
              ) : (
                stats?.recentMessages?.map((message, i) => (
                  <div 
                    key={i} 
                    className="space-y-1 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/messages?userId=${message.from._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{message.from.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {message.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {message.message}
                    </p>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                className="w-full cursor-pointer hover:bg-muted/50"
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