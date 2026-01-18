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
    // Check if KV binding exists
    if (!env.DOWNLOAD_COUNTS) {
      return new Response(JSON.stringify({
        macos: 0,
        windows: 0,
        _debug: "KV binding not configured"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const macos = await env.DOWNLOAD_COUNTS.get("macos") || "0";
    const windows = await env.DOWNLOAD_COUNTS.get("windows") || "0";

    return new Response(JSON.stringify({
      macos: parseInt(macos, 10),
      windows: parseInt(windows, 10)
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ macos: 0, windows: 0, _debug: errorMessage }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  try {
    // Check if KV binding exists
    if (!env.DOWNLOAD_COUNTS) {
      return new Response(JSON.stringify({
        error: "KV binding not configured",
        hint: "Add DOWNLOAD_COUNTS KV namespace binding in Cloudflare Pages settings"
      }), {
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

    // Get current count and increment
    const current = await env.DOWNLOAD_COUNTS.get(platform) || "0";
    const newCount = parseInt(current, 10) + 1;
    await env.DOWNLOAD_COUNTS.put(platform, newCount.toString());

    return new Response(JSON.stringify({
      platform,
      count: newCount,
      success: true
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: "Failed to update count", details: errorMessage }), {
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
