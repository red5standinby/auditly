// ─── Core Domain Types ────────────────────────────────────────────────────────

export type CategoryName =
  | "SEO"
  | "Performance"
  | "Accessibility"
  | "Security"
  | "Content"
  | "UX";

export type Severity = "critical" | "high" | "medium" | "low";

export type Grade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D"
  | "F";

export type VerdictLevel = "excellent" | "good" | "fair" | "poor" | "critical";

// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface Metric {
  label: string;
  value: string | number;
  unit?: string;
  status: "pass" | "warn" | "fail";
  benchmark?: string;
}

// ─── Issues ───────────────────────────────────────────────────────────────────

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: CategoryName;
  impact: string;
  recommendation: string;
  effort: "low" | "medium" | "high";
  estimatedGain: number; // score points recoverable
}

// ─── Quick Wins ───────────────────────────────────────────────────────────────

export interface QuickWin {
  id: string;
  title: string;
  description: string;
  category: CategoryName;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  estimatedGain: number;
  steps: string[];
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryScore {
  name: CategoryName;
  score: number; // 0–100
  grade: Grade;
  weight: number; // 0–1 (must sum to 1 across all categories)
  trend: "up" | "down" | "stable";
  trendDelta: number;
  summary: string;
  metrics: Metric[];
  issues: Issue[];
  icon: string; // lucide icon name
}

// ─── Competitors ──────────────────────────────────────────────────────────────

export interface CompetitorScore {
  category: CategoryName;
  score: number;
}

export interface Competitor {
  id: string;
  name: string;
  url: string;
  overallScore: number;
  grade: Grade;
  scores: Record<CategoryName, number>;
  isSubject?: boolean; // true = the audited site
}

// ─── Site Metadata ────────────────────────────────────────────────────────────

export interface SiteMetadata {
  title: string;
  description: string;
  domain: string;
  favicon?: string;
  pagesCrawled: number;
  crawlDuration: number; // ms
  lastCrawled: string; // ISO date
  techStack: string[];
  cms?: string;
  hosting?: string;
}

// ─── Verdict ──────────────────────────────────────────────────────────────────

export interface Verdict {
  level: VerdictLevel;
  headline: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  priority: string; // #1 recommended action
}

// ─── Full Report ──────────────────────────────────────────────────────────────

export interface AuditReport {
  id: string;
  url: string;
  domain: string;
  timestamp: string; // ISO date
  overallScore: number;
  grade: Grade;
  categories: CategoryScore[];
  topIssues: Issue[];
  quickWins: QuickWin[];
  competitors: Competitor[];
  verdict: Verdict;
  metadata: SiteMetadata;
}

// ─── Audit Service Abstraction ────────────────────────────────────────────────

export interface AuditOptions {
  url: string;
  depth?: number; // crawl depth
  includeCompetitors?: string[];
  categories?: CategoryName[];
}

export interface AuditProgress {
  stage: string;
  percent: number;
  detail?: string;
}

export type AuditProgressCallback = (progress: AuditProgress) => void;

export interface AuditService {
  runAudit(
    options: AuditOptions,
    onProgress?: AuditProgressCallback
  ): Promise<AuditReport>;
}
