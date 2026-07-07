import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 mx-auto">
        <span className="text-amber-400 text-lg font-bold">?</span>
      </div>
      <h1 className="text-lg font-bold text-white mb-1">Página no encontrada</h1>
      <p className="text-sm text-slate-400 mb-4">
        La sección solicitada no existe.
      </p>
      <Link
        href="/"
        className="bg-brand hover:bg-brand-hover text-white px-5 py-2 rounded-xl text-xs font-semibold transition-all"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
