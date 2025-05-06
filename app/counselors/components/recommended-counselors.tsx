import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Counselor {
  _id: string;
  userId: string;
  personalInfo: {
    fullName: string;
    phoneNumber: string;
  };
  professionalInfo: {
    specializations: string[];
    languages: string[];
    yearsOfExperience: number;
    licenseNumber: string;
  };
  workPreferences: {
    hourlyRate: number;
  };
  imageUrl?: string;
  matchScore?: number;
}

export default function RecommendedCounselors() {
  const { data: session } = useSession();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendedCounselors = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/counselors/recommended');
        const data = await response.json();
        if (data.counselors) {
          setCounselors(data.counselors);
        }
      } catch (error) {
        console.error('Error fetching recommended counselors:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchRecommendedCounselors();
    }
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (counselors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-2">
        <ThumbsUp className="w-5 h-5 text-indigo-500" />
        <h2 className="text-2xl font-semibold">Recommended for You</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {counselors.map((counselor) => (
          <Card
            key={counselor._id}
            className="p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => router.push(`/counselors/${counselor._id}`)}
          >
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={counselor.imageUrl} className='object-cover'/>
                <AvatarFallback className="bg-gradient-to-r from-indigo-400 to-purple-400 text-white text-xl">
                  {counselor.personalInfo.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <div>
                  <h3 className="font-semibold">{counselor.personalInfo.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {counselor.professionalInfo.yearsOfExperience} years experience
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium">
                    Match Score: {counselor.matchScore}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {counselor.professionalInfo.specializations.slice(0, 2).map((spec) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-green-600">
                    ${counselor.workPreferences.hourlyRate}/hr
                  </span>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/counselors/${counselor._id}`);
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 