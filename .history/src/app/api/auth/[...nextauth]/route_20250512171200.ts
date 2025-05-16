import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { db } = await connectToDatabase();

        // Đăng nhập admin
        if (
          credentials?.email === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "1",
            name: "Admin",
            email: "admin@example.com",
          };
        }

        // Đăng nhập user thường
        const user = await db.collection("users").findOne({ email: credentials?.email });
        if (!user) return null;

        // So sánh mật khẩu đã hash
        const isValid = await bcrypt.compare(credentials?.password || "", user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const { db } = await connectToDatabase();
        const existingUser = await db.collection("users").findOne({ email: user.email });
        if (!existingUser) {
          await db.collection("users").insertOne({
            name: user.name,
            email: user.email,
            provider: "google",
            createdAt: new Date(),
          });
        }
        return true;
      }
      return true; // Cho phép đăng nhập với Credentials provider
    },
    async redirect({ url, baseUrl }) {
      // Chuyển hướng sau khi đăng nhập thành công
      return `${baseUrl}/`;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 