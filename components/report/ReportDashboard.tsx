"use client";

import type { AuditReport } from "@/types/audit";
import ReportHeader from "./ReportHeader";
import MetricCards from "./MetricCards";
import CategoryCards from "./CategoryCards";
import CompetitorTable from "./CompetitorTable";
import IssueList from "./IssueList";
import QuickWins from "./QuickWins";
import FinalVerdict from "./FinalVerdict";
import ExportButton from "./ExportButton";
import { Search, ExternalLink, Server, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  report: AuditReport;
}

export default function ReportDashboard({ report }: Props) {
  return (
    <div className="min-h-screen">
      <ReportHeader report={report} />

      <div id="report-content">
        {/* Hero band */}
        <div className="bg-gradient-to-b from-indigo-950/20 to-transparent border-b border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Audit Report
                  </span>
                  <span className="text-slate-700">·</span>
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                  >
                    {report.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {report.domain}
                </h1>

                {/* Metadata pills */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {report.metadata.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2.5 py-1 bg-slate-800/80 text-slate-400 rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                  <span className="text-xs px-2.5 py-1 bg-slate-800/80 text-slate-400 rounded-lg flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    {report.metadata.hosting ?? "Unknown hosting"}
                  </span>
                  <span className="text-xs px-2.5 py-1 bg-slate-800/80 text-slate-400 rounded-lg flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.timestamp).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ExportButton report={report} />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-14">
          {/* Overview metrics */}
          <MetricCards report={report} />

          {/* Category breakdown */}
          <CategoryCards categories={report.categories} />

          {/* Issues */}
          <IssueList issues={report.topIssues} />

          {/* Quick wins */}
          <QuickWins wins={report.quickWins} />

          {/* Competitor benchmark */}
          <CompetitorTable competitors={report.competitors} />

          {/* Verdict */}
          <FinalVerdict report={report} />

          {/* Bottom CTA */}
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Audit another site</h3>
            <p className="text-sm text-slate-500 mb-5">
              Compare competitors or re-audit after making fixes.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
            >
              Start new audit
            </a>
          </div>
        </main>
      </div>

      <footer className="border-t border-slate-800/50 py-6 text-center text-xs text-slate-700">
        © {new Date().getFullYear()} Auditly · Report ID: {report.id}
      </footer>
    </div>
  );
}
