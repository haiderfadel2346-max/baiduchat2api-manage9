import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/auth';
import { getUserByUsername, updateUserLastLogin } from '@/lib/db/queries';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('请输入用户名和密码');
        }

        // Get user from database
        const user = await getUserByUsername(credentials.username);

        if (!user) {
          throw new Error('用户名或密码错误');
        }

        if (!user.is_active) {
          throw new Error('账户已被禁用');
        }

        // Verify password
        const isValid = await verifyPassword(
          credentials.password,
          user.password_hash
        );

        if (!isValid) {
          throw new Error('用户名或密码错误');
        }

        // Update last login
        await updateUserLastLogin(user.id);

        return {
          id: user.id.toString(),
          name: user.username,
          email: `${user.username}@local`,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
