// Cloudflare Pages Function for tracking download counts
// KV namespace binding: DOWNLOAD_COUNTS

interface Env {
  DOWNLOAD_COUNTS: KVNamespace;
}

// GET /api/downloads - Get current counts
// POST /api/downloads - Increment count and redirect to download

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    if (!env.DOWNLOAD_COUNTS) {
      return new Response(JSON.stringify({ macos: 0, windows: 0 }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const macos = await env.DOWNLOAD_COUNTS.get("macos") || "0";
    const windows = await env.DOWNLOAD_COUNTS.get("windows") || "0";

    return new Response(JSON.stringify({
      macos: parseInt(macos, 10),
      windows: parseInt(windows, 10)
    }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch {
    return new Response(JSON.stringify({ macos: 0, windows: 0 }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  try {
    if (!env.DOWNLOAD_COUNTS) {
      return new Response(JSON.stringify({ success: false }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const url = new URL(request.url);
    const platform = url.searchParams.get("platform");

    if (platform !== "macos" && platform !== "windows") {
      return new Response(JSON.stringify({ error: "Invalid platform" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const current = await env.DOWNLOAD_COUNTS.get(platform) || "0";
    const newCount = parseInt(current, 10) + 1;
    await env.DOWNLOAD_COUNTS.put(platform, newCount.toString());

    return new Response(JSON.stringify({ platform, count: newCount, success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch {
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};
