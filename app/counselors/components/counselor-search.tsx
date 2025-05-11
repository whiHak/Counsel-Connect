"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, X, Filter, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export interface CounselorFilters {
  search: string;
  specialization: string;
  language: string;
  maxPrice: number;
  minExperience: number;
}

const specializations = [
  "Anxiety",
  "Depression",
  "Relationships",
  "Stress",
  "Trauma",
  "Career",
  "Family",
  "Grief",
];

const languages = ["English", "Spanish", "French", "German", "Mandarin", "Hindi"];

interface CounselorSearchProps {
  onFiltersChange: (filters: CounselorFilters) => void;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

export default function CounselorSearch({ onFiltersChange }: CounselorSearchProps) {
  const [filters, setFilters] = useState<CounselorFilters>({
    search: "",
    specialization: "",
    language: "",
    maxPrice: 200,
    minExperience: 0,
  });
  const { t } = useLanguage();

  const handleFilterChange = (key: keyof CounselorFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      search: "",
      specialization: "",
      language: "",
      maxPrice: 200,
      minExperience: 0,
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 space-y-6 h-[580px] flex flex-col justify-center"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t('counselors.filters.title')}</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearFilters}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4 mr-2" />
          {t('counselors.filters.reset')}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('counselors.filters.search')}
            className="pl-9 bg-background/50 border-border/50 focus:border-primary/50"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <Select
            value={filters.specialization}
            onValueChange={(value) => handleFilterChange("specialization", value)}
          >
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder={t('counselors.filters.specialization')} />
            </SelectTrigger>
            <SelectContent className="bg-gray-50 ">
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec.toLowerCase()}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Select
            value={filters.language}
            onValueChange={(value) => handleFilterChange("language", value)}
          >
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder={t('counselors.filters.language')} />
            </SelectTrigger>
            <SelectContent className="bg-gray-50 ">
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang.toLowerCase()}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">{t('counselors.filters.maxPrice')}</Label>
            <span className="text-sm font-medium text-primary">${filters.maxPrice}</span>
          </div>
          <div className="pt-2">
            <Slider
              value={[filters.maxPrice]}
              onValueChange={([value]) => handleFilterChange("maxPrice", value)}
              max={200}
              step={10}
              className="mb-2 [&_[role=slider]]:bg-gray-500 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 bg-gray-400 h-[2px]"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>$0</span>
              <span>$200</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">{t('counselors.filters.experience')}</Label>
            <span className="text-sm font-medium text-primary">{filters.minExperience}+ {t('counselors.card.yearsExp')}</span>
          </div>
          <div className="pt-2">
            <Slider
              value={[filters.minExperience]}
              onValueChange={([value]) => handleFilterChange("minExperience", value)}
              max={20}
              step={1}
              className="mb-2 [&_[role=slider]]:bg-gray-500 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 bg-gray-400 h-[2px]"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0</span>
              <span>20+</span>
            </div>
          </div>
        </div>
      </div>

      <Button 
        className="w-full bg-gradient-primary hover:opacity-90 text-white cursor-pointer"
        onClick={handleApplyFilters}
      >
        <Search className="h-4 w-4 mr-2" />
        {t('counselors.filters.search')}
      </Button>
    </motion.div>
  );
} 