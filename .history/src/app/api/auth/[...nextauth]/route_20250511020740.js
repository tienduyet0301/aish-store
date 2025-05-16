import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Kiểm tra xem email có được phép đăng nhập không
      const allowedEmails = ["test@example.com", "user@gmail.com"]; // Thay thế bằng danh sách email thực tế
      if (allowedEmails.includes(user.email)) {
        return true;
      }
      return false; // Chặn đăng nhập nếu email không được phép
    },
    async redirect({ url, baseUrl }) {
      // Chuyển hướng sau khi đăng nhập thành công
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Trang hiển thị lỗi
  },
});

export { handler as GET, handler as POST }; 