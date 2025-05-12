"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Google Calendar Integration</h2>
        <p className="text-muted-foreground mb-4">
          Connect your Google Calendar to enable video calls and meeting scheduling.
        </p>
        <Button 
          onClick={handleGoogleAuth}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
        >
          Connect Google Calendar
        </Button>
      </Card>
    </div>
  );
} 