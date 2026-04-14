import type { AuditReport, CategoryScore, Issue, QuickWin, Competitor, Verdict, SiteMetadata } from "@/types/audit";

export type AuditCategory = {
  title: string;
  score: number;
  grade: string;
  summary: string;
};

export type AuditSummary = {
  overallScore: number;
  overallGrade: string;
  strongestArea: string;
  weakestArea: string;
  categories: AuditCategory[];
};

export const AUDIT_STAGES = [
  { label: "Scanning site",          duration: 1200, detail: "Crawling pages and assets…" },
  { label: "Checking SEO",           duration: 1000, detail: "Analysing metadata and structure…" },
  { label: "Reviewing accessibility", duration: 900,  detail: "Testing contrast and semantics…" },
  { label: "Inspecting trust signals", duration: 800,  detail: "Checking HTTPS, headers, and policies…" },
  { label: "Generating report",      duration: 600,  detail: "Compiling findings…" },
];

export function getMockAuditSummary(url: string): AuditSummary {
  return {
    overallScore: 84,
    overallGrade: "B+",
    strongestArea: "Security & Trust",
    weakestArea: "Performance",
    categories: [
      {
        title: "SEO",
        score: 82,
        grade: "B+",
        summary: "Strong baseline metadata with room to improve keyword targeting and internal structure.",
      },
      {
        title: "Performance",
        score: 76,
        grade: "B",
        summary: "Page speed is decent, but image compression and script weight likely need improvement.",
      },
      {
        title: "Accessibility",
        score: 88,
        grade: "B+",
        summary: "Good structure overall, though some alt text and semantic enhancements are still recommended.",
      },
      {
        title: "Security & Trust",
        score: 91,
        grade: "A-",
        summary: "The site presents strong trust signals and a solid secure browsing foundation.",
      },
    ],
  };
}

export function generateMockReport(url: string): AuditReport {
  const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  const issues: Issue[] = [
    {
      id: "perf-1",
      title: "Large unoptimised images",
      description: "Several images are served without compression or modern formats.",
      severity: "high",
      category: "Performance",
      impact: "Slows initial page load by ~2s on mobile.",
      recommendation: "Convert images to WebP and enable lazy loading.",
      effort: "low",
      estimatedGain: 8,
    },
    {
      id: "seo-1",
      title: "Missing meta descriptions",
      description: "Some pages lack meta description tags.",
      severity: "medium",
      category: "SEO",
      impact: "Reduces click-through rate from search results.",
      recommendation: "Add unique, descriptive meta descriptions to all key pages.",
      effort: "low",
      estimatedGain: 5,
    },
    {
      id: "a11y-1",
      title: "Images missing alt text",
      description: "Decorative and informational images lack alt attributes.",
      severity: "medium",
      category: "Accessibility",
      impact: "Screen readers cannot describe images to users.",
      recommendation: "Add descriptive alt text to all meaningful images.",
      effort: "low",
      estimatedGain: 4,
    },
  ];

  const quickWins: QuickWin[] = [
    {
      id: "qw-1",
      title: "Enable gzip / Brotli compression",
      description: "Compress text assets to reduce transfer size.",
      category: "Performance",
      effort: "low",
      impact: "high",
      estimatedGain: 6,
      steps: [
        "Enable Brotli or gzip compression on the web server.",
        "Verify with a response header check (Content-Encoding: br).",
      ],
    },
    {
      id: "qw-2",
      title: "Add canonical tags",
      description: "Prevent duplicate content issues with canonical link elements.",
      category: "SEO",
      effort: "low",
      impact: "medium",
      estimatedGain: 3,
      steps: [
        'Add <link rel="canonical" href="…"> to every page.',
        "Confirm in Google Search Console.",
      ],
    },
  ];

  const categories: CategoryScore[] = [
    {
      name: "SEO",
      score: 82,
      grade: "B+",
      weight: 0.2,
      trend: "up",
      trendDelta: 3,
      summary: "Strong baseline metadata with room to improve keyword targeting.",
      metrics: [],
      issues: issues.filter((i) => i.category === "SEO"),
      icon: "search",
    },
    {
      name: "Performance",
      score: 76,
      grade: "B",
      weight: 0.2,
      trend: "stable",
      trendDelta: 0,
      summary: "Page speed is decent but image optimisation would help significantly.",
      metrics: [],
      issues: issues.filter((i) => i.category === "Performance"),
      icon: "zap",
    },
    {
      name: "Accessibility",
      score: 88,
      grade: "B+",
      weight: 0.15,
      trend: "up",
      trendDelta: 2,
      summary: "Good structure overall with minor alt-text and semantic gaps.",
      metrics: [],
      issues: issues.filter((i) => i.category === "Accessibility"),
      icon: "eye",
    },
    {
      name: "Security",
      score: 91,
      grade: "A-",
      weight: 0.2,
      trend: "stable",
      trendDelta: 0,
      summary: "Strong trust signals and a solid HTTPS foundation.",
      metrics: [],
      issues: [],
      icon: "shield",
    },
    {
      name: "Content",
      score: 80,
      grade: "B",
      weight: 0.15,
      trend: "stable",
      trendDelta: 0,
      summary: "Content is clear but readability and freshness could be improved.",
      metrics: [],
      issues: [],
      icon: "file-text",
    },
    {
      name: "UX",
      score: 83,
      grade: "B+",
      weight: 0.1,
      trend: "up",
      trendDelta: 1,
      summary: "Navigation is intuitive; mobile experience needs polish.",
      metrics: [],
      issues: [],
      icon: "mouse-pointer",
    },
  ];

  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + c.score * c.weight, 0)
  );

  const competitors: Competitor[] = [
    {
      id: "subject",
      name: domain,
      url,
      overallScore,
      grade: "B+",
      scores: { SEO: 82, Performance: 76, Accessibility: 88, Security: 91, Content: 80, UX: 83 },
      isSubject: true,
    },
    {
      id: "comp-1",
      name: "competitor-a.com",
      url: "https://competitor-a.com",
      overallScore: 79,
      grade: "B",
      scores: { SEO: 78, Performance: 72, Accessibility: 80, Security: 85, Content: 77, UX: 80 },
    },
    {
      id: "comp-2",
      name: "competitor-b.com",
      url: "https://competitor-b.com",
      overallScore: 86,
      grade: "B+",
      scores: { SEO: 88, Performance: 84, Accessibility: 85, Security: 90, Content: 82, UX: 86 },
    },
  ];

  const verdict: Verdict = {
    level: "good",
    headline: "Solid foundation with clear quick wins",
    summary: `${domain} performs well across most categories. Addressing image optimisation and missing metadata will push the score into the A range.`,
    strengths: ["Strong HTTPS and security headers", "Good accessibility structure", "Clean semantic HTML"],
    weaknesses: ["Unoptimised images hurting load time", "Incomplete meta descriptions on inner pages"],
    priority: "Optimise and compress all images to improve Performance score.",
  };

  const metadata: SiteMetadata = {
    title: domain,
    description: `Audit report for ${domain}`,
    domain,
    pagesCrawled: 12,
    crawlDuration: 4500,
    lastCrawled: new Date().toISOString(),
    techStack: ["HTML", "CSS", "JavaScript"],
  };

  return {
    id: `mock-${Date.now()}`,
    url,
    domain,
    timestamp: new Date().toISOString(),
    overallScore,
    grade: "B+",
    categories,
    topIssues: issues,
    quickWins,
    competitors,
    verdict,
    metadata,
  };
}
