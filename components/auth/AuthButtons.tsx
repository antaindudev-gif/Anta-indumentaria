import { signIn, signOut } from "@/lib/auth";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

export function SignInButton() {
  return (
    <Link href="/login" className="hover:text-accent transition-colors font-mono uppercase tracking-widest text-xs font-bold">
      Ingresar
    </Link>
  );
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className="hover:text-red-400 transition-colors flex items-center gap-2">
        <LogOut className="w-4 h-4" />
        <span className="sr-only">Salir</span>
      </button>
    </form>
  );
}

export function UserNav({ session }: { session: any }) {
  if (!session?.user) return <SignInButton />;

  return (
    <div className="flex items-center gap-6">
      {session.user.role === "admin" && (
        <Link href="/admin" className="hover:text-accent text-accent transition-colors font-mono uppercase tracking-widest text-xs font-bold">
          Admin
        </Link>
      )}
      <Link href="/profile" className="hover:text-accent transition-colors flex items-center gap-2">
        <User className="w-4 h-4" />
      </Link>
      <SignOutButton />
    </div>
  );
}
