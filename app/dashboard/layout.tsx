"use client";

import { cn } from "@/lib/utils";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (isMobile && isOpen && sidebar && !sidebar.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  return (
    <div className="container mx-auto min-h-screen bg-gray-50/30">
      {/* Overlay */}
      {isOpen && (
        <div 
          className=""
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="sticky top-0 z-30 md:hidden bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <div className="font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Dashboard
          </div>
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          id="sidebar"
          className={cn(
            "absolute top-15 left-0 z-30 h-full w-64 transform transition-transform duration-200 ease-in-out",
            "bg-background/80 backdrop-blur-3xl border-b border-border/50 border-r shadow-lg md:shadow-none",
            "md:static md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full",
            "md:transition-none"
          )}
        >
          <div className="h-full overflow-y-auto scrollbar-none">
            <div className="hidden md:flex h-16 items-center justify-center border-b">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Dashboard
              </h2>
            </div>
            <DashboardNav />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
