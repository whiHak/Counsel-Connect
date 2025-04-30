"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Star, Clock, Heart, Search, MapPin, Globe2 } from "lucide-react";
import Link from "next/link";
import { CounselorFilters } from "./counselor-search";
import { motion } from "framer-motion";
import formatDate, { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Counselor {
  _id: string;
  userId: string,
  personalInfo: {
    fullName: string,
    phoneNumber: string,
    address: string,
    dateOfBirth: Date,
  },
  professionalInfo: {
    specializations: [string],
    languages: [string],
    yearsOfExperience: number,
    licenseNumber: string,
    licenseUrl: string,
    resumeUrl: string,
  },
  workPreferences: {
    hourlyRate: number,
    availability: [
      {
        day: string,
        slots: [
          {
            startTime: string,
            endTime: string,
          },
        ],
      },
    ],
  },
  imageUrl: string,
  reviews: [
    {
      rating: Number,
      comment: string,
      userId: string
      createdAt: Date
    },
  ],
}

// Updated mock data with better images
// const counselors: Counselor[] = [
//   {
//     id: 1,
//     name: "Dr. Sarah Johnson",
//     image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
//     specializations: ["Anxiety", "Depression", "Relationships"],
//     languages: ["English", "Spanish"],
//     experience: 8,
//     rating: 4.8,
//     hourlyRate: 120,
//     availability: "Next available: Today",
//   },
//   {
//     id: 2,
//     name: "Dr. Michael Chen",
//     image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop",
//     specializations: ["Trauma", "PTSD", "Family Therapy"],
//     languages: ["English", "Mandarin"],
//     experience: 12,
//     rating: 4.9,
//     hourlyRate: 150,
//     availability: "Next available: Tomorrow",
//   },
//   {
//     id: 3,
//     name: "Dr. Emily Rodriguez",
//     image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop",
//     specializations: ["Depression", "Anxiety", "Stress Management"],
//     languages: ["English", "Spanish", "French"],
//     experience: 5,
//     rating: 4.7,
//     hourlyRate: 105,
//     availability: "Next available: Today",
//   },
//   {
//     id: 4,
//     name: "Dr. James Wilson",
//     image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop",
//     specializations: ["Addiction", "Trauma", "Depression"],
//     languages: ["English"],
//     experience: 15,
//     rating: 4.9,
//     hourlyRate: 175,
//     availability: "Next available: In 2 days",
//   },
//   {
//     id: 5,
//     name: "Dr. Lisa Wong",
//     image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop",
//     specializations: ["Relationships", "Family Therapy", "Anxiety"],
//     languages: ["English", "Cantonese", "Mandarin"],
//     experience: 10,
//     rating: 4.8,
//     hourlyRate: 135,
//     availability: "Next available: Tomorrow",
//   },
//   {
//     id: 6,
//     name: "Dr. Robert Miller",
//     image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop",
//     specializations: ["Stress", "Work-Life Balance", "Career"],
//     languages: ["English", "German"],
//     experience: 7,
//     rating: 4.6,
//     hourlyRate: 115,
//     availability: "Next available: Today",
//   },
// ];

interface CounselorListProps {
  filters: CounselorFilters;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function CounselorList({ filters }: CounselorListProps) {
  const[counselors, setCounselors] = useState<Counselor[]>([]);
  const filteredCounselors = counselors.filter((counselor) => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        counselor.personalInfo.fullName.toLowerCase().includes(searchTerm) ||
        counselor.professionalInfo.specializations.some((s) => s.toLowerCase().includes(searchTerm)) ||
        counselor.professionalInfo.languages.some((l) => l.toLowerCase().includes(searchTerm));
      if (!matchesSearch) return false;
    }

    if (filters.specialization && !counselor.professionalInfo.specializations.some(
      (s) => s.toLowerCase() === filters.specialization
    )) {
      return false;
    }

    if (filters.language && !counselor.professionalInfo.languages.some(
      (l) => l.toLowerCase() === filters.language
    )) {
      return false;
    }

    if (counselor.workPreferences.hourlyRate > filters.maxPrice) {
      return false;
    }

    if (counselor.professionalInfo.yearsOfExperience < filters.minExperience) {
      return false;
    }

    return true;
  });

  

  useEffect(() => {
    try {
      const fetchedCounselors = async () => {
        const res = await fetch("/api/counselors");
        if (!res.ok) {
          throw new Error("Failed to fetch counselors");
        }
        const data = await res.json();
        // Update state with fetched data
        setCounselors(data);
        console.log(data)
      }
      fetchedCounselors();
    } catch (error) {
      
    }
  }, [])

  return (
    <div className="space-y-6">
      <motion.div 
        className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 w-full"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {filteredCounselors.map((counselor, index) => (
          <motion.div 
            key={counselor._id}
            variants={fadeIn}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="group flex flex-col h-full border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/20">
              <CardHeader className="flex-row gap-4 items-center pb-2">
                <Avatar className="h-16 w-16 border-2 border-primary/20 ring-2 ring-background">
                  <AvatarImage src={counselor.imageUrl} alt={counselor.personalInfo.fullName}  className="object-cover"/>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {counselor.personalInfo.fullName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {counselor.personalInfo.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center text-primary">
                      <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                      <span className="font-medium">{(counselor.reviews[0]?.rating)?.toString()||0}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {Number(counselor.professionalInfo.yearsOfExperience)} years exp.
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {counselor.professionalInfo.specializations.map((spec) => (
                    <Badge 
                      key={spec} 
                      variant="secondary" 
                      className="bg-secondary/10 text-secondary-foreground/80 hover:bg-secondary/20 transition-colors"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary/70" />
                  Next Available: {formatDate(counselor.workPreferences.availability[0].day)}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-primary/70" />
                    <span className="text-sm text-muted-foreground">
                      {counselor.professionalInfo.languages.join(", ")}
                    </span>
                  </div>
                  <span className="font-semibold text-primary">
                    ${counselor.workPreferences.hourlyRate.toString()}/hr
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-2">
                <Button 
                  asChild 
                  className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity text-white"
                >
                  <Link href={`/counselors/${counselor._id}`}>
                    View Profile
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-primary/20 text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      {filteredCounselors.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No counselors found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We couldn't find any counselors matching your criteria. Try adjusting your filters.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-primary/20 hover:bg-primary/10 transition-colors"
          >
            Reset Filters
          </Button>
        </motion.div>
      )}
    </div>
  );
} 