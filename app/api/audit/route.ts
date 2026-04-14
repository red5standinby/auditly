import { NextResponse } from "next/server";

function stripTags(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(input: string) {
  if (!input) return 0;
  return input.split(/\s+/).filter(Boolean).length;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch site (${response.status})` },
        { status: 500 }
      );
    }

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? stripTags(titleMatch[1]) : "";

    const metaDescriptionMatch =
      html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i
      ) ||
      html.match(
        /<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i
      );

    const metaDescription = metaDescriptionMatch
      ? stripTags(metaDescriptionMatch[1])
      : "";

    const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    const h1Texts = h1Matches.map((m) => stripTags(m[1])).filter(Boolean);
    const h1Count = h1Texts.length;

    const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)];
    const imageCount = imgTags.length;

    let missingAltCount = 0;
    for (const match of imgTags) {
      const tag = match[0];
      const hasAlt = /\balt\s*=\s*["'][\s\S]*?["']/i.test(tag);
      if (!hasAlt) missingAltCount += 1;
    }

    const viewportExists = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyText = bodyMatch ? stripTags(bodyMatch[1]) : stripTags(html);
    const wordCount = countWords(bodyText);

    return NextResponse.json({
      url,
      title: title || "No title found",
      metaDescription: metaDescription || "No meta description found",
      h1Count,
      h1Texts,
      imageCount,
      missingAltCount,
      viewportExists,
      wordCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch site" },
      { status: 500 }
    );
  }
}