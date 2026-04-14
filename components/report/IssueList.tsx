"use client";

import { useState } from "react";
import { AlertCircle, TriangleAlert, Info, ChevronDown, ChevronUp, Lightbulb, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { severityToColor, effortToLabel } from "@/lib/scoring";
import type { Issue, Severity } from "@/types/audit";

interface Props {
  issues: Issue[];
}

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];
const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function IssueCard({ issue }: { issue: Issue }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden transition-all duration-200",
      severityToColor(issue.severity),
      expanded ? "shadow-lg" : ""
    )}>
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-start gap-3 cursor-pointer hover:opacity-90"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Severity dot */}
        <div className={cn(
          "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
          issue.severity === "critical" ? "bg-red-500/20" :
          issue.severity === "high" ? "bg-orange-500/20" :
          issue.severity === "medium" ? "bg-yellow-500/20" :
          "bg-sky-500/20"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            issue.severity === "critical" ? "bg-red-400 animate-pulse" :
            issue.severity === "high" ? "bg-orange-400" :
            issue.severity === "medium" ? "bg-yellow-400" :
            "bg-sky-400"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug">{issue.title}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn(
                "text-xs font-bold uppercase px-2 py-0.5 rounded-full border",
                severityToColor(issue.severity)
              )}>
                {SEVERITY_LABELS[issue.severity]}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {effortToLabel(issue.effort)}
              </span>
            </div>
          </div>
          <p className="text-xs opacity-60 mt-1">{issue.category}</p>
        </div>

        <div className="flex-shrink-0 opacity-50">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-current/10">
          <p className="text-sm opacity-80 leading-relaxed">{issue.description}</p>

          <div className={cn(
            "rounded-lg p-3 space-y-1",
            "bg-black/20"
          )}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">Impact</p>
            <p className="text-sm opacity-80">{issue.impact}</p>
          </div>

          <div className={cn("rounded-lg p-3", "bg-black/20")}>
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb className="w-3.5 h-3.5 opacity-60" />
              <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Fix</p>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">{issue.recommendation}</p>
          </div>

          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Potential score gain</span>
            <span className="font-bold">+{issue.estimatedGain} pts</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IssueList({ issues }: Props) {
  const [filter, setFilter] = useState<Severity | "all">("all");

  const grouped = SEVERITY_ORDER.reduce((acc, sev) => {
    const items = issues.filter((i) => i.severity === sev);
    if (items.length > 0) acc[sev] = items;
    return acc;
  }, {} as Partial<Record<Severity, Issue[]>>);

  const counts = SEVERITY_ORDER.reduce((acc, sev) => {
    acc[sev] = issues.filter((i) => i.severity === sev).length;
    return acc;
  }, {} as Record<Severity, number>);

  const filtered = filter === "all"
    ? issues.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
    : issues.filter((i) => i.severity === filter);

  return (
    <section>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Top Issues</h2>
          <p className="text-sm text-slate-500 mt-1">
            {issues.length} issues found — click any card for details and fix guidance
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
              filter === "all"
                ? "bg-slate-700 text-white"
                : "text-slate-500 hover:text-white"
            )}
          >
            All ({issues.length})
          </button>
          {SEVERITY_ORDER.map((sev) => counts[sev] > 0 && (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
                filter === sev
                  ? severityToColor(sev)
                  : "border-slate-800 text-slate-500 hover:text-white"
              )}
            >
              {SEVERITY_LABELS[sev]} ({counts[sev]})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </section>
  );
}
