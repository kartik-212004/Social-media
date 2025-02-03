import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const handler = NextAuth({
  providers: [
    Github({
      clientSecret: process.env.GITHUB_SECRET ?? "",
      clientId: process.env.GITHUB_ID ?? "",
    }),
    Google({
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      clientId: process.env.GOOGLE_ID ?? "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials: { email: string; password: string }) {
        try {
          const { email, password } = credentials;
          if (!email || !password) {
            throw new Error("Please Fill The Page Properly");
          }
          const user: {
            id?: string;
            password: string;
            email: string;
            image: string | null;
            name: string | null;
            createdAt: Date;
          } | null = await prisma.user.findUnique({
            where: { email: email },
          });

          if (user == null) {
            return null;
          }

          const compare = await bcrypt.compare(password, user?.password);
          if (compare) {
            return {
              email: user.email,
              image: user.image || null,
              name: user.name,
            };
          }
        } catch (error) {
          console.log(error);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: "kartikbhatt",
  callbacks: {
    async session({ session }) {
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (user) {
          session.user.name = user.name;
          session.user.image =
            "https://th.bing.com/th/id/OIP.S171c9HYsokHyCPs9brbPwHaGP?rs=1&pid=ImgDetMain";
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
export { handler as GET, handler as POST };
