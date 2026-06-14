import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LoginButton from "@/components/LoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  const isUnauthorized = searchParams.error === "AccessDenied";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 p-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] backdrop-blur-sm max-w-sm w-full mx-4">
        <div className="text-center">
          <img
            src="/images/logo-face-white.png"
            alt="FACE - UNT"
            className="h-10 w-auto object-contain mb-2"
          />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            FACE UNT
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Sistema de Gestión de RRHH
          </p>
        </div>

        {isUnauthorized && (
          <div className="w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
            Tu cuenta no tiene acceso autorizado.
            <br />
            Contactá al administrador del sistema.
          </div>
        )}

        <LoginButton />
      </div>
    </div>
  );
}
