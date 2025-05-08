"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  MessageSquare,
  Search,
  Star,
  UserCheck,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import{ useEffect, useState } from "react";

export default function HowItWorksPage() {
  const { t } = useLanguage();
  const steps = t('howItWorks.steps');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Array.isArray(steps)) {
      setIsLoading(false);
    }
  }, [steps]);

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('howItWorks.title')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('howItWorks.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton
          [...Array(4)].map((_, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg mb-4"></div>
                  <div className="h-6 bg-primary/10 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-primary/10 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : Array.isArray(steps) ? (
          steps.map((step: any, index: number) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-gradient-primary rounded-full" />
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="inline-block p-3 rounded-lg bg-primary/10">
                    {getStepIcon(index)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('cta.subtitle')}
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/counselors"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
          >
            {t('hero.findCounselor')}
          </a>
          <a
            href="/about"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            {t('hero.learnMore')}
          </a>
        </div>
      </div>
    </div>
  );
}

function getStepIcon(index: number) {
  const icons = [
    <Search key={0} className="w-6 h-6 text-primary" />,
    <Calendar key={1} className="w-6 h-6 text-primary" />,
    <UserCheck key={2} className="w-6 h-6 text-primary" />,
    <MessageSquare key={3} className="w-6 h-6 text-primary" />,
    <BookOpen key={4} className="w-6 h-6 text-primary" />,
    <Star key={5} className="w-6 h-6 text-primary" />,
  ];
  return icons[index];
} 