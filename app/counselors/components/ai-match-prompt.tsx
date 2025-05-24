import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface AIMatchPromptProps {
  onMatchResults: (counselors: any[]) => void;
}

export default function AIMatchPrompt({ onMatchResults }: AIMatchPromptProps) {
  const [userCase, setUserCase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async () => {
    if (!userCase.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/counselors/ai-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userCase }),
      });

      const data = await response.json();
      if (data.counselors) {
        onMatchResults(data.counselors);
      }
    } catch (error) {
      console.error('Error in AI matching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t('counselors.filters.ai-title')}</h2>
        </div>
        
        <Textarea
          placeholder={t('counselors.filters.ai-placeholder')}
          className="min-h-[120px] bg-white/80 border-primary/20 focus:border-primary"
          value={userCase}
          onChange={(e) => setUserCase(e.target.value)}
        />
        
        <Button
          className="w-full bg-gradient-primary hover:opacity-90 text-white"
          onClick={handleSubmit}
          disabled={isLoading || !userCase.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('counselors.filters.ai-match-loading')}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {t('counselors.filters.ai-match')}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
} 