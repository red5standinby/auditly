import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Turbopack equivalent of the webpack React alias below.
  // Needed because C:\Users\Jaime\package-lock.json causes Next.js to treat
  // C:\Users\Jaime\ as the workspace root, creating two React instances.
  turbopack: {
    resolveAlias: {
      react: "./node_modules/react",
      "react-dom": "./node_modules/react-dom",
    },
  },

  webpack(config, { isServer, dir }) {
    /**
     * Why this is needed
     * ──────────────────
     * Next.js detects C:\Users\Jaime\package-lock.json and treats
     * C:\Users\Jaime\ as the workspace root. Webpack can then satisfy
     * `import React from 'react'` from two separate paths:
     *
     *   C:\Users\Jaime\node_modules\react          ← parent dir instance
     *   C:\Users\Jaime\Dev\Web Auditor\node_modules\react  ← project instance
     *
     * React Context is identity-based. LayoutRouterContext is created
     * (and its Provider mounted) under one React instance while
     * OuterLayoutRouter runs under the other. useContext() returns null,
     * and Next.js throws "invariant expected layout router to be mounted".
     *
     * Pinning react + react-dom to the project's own node_modules
     * guarantees a single instance. We apply this ONLY to client bundles;
     * the server build uses Node.js resolution directly and must not be
     * interfered with (applying the alias server-side breaks SSR prerender).
     */
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: path.join(dir, "node_modules", "react"),
        "react-dom": path.join(dir, "node_modules", "react-dom"),
      };
    }
    return config;
  },
};

export default nextConfig;
