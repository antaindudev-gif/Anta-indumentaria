import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users, accounts, sessions, verificationTokens } from "./schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
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
      // Auto-asignar admin si es alguno de los correos autorizados
      const adminEmails = [
        "antaindu.dev@gmail.com",
        "antonia.catalan.34@gmail.com",
        "contacto.antadj@gmail.com",
      ];
      if (user.email && adminEmails.includes(user.email)) {
        const { users } = await import("./schema");
        const { eq } = await import("drizzle-orm");
        await db.update(users).set({ role: 'admin' }).where(eq(users.email, user.email));
      }
    }
  }
});
