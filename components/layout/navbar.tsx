"use client";

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '../ui/button';
import { Menu, User, MessageSquare, Calendar, LogOut, Heart, Settings, Sparkles } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

            <div className="hidden md:flex items-center space-x-1">
              <Link href="/counselors">
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  Find Counselors
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  How It Works
                </Button>
              </Link>
              {session?.user.role === 'CLIENT' && (
                <>
                <Link href="/messages">
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  Messages
                </Button>
              </Link>
                <Link href="/appointments">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    My Appointments
                  </Button>
                </Link>
                </>
              )}
              {session?.user.role === 'COUNSELOR' && (
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    Dashboard
                  </Button>
                </Link>
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
                          alt={session.user.name || ''}
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
                    className="w-64 mt-2 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl p-2"
                  >
                    <div className="flex items-start gap-3 p-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-primary/20">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || ''}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium line-clamp-1">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{session.user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <div className="space-y-1">
                      <DropdownMenuItem className="flex items-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                        <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                        <Link href="/messages">Messages</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        <Link href="/appointments">Appointments</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                        <Heart className="mr-2 h-4 w-4 text-primary" />
                        <Link href="/favorites">Favorites</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                        <Settings className="mr-2 h-4 w-4 text-primary" />
                        <Link href="/settings">Settings</Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem 
                      className="flex items-center rounded-lg cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => signIn('google')}
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => signIn('google')}
                    className="bg-[linear-gradient(to_right,#7C3AED,#2563EB)] hover:opacity-90 text-white gap-2 shadow-lg shadow-primary/25 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    Get Started
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