"use client";

import { useState, FormEvent } from "react";
import { Search, ArrowRight, CheckCircle, Zap, Shield, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSubmit: (url: string) => void;
}

const DEMO_URLS = [
  "stripe.com",
  "linear.app",
  "vercel.com",
  "notion.so",
];

const FEATURES = [
  { icon: Zap, label: "Core Web Vitals", color: "text-yellow-400" },
  { icon: Search, label: "SEO Analysis", color: "text-indigo-400" },
  { icon: Shield, label: "Security Audit", color: "text-emerald-400" },
  { icon: Globe, label: "Accessibility", color: "text-violet-400" },
];

export default function HeroForm({ onSubmit }: Props) {
  const [url, setUrl] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");

  function validate(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter a URL to audit.");
      return false;
    }
    // Basic domain/URL check
    const cleaned = trimmed.replace(/^https?:\/\//, "").replace(/^www\./, "");
    if (!cleaned.includes(".") || cleaned.length < 4) {
      setError("Please enter a valid URL (e.g. yoursite.com).");
      return false;
    }
    setError("");
    return true;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (validate(url)) {
      onSubmit(url.trim());
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Search className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight">Auditly</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <button className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 hover:text-white transition-all">
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8 animate-in">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Now auditing Core Web Vitals 2025
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-in delay-100 max-w-4xl">
          Your website,{" "}
          <span className="gradient-text">brutally honest</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-12 animate-in delay-200 leading-relaxed">
          Instant SEO, performance, accessibility &amp; security audits.
          Get a prioritised action plan in under 30 seconds — no account required.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl animate-in delay-300"
        >
          <div
            className={cn(
              "relative flex items-center glass rounded-2xl transition-all duration-300",
              focused
                ? "ring-2 ring-indigo-500/50 border-indigo-500/40 glow-indigo"
                : "border-slate-700/60"
            )}
          >
            <Globe className="absolute left-5 w-5 h-5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="yourwebsite.com"
              className="flex-1 bg-transparent pl-14 pr-4 py-5 text-lg placeholder-slate-600 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="m-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shadow-lg shadow-indigo-500/20"
            >
              Run Audit
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400 text-left pl-1">{error}</p>
          )}

          {/* Demo URLs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-slate-600">Try:</span>
            {DEMO_URLS.map((demo) => (
              <button
                key={demo}
                type="button"
                onClick={() => {
                  setUrl(demo);
                  setError("");
                }}
                className="text-xs text-slate-500 hover:text-indigo-400 transition-colors px-2 py-1 rounded-md hover:bg-indigo-500/10"
              >
                {demo}
              </button>
            ))}
          </div>
        </form>

        {/* Feature pills */}
        <div
          id="features"
          className="flex flex-wrap justify-center gap-3 mt-14 animate-in delay-400"
        >
          {FEATURES.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-slate-300"
            >
              <Icon className={cn("w-4 h-4", color)} />
              {label}
            </div>
          ))}
        </div>

        {/* Trust line */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-xs text-slate-600 animate-in delay-500">
          {["No account needed", "Free forever tier", "GDPR compliant"].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-700 border-t border-slate-800/50">
        © {new Date().getFullYear()} Auditly. Built for performance-obsessed teams.
      </footer>
    </main>
  );
}
