import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your own logic here to validate the credentials
        if (credentials?.username === process.env.ADMIN_USERNAME && 
            credentials?.password === process.env.ADMIN_PASSWORD) {
          return {
            id: "1",
            name: "Admin",
            email: "admin@example.com",
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Kiểm tra xem email có được phép đăng nhập không
        const allowedEmails = [
          "test@example.com",
          "user@gmail.com",
          "dlicht02@gmail.com",
          "dlicht03@gmail.com"
        ]; // Thay thế bằng danh sách email thực tế
        if (allowedEmails.includes(user.email || "")) {
          return true;
        }
        return false; // Chặn đăng nhập nếu email không được phép
      }
      return true; // Cho phép đăng nhập với Credentials provider
    },
    async redirect({ url, baseUrl }) {
      // Chuyển hướng sau khi đăng nhập thành công
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 