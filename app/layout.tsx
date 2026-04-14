import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auditly — Professional Website Auditing",
  description:
    "Instant SEO, performance, accessibility, and security audits. Get a comprehensive report with actionable fixes in seconds.",
  keywords: ["website audit", "SEO audit", "performance audit", "web accessibility"],
  openGraph: {
    title: "Auditly — Professional Website Auditing",
    description: "Instant comprehensive website audits with actionable recommendations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}