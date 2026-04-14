"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUGGESTIONS = [
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
    label: "Audit a local business",
    hint: "Find quick wins for nearby competitors",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    label: "Benchmark a competitor",
    hint: "Spot the gaps they haven't fixed yet",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    label: "Check SEO basics",
    hint: "Title, meta description, headings & more",
  },
  {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "Spot accessibility issues",
    hint: "Alt text, viewport, contrast & more",
  },
];

export default function HomeClient() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    router.push(`/report?url=${encodeURIComponent(trimmed)}`);
  }

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 text-white"
      style={{ background: "#080910" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(59,130,246,0.10) 0%, transparent 65%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Logo */}
      <div className="mb-14 flex items-center gap-3 relative z-10">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          }}
        >
          A
        </div>
        <span className="text-sm font-semibold tracking-wide text-white/60">
          Auditly
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl space-y-10">

        {/* Headline */}
        <div className="space-y-4 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em]"
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "#60a5fa",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "#3b82f6" }}
            />
            Free Web Audit
          </div>

          <h1
            className="text-5xl tracking-tight text-white md:text-6xl"
            style={{ fontWeight: 300, lineHeight: 1.1 }}
          >
            Know your site&apos;s{" "}
            <span
              style={{
                fontWeight: 600,
                background: "linear-gradient(90deg, #60a5fa 0%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              true score
            </span>
          </h1>

          <p className="mx-auto max-w-md text-base leading-relaxed text-neutral-500">
            Instant audit across SEO, accessibility, content quality, and mobile
            readiness — no signup needed.
          </p>
        </div>

        {/* URL input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div
            className="flex items-center gap-3 rounded-2xl pl-5 pr-1.5 py-1.5 transition-all duration-200"
            style={{
              background: "#0d0e11",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow:
                "0 0 0 1px rgba(59,130,246,0.04), 0 8px 40px rgba(0,0,0,0.5)",
            }}
          >
            {/* Globe icon */}
            <svg
              className="h-4 w-4 shrink-0 text-neutral-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
              />
            </svg>

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-neutral-600"
            />

            <button
              type="submit"
              className="shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              }}
            >
              Run Audit
            </button>
          </div>

          <p className="pl-1 text-[11px] text-neutral-700">
            Works with any public URL · No login required
          </p>
        </form>

        {/* Suggestions grid */}
        <div className="space-y-3">
          <p className="pl-1 text-[10px] uppercase tracking-[0.3em] font-medium text-neutral-600">
            What you can audit
          </p>
          <div className="grid grid-cols-2 gap-3">
            {SUGGESTIONS.map((s) => (
              <div
                key={s.label}
                className="flex items-start gap-3.5 rounded-2xl p-4 transition-all duration-200 hover:scale-[1.015]"
                style={{
                  background: "#0d0e11",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-500"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/75">{s.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
                    {s.hint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <p className="text-[11px] text-neutral-700 tracking-wide">
          Auditly · Web Quality Intelligence
        </p>
      </div>
    </main>
  );
}
