"use client";

import { cn } from "@/lib/utils";
import { scoreToColor, scoreToRingColor, gradeToColor } from "@/lib/scoring";
import type { Competitor } from "@/types/audit";

interface Props {
  competitors: Competitor[];
}

const CATEGORIES = ["SEO", "Performance", "Accessibility", "Security", "Content", "UX"] as const;

function ScoreCell({ score, isSubject }: { score: number; isSubject?: boolean }) {
  const color = scoreToRingColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span
        className={cn(
          "text-sm font-bold font-mono",
          isSubject ? scoreToColor(score) : "text-slate-300"
        )}
      >
        {score}
      </span>
    </div>
  );
}

export default function CompetitorTable({ competitors }: Props) {
  const subject = competitors.find((c) => c.isSubject);
  const rivals = competitors.filter((c) => !c.isSubject);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Competitor Benchmark</h2>
          <p className="text-sm text-slate-500 mt-1">
            How your site stacks up against {rivals.length} industry competitors
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">
                  Site
                </th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                  Overall
                </th>
                {CATEGORIES.map((cat) => (
                  <th
                    key={cat}
                    className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((comp, idx) => (
                  <tr
                    key={comp.id}
                    className={cn(
                      "border-b border-slate-800/50 last:border-0 transition-colors",
                      comp.isSubject
                        ? "bg-indigo-500/5 hover:bg-indigo-500/10"
                        : "hover:bg-white/[0.02]"
                    )}
                  >
                    {/* Site name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {comp.isSubject && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        )}
                        <div>
                          <p className={cn(
                            "text-sm font-semibold",
                            comp.isSubject ? "text-indigo-300" : "text-slate-300"
                          )}>
                            {comp.name}
                          </p>
                          <p className="text-xs text-slate-600">{comp.url}</p>
                        </div>
                        {comp.isSubject && (
                          <span className="ml-1 text-xs px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Overall */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-lg font-extrabold",
                          comp.isSubject ? scoreToColor(comp.overallScore) : "text-slate-300"
                        )}>
                          {comp.overallScore}
                        </span>
                        <span className={cn(
                          "text-xs font-bold",
                          gradeToColor(comp.grade)
                        )}>
                          {comp.grade}
                        </span>
                      </div>
                    </td>

                    {/* Category scores */}
                    {CATEGORIES.map((cat) => {
                      const score = comp.scores[cat] ?? 0;
                      const subjectScore = subject?.scores[cat] ?? 0;
                      const diff = comp.isSubject ? 0 : score - subjectScore;

                      return (
                        <td key={cat} className="px-4 py-4">
                          <div className="space-y-1">
                            <ScoreCell score={score} isSubject={comp.isSubject} />
                            {!comp.isSubject && (
                              <span className={cn(
                                "text-xs font-medium",
                                diff > 0 ? "text-red-400" : diff < 0 ? "text-emerald-400" : "text-slate-600"
                              )}>
                                {diff > 0 ? `+${diff} ahead` : diff < 0 ? `${diff} behind` : "—"}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-t border-slate-800/50 flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Your site
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-red-400 font-medium">+N ahead</span>
            = competitor scores higher than you
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">−N behind</span>
            = you score higher than competitor
          </span>
        </div>
      </div>
    </section>
  );
}
