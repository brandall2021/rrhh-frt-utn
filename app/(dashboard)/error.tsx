"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-4 mx-auto">
        <span className="text-rose-400 text-lg font-bold">!</span>
      </div>
      <h1 className="text-lg font-bold text-white mb-1">Error interno</h1>
      <p className="text-sm text-slate-400 mb-4 max-w-md">
        {error.message || "Ocurrió un error inesperado."}
      </p>
      <button
        onClick={reset}
        className="bg-brand hover:bg-brand-hover text-white px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
      >
        Reintentar
      </button>
    </div>
  );
}
