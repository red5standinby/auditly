import { Suspense } from "react";
import ReportClientFresh from "@/components/report/ReportClientFresh";

type ReportPageProps = {
  searchParams?: Promise<{
    url?: string;
  }>;
};

export default async function Page({ searchParams }: ReportPageProps) {
  const params = await searchParams;
  const url = params?.url ?? "";

  return (
    <Suspense>
      <ReportClientFresh url={url} />
    </Suspense>
  );
}
