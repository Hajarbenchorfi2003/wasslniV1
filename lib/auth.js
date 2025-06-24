import Credentials from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        try {
          // Appel à votre backend Express
          const res = await axios.post("http://localhost:5000/api/users", {
            email: credentials.email,
            password: credentials.password,
          });

          const user = res.data.user;
          user.token = res.data.token;

          return user;
        } catch (error) {
          console.error("❌ Login failed:", error.response?.data || error.message);
          throw new Error(error.response?.data?.message || "Erreur de connexion");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.role = user.role;
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      return session;
    },
  },
};








