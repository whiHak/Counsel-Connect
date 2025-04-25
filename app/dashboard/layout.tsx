"use client";

import { cn } from "@/lib/utils";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 z-40 w-64 bg-background border-r transition-transform duration-200 ease-in-out",
          isOpen && "translate-x-0"
        )}
      >
        <DashboardNav />
      </div>

      {/* Main content */}
      <div className="flex-1">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
