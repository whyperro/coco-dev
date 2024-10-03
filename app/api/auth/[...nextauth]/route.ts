import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '@/lib/db';
import bcrypt from 'bcrypt';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'admin' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials, req) {
        // Find the user in the database
        const userFound = await db.user.findUnique({
          where: {
            username: credentials!.username,
          },
        });

        // Handle case where user is not found
        if (!userFound) throw new Error('No existe el nombre de usuario.');

        // Validate password using bcrypt
        const matchPwd = await bcrypt.compare(
          credentials!.password,
          userFound.password
        );

        if (!matchPwd) throw new Error('La contraseña es errónea.');

        // Return the user object with additional properties
        return {
          id: userFound.id.toString(),
          username: userFound.username,
          branchId: userFound.branchId,
          user_role: userFound.user_role,
        };
      },
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async session({ session, token }) {
      // Add extra data to the session object
      if (token) {
        session.user.id = token.sub!;
        session.user.branchId = token.branchId;
        session.user.user_role = token.user_role;
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add extra data to the JWT object
      if (user) {
        token.branchId = user.branchId;
        token.user_role = user.user_role;
        token.username = user.username;
      }
      return token;
    },
  },

  secret: process.env.NEXTAUTH_SECRET, // Set your secret
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
