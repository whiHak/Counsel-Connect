import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  MessageSquare,
  Search,
  Star,
  UserCheck,
} from "lucide-react";

const steps = [
  {
    title: "Find Your Counselor",
    description:
      "Browse through our verified counselors and find the one that best matches your needs. Filter by specialization, language, and availability.",
    icon: Search,
  },
  {
    title: "Book a Session",
    description:
      "Choose a convenient time slot from your counselor's schedule and book your session. You can opt for video calls or chat-based counseling.",
    icon: Calendar,
  },
  {
    title: "Initial Consultation",
    description:
      "Have a brief consultation with your counselor to discuss your needs and ensure they're the right fit for you.",
    icon: UserCheck,
  },
  {
    title: "Regular Sessions",
    description:
      "Engage in regular counseling sessions through our secure platform. Your counselor will help you work through your challenges.",
    icon: MessageSquare,
  },
  {
    title: "Track Progress",
    description:
      "Monitor your progress through session notes and personal growth markers. Your counselor will help you set and achieve goals.",
    icon: BookOpen,
  },
  {
    title: "Provide Feedback",
    description:
      "Share your experience and help others find the right counselor by providing feedback and ratings after your sessions.",
    icon: Star,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">How It Works</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get started with online counseling in just a few simple steps. Our
          platform makes it easy to connect with professional counselors and begin
          your journey to better mental health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-gradient-primary rounded-full" />
            <CardContent className="p-6">
              <div className="mb-4">
                <span className="inline-block p-3 rounded-lg bg-primary/10">
                  <step.icon className="w-6 h-6 text-primary" />
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Take the first step towards better mental health. Our counselors are here
          to support you on your journey.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/counselors"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
          >
            Find a Counselor
          </a>
          <a
            href="/about"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
} 