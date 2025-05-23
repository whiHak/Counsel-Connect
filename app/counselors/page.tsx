"use client";

import { Suspense, useState } from "react";
import CounselorSearch, { CounselorFilters } from "./components/counselor-search";
import CounselorList from "./components/counselor-list";
import RecommendedCounselors from "./components/recommended-counselors";
import AIMatchPrompt from "./components/ai-match-prompt";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CounselorsPage() {
  const session = useSession();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<CounselorFilters>({
    search: "",
    specialization: "",
    language: "",
    maxPrice: 50,
    minExperience: 0,
  });
  const [aiMatchResults, setAiMatchResults] = useState<any[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);

  const hasActiveFilters = 
    filters.search || 
    filters.specialization || 
    filters.language || 
    filters.maxPrice !== 50 || 
    filters.minExperience > 0;

  const handleAiMatchResults = (results: any[]) => {
    setAiMatchResults(results);
    setShowAiResults(true);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-3xl font-bold mb-8">{t('counselors.title')}</h1>
      
      <div className="grid xl:grid-cols-[380px_1fr] [@media(min-width:1536px)]:grid-cols-[400px_1fr] gap-8">
        <aside className="space-y-6">
          <AIMatchPrompt onMatchResults={handleAiMatchResults} />
          <CounselorSearch onFiltersChange={setFilters} />
        </aside>
        
        <main className="space-y-8">
          {showAiResults ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">AI-Recommended Matches</h2>
              <Suspense fallback={<CounselorListSkeleton />}>
                <CounselorList counselors={aiMatchResults} filters={{
                  search: "",
                  specialization: "",
                  language: "",
                  maxPrice: 50,
                  minExperience: 0,
                }} />
              </Suspense>
            </div>
          ) : (
            <>
              {!hasActiveFilters && session.data?.user.role === "CLIENT" && (
                <Suspense fallback={<CounselorListSkeleton />}>
                  <RecommendedCounselors />
                </Suspense>
              )}
              
              <div>
                {hasActiveFilters && (
                  <h2 className="text-2xl font-semibold mb-4">{t('counselors.searchResults')}</h2>
                )}
                <Suspense fallback={<CounselorListSkeleton />}>
                  <CounselorList filters={filters} />
                </Suspense>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function CounselorListSkeleton() {
  return (
    <div className="space-y-6">
      {Array(6).fill(null).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border rounded-lg">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
} 