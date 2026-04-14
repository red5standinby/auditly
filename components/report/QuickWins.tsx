"use client";

import { useState } from "react";
import { Rocket, ChevronDown, ChevronUp, CheckCircle, Clock, Zap, Search, Shield, Eye, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuickWin } from "@/types/audit";

interface Props {
  wins: QuickWin[];
}

const EFFORT_CONFIG = {
  low: { label: "Quick Fix", color: "text-emerald-400 bg-emerald-400/10", dot: "bg-emerald-400" },
  medium: { label: "~1 Day", color: "text-yellow-400 bg-yellow-400/10", dot: "bg-yellow-400" },
  high: { label: "Sprint", color: "text-orange-400 bg-orange-400/10", dot: "bg-orange-400" },
};

const IMPACT_CONFIG = {
  low: { label: "Low impact", color: "text-slate-500" },
  medium: { label: "Med impact", color: "text-yellow-500" },
  high: { label: "High impact", color: "text-emerald-400" },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Performance: Zap,
  SEO: Search,
  Security: Shield,
  Accessibility: Eye,
  Content: FileText,
};

function WinCard({ win, index }: { win: QuickWin; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const effort = EFFORT_CONFIG[win.effort];
  const impact = IMPACT_CONFIG[win.impact];
  const Icon = CATEGORY_ICONS[win.category] ?? Rocket;

  return (
    <div className="glass rounded-2xl overflow-hidden hover:ring-1 hover:ring-slate-700/50 transition-all duration-200">
      {/* Header */}
      <div
        className="p-5 flex items-start gap-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Index + Icon */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
            <Icon className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-xs font-bold text-slate-600">#{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white text-sm leading-snug">{win.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", effort.color)}>
                  {effort.label}
                </span>
                <span className={cn("text-xs", impact.color)}>
                  {impact.label}
                </span>
                <span className="text-xs text-indigo-400 font-semibold">
                  +{win.estimatedGain} pts
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 mt-0.5">
              {expanded
                ? <ChevronUp className="w-4 h-4 text-slate-600" />
                : <ChevronDown className="w-4 h-4 text-slate-600" />}
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
            {win.description}
          </p>
        </div>
      </div>

      {/* Steps */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-800/50 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Implementation steps
          </p>
          <ol className="space-y-2.5">
            {win.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-indigo-400">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between">
            <span className="text-xs text-slate-600">Category: {win.category}</span>
            <span className="text-xs font-semibold text-indigo-400">Estimated gain: +{win.estimatedGain} score points</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuickWins({ wins }: Props) {
  const totalGain = wins.reduce((sum, w) => sum + w.estimatedGain, 0);

  return (
    <section>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Quick Wins</h2>
          </div>
          <p className="text-sm text-slate-500">
            {wins.length} high-ROI actions · Implement all for up to{" "}
            <span className="text-indigo-400 font-semibold">+{totalGain} score points</span>
          </p>
        </div>

        <div className="glass rounded-xl px-4 py-2.5 text-center">
          <div className="text-xs text-slate-500 mb-0.5">Total potential gain</div>
          <div className="text-2xl font-extrabold text-indigo-400">+{totalGain}</div>
          <div className="text-xs text-slate-600">score points</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {wins.map((win, idx) => (
          <WinCard key={win.id} win={win} index={idx} />
        ))}
      </div>
    </section>
  );
}
