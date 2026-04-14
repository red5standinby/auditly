"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ExternalLink, Clock, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { scoreToColor, gradeToColor } from "@/lib/scoring";
import type { AuditReport } from "@/types/audit";
import ExportButton from "./ExportButton";

interface Props {
  report: AuditReport;
}

export default function ReportHeader({ report }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const timeAgo = new Date(report.timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#060b18]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-xl shadow-black/30"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm tracking-tight hidden sm:block">Auditly</span>
        </Link>

        {/* Site info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center flex-shrink-0">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white truncate">{report.domain}</span>
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-400 flex-shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
              <span className="mx-1">·</span>
              <span>{report.metadata.pagesCrawled} pages crawled</span>
            </div>
          </div>
        </div>

        {/* Score badge */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl">
            <span className="text-xs text-slate-500 font-medium hidden sm:block">Score</span>
            <span className={cn("text-lg font-extrabold", scoreToColor(report.overallScore))}>
              {report.overallScore}
            </span>
            <span className={cn("text-sm font-bold", gradeToColor(report.grade))}>
              {report.grade}
            </span>
          </div>

          <ExportButton report={report} compact />

          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1 px-3 py-1.5 glass rounded-xl glass-hover"
          >
            New audit
          </Link>
        </div>
      </div>
    </header>
  );
}
