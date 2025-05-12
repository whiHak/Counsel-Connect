import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import GithubProvider from 'next-auth/providers/github';
import { User } from '@/lib/db/schema';
import connectDB from '@/lib/db/connect';
import { NextAuthOptions } from "next-auth";
import { storeUserRefreshToken } from "@/lib/google/calendar";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar",
          response: "code",
          state: "calendar_auth"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          const newUser = await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            phoneNumber: null,
            isProfileComplete: false,
            role: 'CLIENT'
          });
          user.id = newUser._id.toString();
          user.role = newUser.role;
          user.isProfileComplete = newUser.isProfileComplete;
        } else {
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          user.isProfileComplete = existingUser.isProfileComplete;
        }

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "signIn" && user) {
        token.id = user.id;
        token.role = user.role;
        token.isProfileComplete = user.isProfileComplete;
        // Store refresh token if available from Google OAuth
        if (account?.provider === 'google' && account?.refresh_token) {
          token.googleRefreshToken = account.refresh_token;
        }
      } else if (trigger === "update" && session) {
        token.role = session.user.role;
        token.isProfileComplete = session.user.isProfileComplete;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isProfileComplete = token.isProfileComplete as boolean;
        // Add refresh token to session if available
        session.user.googleRefreshToken = token.googleRefreshToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 