import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/backend/lib/db';
import { User } from '@/backend/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          await connectDB();
          let user = await User.findOne({ email: credentials.email });
          
          // Auto-provision demo admin if they don't exist
          if (!user && credentials.email === 'admin@educator.com' && credentials.password === 'admin123') {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            user = await User.create({
              name: 'Demo Admin',
              email: 'admin@educator.com',
              password: hashedPassword,
              role: 'admin',
            });
            console.log('✅ Auto-provisioned demo admin');
          }

          if (!user) {
            console.log(`❌ Auth failure: User not found (${credentials.email})`);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log(`❌ Auth failure: Invalid password for ${credentials.email}`);
            return null;
          }

          console.log(`✅ Auth success: ${user.email} (${user.role})`);
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id || token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
