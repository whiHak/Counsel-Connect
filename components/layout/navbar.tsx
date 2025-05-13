"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Menu,
  User,
  MessageSquare,
  Calendar,
  LogOut,
  Heart,
  Settings,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <span className="text-2xl font-bold relative">
                <span className="absolute inset-0 bg-[linear-gradient(to_right,#7C3AED,#2563EB)] bg-clip-text text-transparent">
                  CounselConnect
                </span>
                <span className="opacity-0">CounselConnect</span>
              </span>
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[linear-gradient(to_right,#7C3AED,#2563EB)] transition-all group-hover:w-full"></span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/counselors" onClick={(e) => {
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
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  {t('nav.findCounselors')}
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  {t('nav.howItWorks')}
                </Button>
              </Link>
              {session?.user.role === "CLIENT" && (
                <>
                  <Link href="/messages">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      {t('nav.messages')}
                    </Button>
                  </Link>
                  <Link href="/appointments">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      {t('nav.appointments')}
                    </Button>
                  </Link>
                  <Link href="/become-counselor">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      {t('nav.becomeCounselor')}
                    </Button>
                  </Link>
                </>
              )}
              {session?.user.role === "COUNSELOR" && (
                <>
                  <Link href="/messages">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      {t('nav.messages')}
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <AnimatePresence>
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <LanguageSwitcher />
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors"
                    >
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || ""}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background"></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 mt-2 rounded-xl border border-border/50 bg-card/95 backdrop-blur-3xl p-2"
                  >
                    <div className="flex items-start gap-3 p-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-primary/20">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || ""}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium line-clamp-1">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <div className="space-y-1">
                      <DropdownMenuItem className="flex items-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                        <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                        <Link href="/messages">{t('nav.messages')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        <Link href="/appointments">{t('nav.appointments')}</Link>
                      </DropdownMenuItem>
                      {session?.user.role === "COUNSELOR" && (
                        <DropdownMenuItem className="flex items-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                          <Settings className="mr-2 h-4 w-4 text-primary" />
                          <Link href="/dashboard">{t('nav.dashboard')}</Link>
                        </DropdownMenuItem>
                      )}
                      {session?.user.role === "CLIENT" && (
                        <DropdownMenuItem className="flex items-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                          <Settings className="mr-2 h-4 w-4 text-primary" />
                          <Link href="/become-counselor">
                            {t('nav.becomeCounselor')}
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem className="flex items-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                        <Settings className="mr-2 h-4 w-4 text-primary" />
                        <Link href="/settings">{t('nav.settings')}</Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      className="flex items-center rounded-lg cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 bg-transparent transition-colors cursor-pointer text-nowrap"
                      >
                        {t('nav.signIn')}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg">
                      <DropdownMenuItem onClick={() => signIn("google")} className="cursor-pointer">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => signIn("facebook")} className="cursor-pointer">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Sign in with Facebook
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    onClick={() => signIn("google")}
                    className="bg-[linear-gradient(to_right,#7C3AED,#2563EB)] hover:opacity-90 text-white gap-2 shadow-lg shadow-primary/25 cursor-pointer hidden md:flex flex-nowrap text-nowrap"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t('nav.getStarted')}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
