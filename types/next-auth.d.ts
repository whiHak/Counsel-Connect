import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: 'CLIENT' | 'COUNSELOR';
    }
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image: string;
    role: 'CLIENT' | 'COUNSELOR';
  }
} 