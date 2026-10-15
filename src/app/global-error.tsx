"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-4xl font-bold font-mono text-rose-400">Kritik Sistem Hatası</h1>
          <p className="text-sm text-slate-400">
            Kök katmanda beklenmeyen bir sorun meydana geldi. Lütfen sayfayı yenilemeyi deneyin.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
          >
            Sistemi Yeniden Başlat
          </button>
        </div>
      </body>
    </html>
  );
}
