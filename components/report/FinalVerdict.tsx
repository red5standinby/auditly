"use client";

import { CheckCircle2, XCircle, ArrowRight, Trophy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditReport, VerdictLevel } from "@/types/audit";

interface Props {
  report: AuditReport;
}

const VERDICT_CONFIG: Record<VerdictLevel, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
  glow: string;
}> = {
  excellent: {
    label: "Excellent",
    color: "text-emerald-400",
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/20",
    icon: Trophy,
    glow: "shadow-emerald-500/10",
  },
  good: {
    label: "Good",
    color: "text-green-400",
    bg: "bg-green-500/5",
    border: "border-green-500/20",
    icon: CheckCircle2,
    glow: "shadow-green-500/10",
  },
  fair: {
    label: "Needs Work",
    color: "text-yellow-400",
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/20",
    icon: AlertTriangle,
    glow: "shadow-yellow-500/10",
  },
  poor: {
    label: "Poor",
    color: "text-orange-400",
    bg: "bg-orange-500/5",
    border: "border-orange-500/20",
    icon: AlertTriangle,
    glow: "shadow-orange-500/10",
  },
  critical: {
    label: "Critical",
    color: "text-red-400",
    bg: "bg-red-500/5",
    border: "border-red-500/20",
    icon: XCircle,
    glow: "shadow-red-500/10",
  },
};

export default function FinalVerdict({ report }: Props) {
  const { verdict } = report;
  const config = VERDICT_CONFIG[verdict.level];
  const Icon = config.icon;

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-6">Final Verdict</h2>

      <div className={cn(
        "rounded-2xl border p-6 shadow-xl",
        config.bg, config.border, config.glow
      )}>
        {/* Verdict header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
            "bg-white/5 border", config.border
          )}>
            <Icon className={cn("w-6 h-6", config.color)} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={cn("text-sm font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg", config.color, "bg-current/10")}>
                {config.label}
              </span>
              <span className="text-slate-500 text-sm">·</span>
              <span className="text-slate-400 text-sm">Score {report.overallScore}/100 · {report.grade}</span>
            </div>
            <h3 className="text-xl font-bold text-white leading-snug">{verdict.headline}</h3>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed mb-8">{verdict.summary}</p>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {verdict.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-red-400 mb-3">
              <XCircle className="w-4 h-4" />
              Weaknesses
            </h4>
            <ul className="space-y-2">
              {verdict.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Priority action */}
        <div className={cn(
          "rounded-xl border p-4 flex items-start gap-3",
          "bg-indigo-500/5 border-indigo-500/20"
        )}>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              #1 Priority Action
            </p>
            <p className="text-sm text-slate-200 leading-relaxed">{verdict.priority}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
