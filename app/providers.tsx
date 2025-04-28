"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

function ToastProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      toast({
        title: "Access Denied",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <Toaster />
      </ToastProvider>
    </SessionProvider>
  );
} 