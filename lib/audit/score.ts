type AuditData = {
  title?: string;
  metaDescription?: string;
  h1Count?: number;
  imageCount?: number;
  missingAltCount?: number;
  viewportExists?: boolean;
  wordCount?: number;
};

function gradeFromScore(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B+";
  if (score >= 70) return "B";
  if (score >= 60) return "C+";
  if (score >= 50) return "C";
  return "D";
}

export function scoreAudit(data: AuditData) {
  let seo = 0;
  let accessibility = 0;
  let content = 0;
  let mobile = 0;

  // SEO
  if (data.title) seo += 20;
  if (data.metaDescription) seo += 20;
  if (data.h1Count === 1) seo += 20;
  if ((data.wordCount ?? 0) > 300) seo += 20;
  if ((data.wordCount ?? 0) > 800) seo += 20;

  // Accessibility
  if ((data.imageCount ?? 0) === 0) {
    accessibility = 100;
  } else {
    const altRatio =
      1 - (data.missingAltCount ?? 0) / (data.imageCount ?? 1);
    accessibility = Math.round(altRatio * 100);
  }

  // Content
  if ((data.wordCount ?? 0) > 300) content += 50;
  if ((data.wordCount ?? 0) > 800) content += 50;

  // Mobile
  mobile = data.viewportExists ? 100 : 0;

  const overall = Math.round((seo + accessibility + content + mobile) / 4);

  return {
    seo: { score: seo, grade: gradeFromScore(seo) },
    accessibility: {
      score: accessibility,
      grade: gradeFromScore(accessibility),
    },
    content: { score: content, grade: gradeFromScore(content) },
    mobile: { score: mobile, grade: gradeFromScore(mobile) },
    overall: { score: overall, grade: gradeFromScore(overall) },
  };
}