"use client";

import { useEffect, useState } from "react";
import { Search, Zap, Shield, Eye, FileText, MousePointer, Globe, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUDIT_STAGES } from "@/lib/mock-data";
import type { AuditProgress } from "@/types/audit";

interface Props {
  progress: AuditProgress;
}

const STAGE_ICONS = [Globe, Search, Zap, Eye, Shield, FileText, MousePointer, CheckCircle];

export default function LoadingState({ progress }: Props) {
  const [dots, setDots] = useState(".");
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  const currentStageIdx = AUDIT_STAGES.findIndex((s) => s.label === progress.stage);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentStageIdx > 0) {
      setCompletedStages((prev) => {
        const next = [...prev];
        for (let i = 0; i < currentStageIdx; i++) {
          if (!next.includes(i)) next.push(i);
        }
        return next;
      });
    }
  }, [currentStageIdx]);

  const percent = progress.percent;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-16">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Search className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-lg tracking-tight">Auditly</span>
      </div>

      <div className="w-full max-w-lg">
        {/* Score ring placeholder */}
        <div className="flex justify-center mb-10">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="#1e2736"
                strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="44"
                fill="none"
                stroke="url(#loadGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - percent / 100)}`}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="loadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{percent}%</span>
            </div>
          </div>
        </div>

        {/* Current stage */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">
            {progress.stage || "Initialising"}{dots}
          </h2>
          {progress.detail && (
            <p className="text-sm text-slate-500">{progress.detail}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-10">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Stage list */}
        <div className="space-y-3">
          {AUDIT_STAGES.map((stage, idx) => {
            const Icon = STAGE_ICONS[idx] ?? CheckCircle;
            const isComplete = completedStages.includes(idx);
            const isCurrent = currentStageIdx === idx;

            return (
              <div
                key={stage.label}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  isComplete && "opacity-50",
                  isCurrent && "glass border-indigo-500/30 bg-indigo-500/5"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isComplete && "bg-emerald-500/20",
                    isCurrent && "bg-indigo-500/20",
                    !isComplete && !isCurrent && "bg-slate-800"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isCurrent ? "text-indigo-400 animate-pulse" : "text-slate-600"
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isComplete && "text-slate-500",
                      isCurrent && "text-white",
                      !isComplete && !isCurrent && "text-slate-600"
                    )}
                  >
                    {stage.label}
                  </p>
                </div>
                {isCurrent && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
