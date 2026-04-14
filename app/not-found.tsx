export const dynamic = "force-dynamic";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>404 — Page not found</h2>
      <Link href="/">Go home</Link>
    </div>
  );
}
