"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { scoreAudit } from "@/lib/audit/score";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuditData = {
  title?: string;
  metaDescription?: string;
  h1Count?: number;
  wordCount?: number;
  imageCount?: number;
  missingAltCount?: number;
  viewportExists?: boolean;
  error?: string;
};

type ScoreResult = {
  score: number;
  grade: string;
};

type ComparableSite = {
  name: string;
  url: string;
  note: string;
};

type Industry = {
  label: string;
  sites: ComparableSite[];
};

// ─── URL normalisation ────────────────────────────────────────────────────────
// Strips protocol, www., and path so matching only operates on the bare hostname.

function normalizeUrl(raw: string): string {
  return raw
    .trim()               // guard against copy-paste whitespace
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "") // drop path, query string, fragment
    .trim();              // trim again after stripping in case of trailing spaces
}

// ─── Known branded domains ────────────────────────────────────────────────────
// Exact hostname → industry key. Checked FIRST so well-known brands that have
// no keywords in their domain name (apple.com, stripe.com, etc.) still match.

const KNOWN_DOMAINS: Record<string, string> = {
  // Crypto
  "binance.com": "crypto", "coinbase.com": "crypto", "kraken.com": "crypto",
  "gemini.com": "crypto", "opensea.io": "crypto", "uniswap.org": "crypto",
  "metamask.io": "crypto", "ledger.com": "crypto",
  // Finance
  "stripe.com": "finance", "paypal.com": "finance", "venmo.com": "finance",
  "chase.com": "finance", "wellsfargo.com": "finance", "bankofamerica.com": "finance",
  "robinhood.com": "finance", "coinbase.com": "crypto", "fidelity.com": "finance",
  "schwab.com": "finance", "vanguard.com": "finance", "nerdwallet.com": "finance",
  // Tech / SaaS
  "apple.com": "tech", "google.com": "tech", "microsoft.com": "tech",
  "notion.so": "tech", "linear.app": "tech", "vercel.com": "tech",
  "figma.com": "tech", "github.com": "tech", "atlassian.com": "tech",
  "slack.com": "tech", "zoom.us": "tech", "dropbox.com": "tech",
  // E-commerce
  "amazon.com": "ecommerce", "etsy.com": "ecommerce", "ebay.com": "ecommerce",
  "target.com": "ecommerce", "walmart.com": "ecommerce", "bestbuy.com": "ecommerce",
  // Travel
  "expedia.com": "travel", "kayak.com": "travel", "priceline.com": "travel",
  "delta.com": "travel", "marriott.com": "travel", "hilton.com": "travel",
  "hyatt.com": "travel", "united.com": "travel", "southwest.com": "travel",
  // Food
  "doordash.com": "food", "ubereats.com": "food", "grubhub.com": "food",
  "chipotle.com": "food", "starbucks.com": "food", "mcdonalds.com": "food",
  "dominos.com": "food", "papajohns.com": "food",
  // Health
  "cvs.com": "health", "walgreens.com": "health", "teladoc.com": "health",
  "headspace.com": "health", "calm.com": "health", "webmd.com": "health",
  // Fitness
  "peloton.com": "fitness", "nike.com": "fitness", "adidas.com": "fitness",
  "under.com": "fitness", "lululemon.com": "fitness",
  // Real estate
  "zillow.com": "realestate", "realtor.com": "realestate", "redfin.com": "realestate",
  "trulia.com": "realestate",
};

// Maps the keys used in KNOWN_DOMAINS to the index in INDUSTRY_MAP below.
// This is resolved at lookup time by label comparison.
const KNOWN_DOMAIN_LABELS: Record<string, string> = {
  crypto: "Crypto / Web3",
  finance: "Finance / Fintech",
  tech: "Technology / SaaS",
  ecommerce: "E-commerce",
  travel: "Travel",
  food: "Food & Beverage",
  health: "Healthcare",
  fitness: "Fitness / Wellness",
  realestate: "Real Estate",
};

// ─── New gTLD recognition ─────────────────────────────────────────────────────
// Domains like `jones.dental` or `smith.plumbing` carry industry in the TLD.

const TLD_INDUSTRY: Record<string, string> = {
  // Healthcare
  ".dental": "Healthcare", ".dentist": "Healthcare", ".health": "Healthcare",
  ".hospital": "Healthcare", ".pharmacy": "Healthcare",
  // Legal
  ".law": "Legal", ".attorney": "Legal", ".lawyer": "Legal",
  // Home services
  ".plumbing": "Home Services / Trades", ".electrician": "Home Services / Trades",
  ".contractor": "Home Services / Trades", ".construction": "Home Services / Trades",
  ".roofing": "Home Services / Trades",
  // Real estate
  ".realty": "Real Estate", ".realtor": "Real Estate", ".properties": "Real Estate",
  // Fitness
  ".fitness": "Fitness / Wellness", ".yoga": "Fitness / Wellness",
  // Food
  ".restaurant": "Food & Beverage", ".bar": "Food & Beverage",
  ".cafe": "Food & Beverage", ".catering": "Food & Beverage",
  // Travel
  ".hotel": "Travel", ".flights": "Travel", ".holiday": "Travel",
  // Finance
  ".finance": "Finance / Fintech", ".bank": "Finance / Fintech",
  ".insurance": "Finance / Fintech", ".loans": "Finance / Fintech",
  // Tech
  ".app": "Technology / SaaS", ".dev": "Technology / SaaS",
  ".software": "Technology / SaaS", ".io": "Technology / SaaS",
  // E-commerce
  ".shop": "E-commerce", ".store": "E-commerce", ".buy": "E-commerce",
};

// ─── Industry map ─────────────────────────────────────────────────────────────
// Each entry maps a list of hostname keywords → a named industry + 3 reference sites.
// Keywords are matched against the normalised submitted URL (NOT the app URL).

const INDUSTRY_MAP: Array<{ keywords: string[]; industry: Industry }> = [
  {
    keywords: ["crypto", "blockchain", "web3", "defi", "nft", "coin", "token", "btc", "eth", "wallet", "exchange", "dao", "chain", "swap"],
    industry: {
      label: "Crypto / Web3",
      sites: [
        {
          name: "Crypto.com",
          url: "https://crypto.com",
          note: "Leading crypto exchange — benchmark for high-trust brand design in the Web3 space.",
        },
        {
          name: "Coinbase",
          url: "https://coinbase.com",
          note: "Consumer-first exchange known for clean onboarding UX and regulatory compliance messaging.",
        },
        {
          name: "CoinGecko",
          url: "https://coingecko.com",
          note: "Comprehensive token data aggregator — reference for crypto information architecture and SEO.",
        },
      ],
    },
  },
  {
    keywords: ["health", "medical", "clinic", "doctor", "hospital", "pharma", "dental", "care", "therapy", "patient", "medic", "ortho", "chiro", "optom", "vision", "urgent", "surgery", "rehab", "telehealth", "telemedicine", "derm", "cardio", "neuro", "pedia"],
    industry: {
      label: "Healthcare",
      sites: [
        {
          name: "WebMD",
          url: "https://webmd.com",
          note: "High-authority health content — benchmark for medical trust signals and structured information.",
        },
        {
          name: "Zocdoc",
          url: "https://zocdoc.com",
          note: "Appointment-booking platform with strong conversion UX for healthcare providers.",
        },
        {
          name: "Healthgrades",
          url: "https://healthgrades.com",
          note: "Doctor profiles and reviews — strong local SEO and schema markup patterns.",
        },
      ],
    },
  },
  {
    keywords: ["plumb", "hvac", "electric", "contractor", "repair", "handyman", "roofing", "landscap", "pest", "heating", "cooling", "window", "gutter", "fence", "flooring", "tile", "drywall", "concrete", "painting", "locksmith", "garage", "sewer", "drain", "irrigation", "sprinkler"],
    industry: {
      label: "Home Services / Trades",
      sites: [
        {
          name: "Angi",
          url: "https://angi.com",
          note: "Dominant home services marketplace — strong on local SEO and trust signals.",
        },
        {
          name: "HomeAdvisor",
          url: "https://homeadvisor.com",
          note: "Lead-gen platform for contractors with deep local optimisation patterns.",
        },
        {
          name: "Thumbtack",
          url: "https://thumbtack.com",
          note: "Service-professional matching — clear value proposition UX worth benchmarking.",
        },
      ],
    },
  },
  {
    keywords: ["law", "legal", "attorney", "lawyer", "solicitor", "counsel", "litigation", "defence", "defense", "justice", "paralegal", "notary", "divorce", "criminal", "injury", "accident", "lawsuit", "malpractice"],
    industry: {
      label: "Legal",
      sites: [
        {
          name: "Martindale-Hubbell",
          url: "https://martindale.com",
          note: "Long-standing attorney directory — benchmark for legal trust and credential display.",
        },
        {
          name: "Avvo",
          url: "https://avvo.com",
          note: "Lawyer rating and Q&A platform with strong local and practice-area SEO.",
        },
        {
          name: "FindLaw",
          url: "https://findlaw.com",
          note: "Legal information authority — benchmark for structured content and schema markup.",
        },
      ],
    },
  },
  {
    keywords: ["realt", "property", "homes", "mortgage", "estate", "apartment", "rent", "lease", "condo", "townhome", "realty", "broker", "listing", "mls", "foreclosure", "hoa", "landlord", "tenant", "rental"],
    industry: {
      label: "Real Estate",
      sites: [
        {
          name: "Zillow",
          url: "https://zillow.com",
          note: "Top real estate marketplace — benchmark for listing pages, trust, and local SEO.",
        },
        {
          name: "Realtor.com",
          url: "https://realtor.com",
          note: "MLS-connected platform with strong schema and structured property data.",
        },
        {
          name: "Trulia",
          url: "https://trulia.com",
          note: "Neighbourhood-focused search — good UX reference for local real estate content.",
        },
      ],
    },
  },
  {
    keywords: ["shop", "store", "ecommerce", "buy", "cart", "checkout", "merch", "boutique", "market", "goods", "brand", "product", "gear", "supply", "supplies", "parts", "deals", "outlet", "wholesale", "retail"],
    industry: {
      label: "E-commerce",
      sites: [
        {
          name: "Shopify",
          url: "https://shopify.com",
          note: "Leading e-commerce platform — benchmark for storefront performance and conversion UX.",
        },
        {
          name: "BigCommerce",
          url: "https://bigcommerce.com",
          note: "Enterprise e-commerce SaaS with strong structured data and category SEO.",
        },
        {
          name: "WooCommerce",
          url: "https://woocommerce.com",
          note: "WordPress commerce — broad community reference for product page best practices.",
        },
      ],
    },
  },
  {
    keywords: ["saas", "software", "platform", "dashboard", "developer", "devops", "startup", "techno", "digital", "cloud", "hosting", "server", "code", "api", "data", "analytics", "automation", "integration", "enterprise", "solution"],
    industry: {
      label: "Technology / SaaS",
      sites: [
        {
          name: "Linear",
          url: "https://linear.app",
          note: "Design-forward SaaS — strong reference for premium dark-mode product UX.",
        },
        {
          name: "Vercel",
          url: "https://vercel.com",
          note: "Developer platform with excellent technical SEO and Core Web Vitals scores.",
        },
        {
          name: "Notion",
          url: "https://notion.so",
          note: "High-traffic SaaS landing page — benchmark for conversion-focused product pages.",
        },
      ],
    },
  },
  {
    keywords: ["restaurant", "food", "cafe", "pizza", "sushi", "dine", "menu", "kitchen", "bakery", "brew", "burger", "taco", "bbq", "grill", "bistro", "eatery", "deli", "catering", "cuisine", "dining", "gastropub", "winery", "vineyard", "brewery", "coffee", "boba", "dessert", "pastry"],
    industry: {
      label: "Food & Beverage",
      sites: [
        {
          name: "OpenTable",
          url: "https://opentable.com",
          note: "Restaurant reservation leader — benchmark for local SEO and structured data (menus, hours).",
        },
        {
          name: "Yelp",
          url: "https://yelp.com",
          note: "Review authority for F&B — strong on local schema and user-generated content signals.",
        },
        {
          name: "Toast",
          url: "https://toasttab.com",
          note: "Restaurant tech platform with high-converting location pages.",
        },
      ],
    },
  },
  {
    keywords: ["fitness", "gym", "yoga", "sport", "workout", "training", "wellness", "nutrition", "crossfit", "pilates", "martial", "karate", "boxing", "cycling", "running", "triathlon", "athlete", "coach", "personal-train", "bootcamp", "hiit", "weight", "muscle", "physio"],
    industry: {
      label: "Fitness / Wellness",
      sites: [
        {
          name: "Mindbody",
          url: "https://mindbodyonline.com",
          note: "Fitness booking platform — benchmark for class-based business pages and local SEO.",
        },
        {
          name: "ClassPass",
          url: "https://classpass.com",
          note: "Marketplace UX reference for subscription fitness and studio discovery.",
        },
        {
          name: "Trainerize",
          url: "https://trainerize.com",
          note: "Online personal training platform with clean conversion-focused pages.",
        },
      ],
    },
  },
  {
    keywords: ["bank", "finance", "invest", "trading", "forex", "fund", "wealth", "insurance", "fintech", "loan", "credit", "pay", "payment", "transfer", "remit", "accounting", "tax", "audit", "fiscal", "capital", "equity", "portfolio", "hedge", "annuity", "mortgage", "lending", "borrow"],
    industry: {
      label: "Finance / Fintech",
      sites: [
        {
          name: "NerdWallet",
          url: "https://nerdwallet.com",
          note: "Personal finance authority — benchmark for trust, comparison tables, and editorial SEO.",
        },
        {
          name: "Robinhood",
          url: "https://robinhood.com",
          note: "Fintech consumer brand with strong mobile-first and product-led growth UX.",
        },
        {
          name: "Stripe",
          url: "https://stripe.com",
          note: "Developer-focused fintech — benchmark for technical credibility and clean docs UX.",
        },
      ],
    },
  },
  {
    keywords: ["travel", "hotel", "flight", "booking", "trip", "vacation", "tour", "resort", "airline", "cruise", "hostel", "motel", "lodge", "inn", "rental", "villa", "airbnb", "holiday", "destination", "adventure", "safari", "backpack", "passport", "itinerary", "getaway"],
    industry: {
      label: "Travel",
      sites: [
        {
          name: "Booking.com",
          url: "https://booking.com",
          note: "Global OTA — benchmark for property listing pages, trust signals, and multi-language SEO.",
        },
        {
          name: "TripAdvisor",
          url: "https://tripadvisor.com",
          note: "Review authority for travel — strong structured data and local content patterns.",
        },
        {
          name: "Airbnb",
          url: "https://airbnb.com",
          note: "Experience-first marketplace with premium listing page UX.",
        },
      ],
    },
  },
];

// Fallback when no keywords match (or url is empty/invalid)
const FALLBACK_INDUSTRY: Industry = {
  label: "General Business",
  sites: [
    {
      name: "Semrush",
      url: "https://www.semrush.com",
      note: "Industry benchmark for SEO auditing — strong on technical depth and keyword coverage.",
    },
    {
      name: "Ahrefs Webmaster Tools",
      url: "https://ahrefs.com/webmaster-tools",
      note: "Highly regarded for backlink analysis and on-page SEO health diagnostics.",
    },
    {
      name: "Sitechecker",
      url: "https://sitechecker.pro",
      note: "Clean interface for on-page audits, focusing on actionable recommendations.",
    },
  ],
};

// ─── inferIndustryFromUrl ─────────────────────────────────────────────────────
// Receives the SUBMITTED audit URL (from the query string).
// Resolution order (most specific → least specific):
//   1. Exact known-brand lookup  (apple.com → tech)
//   2. New gTLD suffix           (smith.dental → Healthcare)
//   3. Keyword in hostname       (plumbingpros.com → Home Services)
//   4. Fallback → General Business
//
// NEVER reads window.location, router, or any app-level URL.

function inferIndustryFromUrl(rawUrl: string): Industry {
  if (!rawUrl || !rawUrl.trim()) return FALLBACK_INDUSTRY;

  const hostname = normalizeUrl(rawUrl); // e.g. "crypto.com"

  // ── Step 1: exact brand match ──────────────────────────────────────────────
  const brandKey = KNOWN_DOMAINS[hostname];
  if (brandKey) {
    const label = KNOWN_DOMAIN_LABELS[brandKey];
    const match = INDUSTRY_MAP.find((e) => e.industry.label === label);
    if (match) return match.industry;
  }

  // ── Step 2: new gTLD match ─────────────────────────────────────────────────
  // e.g. "jones.dental" ends with ".dental"
  for (const [tld, label] of Object.entries(TLD_INDUSTRY)) {
    if (hostname.endsWith(tld)) {
      const match = INDUSTRY_MAP.find((e) => e.industry.label === label);
      if (match) return match.industry;
    }
  }

  // ── Step 3: keyword match in hostname ──────────────────────────────────────
  for (const { keywords, industry } of INDUSTRY_MAP) {
    if (keywords.some((kw) => hostname.includes(kw))) {
      return industry;
    }
  }

  // ── Step 4: fallback ───────────────────────────────────────────────────────
  return FALLBACK_INDUSTRY;
}

// ─── getComparableSites ───────────────────────────────────────────────────────
// Public entry point used by the component.
// Always pass the submitted audit URL — never window.location or app pathname.

function getComparableSites(auditUrl: string): Industry {
  return inferIndustryFromUrl(auditUrl);
}

// ─── Grade colour mapping ─────────────────────────────────────────────────────

function gradeColor(grade: string): string {
  if (grade === "A" || grade === "A+") return "#22c55e";
  if (grade === "B+" || grade === "B") return "#3b82f6";
  if (grade === "C+" || grade === "C") return "#eab308";
  return "#ef4444";
}

function gradeBg(grade: string): string {
  if (grade === "A" || grade === "A+") return "rgba(34,197,94,0.08)";
  if (grade === "B+" || grade === "B") return "rgba(59,130,246,0.08)";
  if (grade === "C+" || grade === "C") return "rgba(234,179,8,0.08)";
  return "rgba(239,68,68,0.08)";
}

function gradeBorder(grade: string): string {
  if (grade === "A" || grade === "A+") return "rgba(34,197,94,0.25)";
  if (grade === "B+" || grade === "B") return "rgba(59,130,246,0.25)";
  if (grade === "C+" || grade === "C") return "rgba(234,179,8,0.25)";
  return "rgba(239,68,68,0.25)";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoIcon({ label }: { label: string }) {
  return (
    <span
      title={label}
      className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/15 text-[9px] text-neutral-500 cursor-help select-none"
    >
      i
    </span>
  );
}

function LoadingPulse() {
  return (
    <div className="mt-12 flex flex-col items-center gap-4 py-16">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-blue-500" />
      </div>
      <p className="text-sm text-neutral-500 tracking-wide">Analysing your site…</p>
    </div>
  );
}

function OverallGradePanel({ result }: { result: ScoreResult }) {
  const color = gradeColor(result.grade);
  const bg = gradeBg(result.grade);
  const border = gradeBorder(result.grade);

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-3xl p-10 text-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 20%, ${bg} 0%, rgba(10,11,13,0) 70%), #0d0e11`,
        border: `1px solid ${border}`,
        boxShadow: `0 0 60px ${bg}, 0 0 0 1px rgba(255,255,255,0.04)`,
      }}
    >
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${color}14 0%, transparent 60%)`,
        }}
      />

      <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-neutral-500 mb-6">
        Overall Grade
      </p>

      <div
        className="text-[7rem] leading-none font-black tracking-tighter"
        style={{ color, textShadow: `0 0 60px ${color}60` }}
      >
        {result.grade}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <div className="relative h-1.5 w-32 rounded-full bg-white/10 overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{ width: `${result.score}%`, background: color }}
          />
        </div>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {result.score}
          <span className="text-neutral-600 font-normal">/100</span>
        </span>
      </div>

      <p className="mt-6 max-w-[18ch] text-xs leading-relaxed text-neutral-500">
        Combined average of SEO, Accessibility, Content & Mobile signals.
      </p>
    </div>
  );
}

function CategoryCard({
  label,
  result,
  info,
}: {
  label: string;
  result: ScoreResult;
  info: string;
}) {
  const color = gradeColor(result.grade);
  const border = gradeBorder(result.grade);

  return (
    <div
      className="flex flex-col justify-between rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
      style={{ background: "#0d0e11", border: `1px solid ${border}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-neutral-500">
          {label}
        </span>
        <InfoIcon label={info} />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <span
          className="text-5xl font-black tracking-tighter leading-none"
          style={{ color }}
        >
          {result.grade}
        </span>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-neutral-600 tabular-nums">
            {result.score}/100
          </span>
          <div className="relative h-1 w-14 rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ width: `${result.score}%`, background: color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  sub,
  span,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  span?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6${span ? " md:col-span-2" : ""}`}
      style={{
        background: "#0d0e11",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-neutral-500">
        {label}
      </p>
      <div className="mt-3 text-white">{value}</div>
      {sub && <p className="mt-1.5 text-xs text-neutral-600">{sub}</p>}
    </div>
  );
}

function ComparableSiteCard({ name, url, note }: ComparableSite) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: "#0d0e11",
        border: "1px solid rgba(59,130,246,0.15)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
          {name}
        </p>
        <svg
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600 group-hover:text-blue-400 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 13V19a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h5m0 0v5m0-5L10 14"
          />
        </svg>
      </div>
      <p className="text-xs text-blue-500/70 font-mono truncate">{url}</p>
      <p className="text-sm leading-relaxed text-neutral-500">{note}</p>
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportClientFresh({ url: urlProp }: { url?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // FIX: url is always the submitted audit URL from the query string.
  // urlProp comes from the server page.tsx; searchParams is the client fallback.
  // Neither uses window.location, router.pathname, or any app-level URL.
  const url = urlProp ?? searchParams.get("url") ?? "";

  // DEBUG — remove when no longer needed
  console.log("AUDIT URL USED FOR COMPARABLES:", url);

  // FIX: comparable sites are derived from `url` (the submitted site),
  // not from any hardcoded array or app-level location.
  const industry = getComparableSites(url);

  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) {
      router.replace("/");
      return;
    }
    async function runAudit() {
      try {
        setLoading(true);
        const res = await fetch(`/api/audit?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        setData(json);
      } catch {
        setData({ error: "Failed to fetch audit data." });
      } finally {
        setLoading(false);
      }
    }
    runAudit();
  }, [url, router]);

  if (!url) return null;

  const scores = data && !data.error ? scoreAudit(data) : null;

  const categoryCards = [
    {
      label: "SEO",
      result: scores?.seo,
      info: "Title tag, meta description, heading structure, and content depth.",
    },
    {
      label: "Accessibility",
      result: scores?.accessibility,
      info: "Measures basic accessibility signals, especially image alt coverage.",
    },
    {
      label: "Content",
      result: scores?.content,
      info: "Measures whether the page has enough text depth to explain the offer clearly.",
    },
    {
      label: "Mobile",
      result: scores?.mobile,
      info: "Checks for core mobile-friendly setup like a viewport meta tag.",
    },
  ];

  return (
    <main
      className="min-h-screen text-white antialiased"
      style={{ background: "#080910" }}
    >
      {/* ── Top chrome bar ─────────────────────────────────────────────── */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0b0e" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black"
              style={{
                background: "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)",
              }}
            >
              A
            </div>
            <span className="text-sm font-semibold tracking-wide text-white/80">
              Auditly
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:bg-white hover:text-black"
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            New Audit
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-10">

        {/* ── Hero header ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.35em] font-medium text-blue-500/70">
            Audit Report
          </p>
          <h1 className="text-4xl font-black tracking-tight leading-tight md:text-5xl">
            Website Analysis
          </h1>
          <p className="max-w-xl text-sm leading-7 text-neutral-500">
            Performance snapshot based on SEO, accessibility, content quality, and mobile
            readiness signals.
          </p>

          {/* Submitted URL chip */}
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5"
            style={{
              background: "#0d0e11",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
            <span className="text-sm font-mono text-blue-300/80 break-all">
              {url}
            </span>
          </div>
        </div>

        {/* ── Loading state ───────────────────────────────────────────────── */}
        {loading && <LoadingPulse />}

        {/* ── Error state ─────────────────────────────────────────────────── */}
        {!loading && data?.error && (
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <p className="text-sm text-red-400">{data.error}</p>
          </div>
        )}

        {/* ── Score section ───────────────────────────────────────────────── */}
        {scores && (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {/* Overall Grade — dominant left panel */}
            <div className="md:col-span-2">
              <OverallGradePanel result={scores.overall} />
            </div>

            {/* Category cards — 2×2 grid */}
            <div className="md:col-span-3 grid grid-cols-2 gap-4">
              {categoryCards.map((card) =>
                card.result ? (
                  <CategoryCard
                    key={card.label}
                    label={card.label}
                    result={card.result}
                    info={card.info}
                  />
                ) : null
              )}
            </div>
          </section>
        )}

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        {scores && !loading && data && !data.error && (
          <div
            className="h-px w-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        )}

        {/* ── Audit Metrics ───────────────────────────────────────────────── */}
        {!loading && !data?.error && data && (
          <section className="space-y-4">
            <h2
              className="text-[10px] uppercase tracking-[0.3em] font-medium"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Page Diagnostics
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <MetricTile
                label="Page Title"
                span
                value={
                  <p className="text-base font-semibold leading-relaxed">
                    {data.title || (
                      <span className="text-neutral-600 italic">Not found</span>
                    )}
                  </p>
                }
              />

              <MetricTile
                label="Meta Description"
                span
                value={
                  <p className="text-sm leading-6 text-neutral-300">
                    {data.metaDescription || (
                      <span className="text-neutral-600 italic">Not found</span>
                    )}
                  </p>
                }
              />

              <MetricTile
                label="H1 Count"
                value={
                  <p
                    className="text-4xl font-black tabular-nums"
                    style={{
                      color:
                        data.h1Count === 1
                          ? "#22c55e"
                          : data.h1Count === 0
                          ? "#ef4444"
                          : "#eab308",
                    }}
                  >
                    {data.h1Count ?? 0}
                  </p>
                }
                sub="Best practice: exactly 1"
              />

              <MetricTile
                label="Word Count"
                value={
                  <p className="text-4xl font-black tabular-nums text-white">
                    {(data.wordCount ?? 0).toLocaleString()}
                  </p>
                }
                sub="300+ recommended for SEO"
              />

              <MetricTile
                label="Image Count"
                value={
                  <p className="text-4xl font-black tabular-nums text-white">
                    {data.imageCount ?? 0}
                  </p>
                }
              />

              <MetricTile
                label="Images Missing Alt"
                value={
                  <p
                    className="text-4xl font-black tabular-nums"
                    style={{
                      color:
                        (data.missingAltCount ?? 0) === 0 ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {data.missingAltCount ?? 0}
                  </p>
                }
                sub="Zero is the target"
              />

              <MetricTile
                label="Viewport Meta Tag"
                span
                value={
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0"
                      style={{
                        background: data.viewportExists
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(239,68,68,0.15)",
                        color: data.viewportExists ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {data.viewportExists ? "✓" : "✗"}
                    </div>
                    <span
                      className="text-lg font-semibold"
                      style={{
                        color: data.viewportExists ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {data.viewportExists ? "Present" : "Missing"}
                    </span>
                    {!data.viewportExists && (
                      <span className="text-xs text-neutral-600">
                        — Add{" "}
                        <code className="text-neutral-500">
                          &lt;meta name=&quot;viewport&quot; …&gt;
                        </code>{" "}
                        to fix mobile rendering
                      </span>
                    )}
                  </div>
                }
              />
            </div>
          </section>
        )}

        {/* ── Comparable Sites ────────────────────────────────────────────── */}
        {/* FIX: industry is derived from `url` (the submitted audit URL),   */}
        {/* not from window.location, router.pathname, or any hardcoded list. */}
        {!loading && (
          <section className="space-y-5 pt-2">
            <div
              className="h-px w-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Reference Sites
                </h2>
                {/* industry badge — confirms which category was inferred */}
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    color: "#60a5fa",
                  }}
                >
                  {industry.label}
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                Well-established sites in this category — for benchmarking and
                design inspiration only. Not scoring criteria.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {industry.sites.map((site) => (
                <ComparableSiteCard key={site.name} {...site} />
              ))}
            </div>
          </section>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="pb-8 text-center">
          <p className="text-[11px] text-neutral-700 tracking-wide">
            Auditly · Web Quality Intelligence
          </p>
        </div>
      </div>
    </main>
  );
}
