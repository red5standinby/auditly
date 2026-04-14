"use client";

import { useState } from "react";
import {
  Search, Zap, Eye, Shield, FileText, MousePointer,
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle, TriangleAlert,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { scoreToColor, scoreToRingColor, gradeToColor, severityToColor } from "@/lib/scoring";
import type { CategoryScore } from "@/types/audit";
import ScoreRing from "./ScoreRing";

interface Props {
  categories: CategoryScore[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Search,
  Zap,
  Eye,
  Shield,
  FileText,
  MousePointer,
};

function MetricRow({ label, value, unit, status, benchmark }: {
  label: string;
  value: string | number;
  unit?: string;
  status: "pass" | "warn" | "fail";
  benchmark?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white font-mono">
          {value}{unit ? ` ${unit}` : ""}
        </span>
        {benchmark && (
          <span className="text-xs text-slate-600">/ {benchmark}</span>
        )}
        <div className={cn(
          "w-2 h-2 rounded-full flex-shrink-0",
          status === "pass" ? "bg-emerald-400" :
          status === "warn" ? "bg-yellow-400" : "bg-red-400"
        )} />
      </div>
    </div>
  );
}

function CategoryCard({ cat }: { cat: CategoryScore }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[cat.icon] ?? Search;

  return (
    <div className={cn(
      "glass rounded-2xl overflow-hidden transition-all duration-300",
      expanded ? "ring-1 ring-indigo-500/30" : ""
    )}>
      {/* Header */}
      <div
        className="p-5 flex items-start gap-4 cursor-pointer glass-hover"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
          <Icon className={cn("w-5 h-5", scoreToColor(cat.score))} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white">{cat.name}</h3>
            <div className="flex items-center gap-2">
              {/* Trend */}
              <span className={cn(
                "text-xs font-medium flex items-center gap-0.5",
                cat.trend === "up" ? "text-emerald-400" :
                cat.trend === "down" ? "text-red-400" : "text-slate-600"
              )}>
                {cat.trend === "up" ? <TrendingUp className="w-3 h-3" /> :
                 cat.trend === "down" ? <TrendingDown className="w-3 h-3" /> :
                 <Minus className="w-3 h-3" />}
                {cat.trendDelta !== 0 ? `${cat.trendDelta > 0 ? "+" : ""}${cat.trendDelta}` : "—"}
              </span>
              <span className={cn("text-lg font-extrabold", scoreToColor(cat.score))}>
                {cat.score}
              </span>
              <span className={cn("text-sm font-bold px-1.5 py-0.5 rounded-md",
                cat.score >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                cat.score >= 60 ? "bg-yellow-500/10 text-yellow-400" :
                "bg-red-500/10 text-red-400"
              )}>
                {cat.grade}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${cat.score}%`, backgroundColor: scoreToRingColor(cat.score) }}
            />
          </div>

          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{cat.summary}</p>
        </div>

        <div className="flex-shrink-0 mt-1">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-600" />
            : <ChevronDown className="w-4 h-4 text-slate-600" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-800/60 px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
            {/* Metrics */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Metrics
              </h4>
              <div>
                {cat.metrics.map((m) => (
                  <MetricRow key={m.label} {...m} />
                ))}
              </div>
            </div>

            {/* Issues */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Issues ({cat.issues.length})
              </h4>
              {cat.issues.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  No issues found
                </div>
              ) : (
                <div className="space-y-2">
                  {cat.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className={cn(
                        "px-3 py-2.5 rounded-xl border text-sm",
                        severityToColor(issue.severity)
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium leading-snug">{issue.title}</p>
                        <span className={cn(
                          "text-xs font-semibold uppercase px-1.5 py-0.5 rounded flex-shrink-0",
                          severityToColor(issue.severity)
                        )}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-xs opacity-70 mt-1 leading-relaxed">{issue.impact}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoryCards({ categories }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Category Breakdown</h2>
        <span className="text-xs text-slate-600">Click a row to expand metrics & issues</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.name} cat={cat} />
        ))}
      </div>
    </section>
  );
}
