import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

const loginRateLimitMap = new Map<string, { count: number, last: number }>();
const LOGIN_RATE_LIMIT = 10; // 10 lần
const LOGIN_RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 phút

export const authOptions = {
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
      async authorize(credentials, req) {
        // Rate limit theo IP
        let ip = req?.headers?.get?.('x-forwarded-for') || 'unknown';
        if (Array.isArray(ip)) ip = ip[0];
        const now = Date.now();
        const entry = loginRateLimitMap.get(ip) || { count: 0, last: now };
        if (now - entry.last > LOGIN_RATE_LIMIT_WINDOW) {
          entry.count = 0;
          entry.last = now;
        }
        entry.count++;
        entry.last = now;
        loginRateLimitMap.set(ip, entry);
        if (entry.count > LOGIN_RATE_LIMIT) {
          throw new Error('Too many login attempts, please try again later.');
        }

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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 