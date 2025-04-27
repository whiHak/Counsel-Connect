import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: 'CLIENT' | 'COUNSELOR';
      isProfileComplete: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image: string;
    role: 'CLIENT' | 'COUNSELOR';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'CLIENT' | 'COUNSELOR';
    isProfileComplete: boolean;
  }
} 