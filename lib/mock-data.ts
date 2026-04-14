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