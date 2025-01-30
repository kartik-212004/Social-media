import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import z from "zod";
const mySchema = z.object({
  email: z.string().email("Invalid Email"),
  password: z.string().min(6, "Weak Strength"),
});
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
        const parse = mySchema.safeParse(credentials);
        const { email, password } = credentials;
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
});
export { handler as GET, handler as POST };
