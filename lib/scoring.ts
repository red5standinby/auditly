import type { CategoryName, CategoryScore, Grade, VerdictLevel } from "@/types/audit";

// ─── Category Weights ─────────────────────────────────────────────────────────
// Must sum to 1.0

export const CATEGORY_WEIGHTS: Record<CategoryName, number> = {
  Performance: 0.28,
  SEO: 0.24,
  Accessibility: 0.16,
  Security: 0.16,
  Content: 0.10,
  UX: 0.06,
};

// ─── Grade Thresholds ─────────────────────────────────────────────────────────

const GRADE_THRESHOLDS: Array<{ min: number; grade: Grade }> = [
  { min: 97, grade: "A+" },
  { min: 93, grade: "A" },
  { min: 90, grade: "A-" },
  { min: 87, grade: "B+" },
  { min: 83, grade: "B" },
  { min: 80, grade: "B-" },
  { min: 77, grade: "C+" },
  { min: 73, grade: "C" },
  { min: 70, grade: "C-" },
  { min: 60, grade: "D" },
  { min: 0, grade: "F" },
];

export function scoreToGrade(score: number): Grade {
  for (const threshold of GRADE_THRESHOLDS) {
    if (score >= threshold.min) return threshold.grade;
  }
  return "F";
}

// ─── Weighted Overall Score ───────────────────────────────────────────────────

export function calculateOverallScore(categories: CategoryScore[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const cat of categories) {
    const weight = CATEGORY_WEIGHTS[cat.name] ?? cat.weight;
    weightedSum += cat.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

// ─── Verdict Level ────────────────────────────────────────────────────────────

export function scoreToVerdictLevel(score: number): VerdictLevel {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  if (score >= 45) return "poor";
  return "critical";
}

// ─── Color Helpers ────────────────────────────────────────────────────────────

export function scoreToColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 45) return "text-orange-400";
  return "text-red-400";
}

export function scoreToBg(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 45) return "bg-orange-500";
  return "bg-red-500";
}

export function scoreToRingColor(score: number): string {
  if (score >= 90) return "#10b981"; // emerald-500
  if (score >= 75) return "#22c55e"; // green-500
  if (score >= 60) return "#eab308"; // yellow-500
  if (score >= 45) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}

export function gradeToColor(grade: Grade): string {
  if (grade.startsWith("A")) return "text-emerald-400";
  if (grade.startsWith("B")) return "text-green-400";
  if (grade.startsWith("C")) return "text-yellow-400";
  if (grade === "D") return "text-orange-400";
  return "text-red-400";
}

export function severityToColor(severity: string): string {
  switch (severity) {
    case "critical": return "text-red-400 bg-red-400/10 border-red-400/20";
    case "high": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    case "medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    case "low": return "text-sky-400 bg-sky-400/10 border-sky-400/20";
    default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  }
}

export function effortToLabel(effort: string): string {
  switch (effort) {
    case "low": return "Quick Fix";
    case "medium": return "~1 Day";
    case "high": return "Sprint";
    default: return effort;
  }
}

// ─── Score Ring SVG Path ──────────────────────────────────────────────────────

export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}
