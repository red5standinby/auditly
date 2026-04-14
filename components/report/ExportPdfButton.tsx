"use client";

import { useState } from "react";

type ExportPdfButtonProps = {
  targetId: string;
  fileName?: string;
};

export default function ExportPdfButton({
  targetId,
  fileName = "report.pdf",
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    try {
      setIsExporting(true);

      const element = document.getElementById(targetId);
      if (!element) {
        console.error(`No element found with id "${targetId}"`);
        return;
      }

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isExporting ? "Exporting..." : "Export PDF"}
    </button>
  );
}