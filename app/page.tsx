"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Calendar, Shield, Users, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

const features = [
  {
    icon: <MessageSquare className="h-6 w-6" />,
    key: "secureMessaging",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    key: "flexibleScheduling",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    key: "completePrivacy",
  },
  {
    icon: <Users className="h-6 w-6" />,
    key: "expertCounselors",
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
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

export default function Home() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const benefits = t('benefits.items');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();


  useEffect(() => {
    if (Array.isArray(benefits)) {
      setIsLoading(false);
    }
  }, [benefits]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px)] bg-[size:40px] bg-[linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>
        <div className="container relative mx-auto px-4">
          <motion.div 
            className="absolute -top-40 -right-40 w-96 h-96 bg-accent/30 rounded-full blur-3xl opacity-20"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity
            }}
          />
          <motion.div 
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 10,
              repeat: Infinity
            }}
          />
          
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-muted px-4 py-2 text-sm font-medium bg-background/50 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{t('hero.tagline')}</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="inset-0 bg-[linear-gradient(to_right,#7C3AED,#2563EB)] bg-clip-text text-transparent">{t('hero.title')}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white" asChild>
                  <Link href="/counselors" className="z-10"onClick={(e) => {
                    if (!session) {
                      e.preventDefault();
                      toast({
                        title: "Please login first",
                        description: "You need to be logged in to access this page",
                        variant: "destructive",
                        style:{backgroundColor: "#f8d7da", color: "#721c24"},
                      });
                      signIn("google");
                    }
                  }}>
                    {t('hero.findCounselor')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary/20 text-foreground hover:bg-accent/50 z-10" asChild>
                  <Link href="/how-it-works">{t('hero.learnMore')}</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="aspect-video relative rounded-xl overflow-hidden shadow-2xl border border-muted/20">
                  <Image
                    src="https://images.unsplash.com/photo-1573497019418-b400bb3ab074?q=80&w=2000&auto=format&fit=crop"
                    alt="Online counseling session"
                    layout="fill"
                    objectFit="cover"
                    className="transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-muted/5" />
                </div>
                <div className="absolute -bottom-5 -right-5 bg-background shadow-lg rounded-lg p-4 border border-muted/20 glass md:block hidden" >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">2,500+</p>
                      <p className="text-sm text-muted-foreground">Certified counselors</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="max-w-2xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="inset-0 bg-[linear-gradient(to_right,#7C3AED,#2563EB)] bg-clip-text text-transparent">{t('benefits.title')}</span>
            </h2>
            <p className="text-muted-foreground">{t('benefits.subtitle')}</p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {isLoading ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <motion.div 
                  key={index}
                  variants={fadeIn}
                  className="flex items-center gap-3 p-4 rounded-lg bg-background/80 backdrop-blur-sm border border-muted/30"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10"></div>
                  <div className="h-4 bg-primary/10 rounded w-3/4"></div>
                </motion.div>
              ))
            ) : Array.isArray(benefits) ? (
              benefits.map((benefit: string, index: number) => (
                <motion.div 
                  key={index} 
                  variants={fadeIn}
                  className="flex items-center gap-3 p-4 rounded-lg bg-background/80 backdrop-blur-sm border border-muted/30 hover:shadow-lg transition-all duration-300 glass"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="font-medium">{benefit}</p>
                </motion.div>
              ))
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="inset-0 bg-[linear-gradient(to_right,#7C3AED,#2563EB)] bg-clip-text text-transparent">{t('features.title')}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.key}
                variants={fadeIn}
                className="group bg-background p-6 rounded-xl shadow-sm border border-muted/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t(`features.items.${feature.key}.title`)}</h3>
                <p className="text-muted-foreground">{t(`features.items.${feature.key}.description`)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="relative overflow-hidden rounded-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1573497019418-b400bb3ab074?q=80&w=2000&auto=format&fit=crop"
                alt="Counseling background"
                layout="fill"
                objectFit="cover"
                className="filter brightness-50"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-primary opacity-90" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px)] bg-[size:40px] bg-[linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px]" />
            <div className="relative p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                {t('cta.subtitle')}
              </p>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-transform duration-300" asChild>
                <Link href="/counselors">{t('cta.button')}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
