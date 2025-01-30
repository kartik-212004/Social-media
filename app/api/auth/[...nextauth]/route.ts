import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";

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
      async authorize(credentials) {
        console.log(credentials);
      },
    }),
  ],
});
export { handler as GET, handler as POST };
