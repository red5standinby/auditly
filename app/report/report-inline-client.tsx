return (
  <main className="min-h-screen bg-blue-600 text-white p-10">
    <div className="bg-yellow-400 p-6 text-4xl font-bold text-black">
      INLINE REPORT IS LIVE
    </div>

    <h1 className="mt-8 text-5xl font-bold">
      BLUE SCREEN TEST
    </h1>

    <p className="mt-6 text-2xl">
      {url ? `URL FOUND: ${url}` : "NO URL FOUND"}
    </p>

    <button
      type="button"
      onClick={() => router.push("/")}
      className="mt-8 rounded-xl bg-black px-6 py-3 text-white"
    >
      New Audit
    </button>
  </main>
);