"use client";

import { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditReport } from "@/types/audit";

interface Props {
  report: AuditReport;
  compact?: boolean;
}

export default function ExportButton({ report, compact = false }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      // Dynamically import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      const element = document.getElementById("report-content");
      if (!element) {
        console.error("Report content element not found");
        setLoading(false);
        return;
      }

      // Temporarily make element visible for capture
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#060b18",
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Additional pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `auditly-${report.domain}-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleExport}
        disabled={loading}
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 glass rounded-xl glass-hover transition-all",
          loading ? "opacity-50 cursor-not-allowed" : ""
        )}
        title="Export PDF"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span className="hidden sm:block">Export PDF</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
        "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500",
        "text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]",
        loading ? "opacity-70 cursor-not-allowed" : ""
      )}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Export Full Report
          <Download className="w-3.5 h-3.5 opacity-70" />
        </>
      )}
    </button>
  );
}
