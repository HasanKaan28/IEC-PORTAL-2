import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#070a11] text-slate-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-300">
      {/* Background ambient radial gradients */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.18), transparent 45%), radial-gradient(circle at 90% 20%, rgba(6, 182, 212, 0.12), transparent 35%)",
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
