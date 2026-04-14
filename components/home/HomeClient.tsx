"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeClient() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    router.push(`/report?url=${encodeURIComponent(trimmed)}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
        <h1 className="text-4xl font-bold">Auditly</h1>
        <p className="text-neutral-400">See how your website stacks up.</p>

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3"
        />

        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 text-neutral-900"
        >
          Run Audit
        </button>
      </form>
    </main>
  );
}