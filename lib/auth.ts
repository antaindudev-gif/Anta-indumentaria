import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Asignar rol desde la base de datos
        session.user.role = user.role; 
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-asignar admin si es el correo específico
      if (user.email === "antaindu.dev@gmail.com") {
        const { users } = await import("./schema");
        const { eq } = await import("drizzle-orm");
        await db.update(users).set({ role: 'admin' }).where(eq(users.email, user.email));
      }
    }
  }
});
