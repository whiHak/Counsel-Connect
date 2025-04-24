import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { User } from "@/lib/db/schema"
import connectDB from "@/lib/db/connect"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        await connectDB()
        const dbUser = await User.findOne({ email: session.user.email })
        if (dbUser) {
          session.user.id = dbUser._id.toString()
          session.user.role = dbUser.role
        }
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB()
        const existingUser = await User.findOne({ email: user.email })
        
        if (!existingUser) {
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            role: "CLIENT"
          })
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
}