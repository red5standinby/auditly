"use client";

import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { scoreToColor, scoreToRingColor } from "@/lib/scoring";
import type { AuditReport } from "@/types/audit";
import ScoreRing from "./ScoreRing";

interface Props {
  report: AuditReport;
}

function StatusIcon({ status }: { status: "pass" | "warn" | "fail" }) {
  if (status === "pass") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === "warn") return <TriangleAlert className="w-4 h-4 text-yellow-400" />;
  return <AlertCircle className="w-4 h-4 text-red-400" />;
}

const TOP_METRICS = [
  { key: "LCP", label: "LCP", desc: "Largest Contentful Paint" },
  { key: "TBT", label: "TBT", desc: "Total Blocking Time" },
  { key: "CLS", label: "CLS", desc: "Cumulative Layout Shift" },
];

export default function MetricCards({ report }: Props) {
  const perfCategory = report.categories.find((c) => c.name === "Performance");

  const cwvMetrics = TOP_METRICS.map((m) => {
    const metric = perfCategory?.metrics.find((pm) => pm.label === m.key);
    return { ...m, metric };
  }).filter((m) => m.metric);

  const failCount = report.categories.reduce(
    (sum, c) => sum + c.issues.filter((i) => i.severity === "critical").length,
    0
  );

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overall Score Card */}
      <div className="glass rounded-2xl p-8 flex flex-col items-center text-center glow-indigo lg:col-span-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">
          Overall Score
        </p>
        <ScoreRing score={report.overallScore} size="lg" showGrade />
        <p className="text-slate-400 text-sm mt-4 max-w-[16ch] leading-relaxed">
          {report.overallScore >= 80
            ? "Above industry average"
            : report.overallScore >= 60
            ? "Room for improvement"
            : "Significant issues found"}
        </p>
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          {report.metadata.techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Category mini-scores */}
        {report.categories.map((cat) => (
          <div key={cat.name} className="glass rounded-xl p-4 glass-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">{cat.name}</span>
              <div className="flex items-center gap-1 text-xs">
                {cat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : cat.trend === "down" ? (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                ) : (
                  <Minus className="w-3 h-3 text-slate-600" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    cat.trend === "up"
                      ? "text-emerald-400"
                      : cat.trend === "down"
                      ? "text-red-400"
                      : "text-slate-600"
                  )}
                >
                  {cat.trendDelta !== 0
                    ? `${cat.trendDelta > 0 ? "+" : ""}${cat.trendDelta}`
                    : "—"}
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className={cn("text-3xl font-extrabold", scoreToColor(cat.score))}>
                {cat.score}
              </span>
              <span
                className={cn(
                  "text-sm font-bold px-2 py-0.5 rounded-md",
                  cat.score >= 80
                    ? "bg-emerald-500/10 text-emerald-400"
                    : cat.score >= 60
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                )}
              >
                {cat.grade}
              </span>
            </div>
            {/* mini progress bar */}
            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${cat.score}%`,
                  backgroundColor: scoreToRingColor(cat.score),
                }}
              />
            </div>
          </div>
        ))}

        {/* Issues count card */}
        <div className="glass rounded-xl p-4 glass-hover sm:col-span-1">
          <span className="text-xs font-semibold text-slate-500 block mb-3">Critical Issues</span>
          <div className="flex items-end gap-2">
            <span className={cn("text-3xl font-extrabold", failCount > 0 ? "text-red-400" : "text-emerald-400")}>
              {failCount}
            </span>
            <span className="text-slate-600 text-sm mb-0.5">found</span>
          </div>
          <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", failCount > 0 ? "bg-red-500" : "bg-emerald-500")}
              style={{ width: `${Math.min(failCount * 20, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
