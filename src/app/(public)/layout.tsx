import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-ink-950 text-slate-100 flex flex-col selection:bg-brand-600/30 selection:text-brand-300">
      {/* Background ambient radial gradients */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(209, 52, 156, 0.18), transparent 45%), radial-gradient(circle at 90% 20%, rgba(234, 179, 8, 0.10), transparent 35%)",
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
