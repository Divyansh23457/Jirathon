/**
 * Vercel Edge function that mirrors the dev-server Jira proxy.
 *
 * The browser calls /jira/<domain>/<rest-of-path>, which vercel.json rewrites
 * to /api/jira/<domain>/<rest-of-path>. We forward the request to
 * https://<domain>/<rest-of-path> so we can sidestep Jira's browser CORS
 * restriction while still letting the user pick the domain at runtime.
 */
export const config = { runtime: "edge" };

const HOP_BY_HOP = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "upgrade",
]);

export default async function handler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    // pathname looks like /api/jira/<host>/<...rest>
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 3 || segments[0] !== "api" || segments[1] !== "jira") {
      console.error("[proxy] Bad path received:", url.pathname);
      return new Response("Bad proxy path.", { status: 400 });
    }

    const host = segments[2];
    const restPath = segments.slice(3).join("/");
    if (!host) {
      console.error("[proxy] Missing host in path:", url.pathname);
      return new Response("Missing Jira domain in path.", { status: 400 });
    }

    const target = `https://${host}/${restPath}${url.search}`;

    console.log("[proxy] ▶ Forwarding request", {
      incomingUrl: url.pathname + url.search,
      target,
      method: req.method,
    });

    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("x-forwarded-host");
    headers.delete("x-forwarded-proto");
    headers.delete("x-forwarded-for");
    headers.delete("x-vercel-deployment-url");
    headers.delete("x-vercel-id");
    headers.delete("cookie");

    const method = req.method.toUpperCase();
    const upstream = await fetch(target, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : req.body,
      redirect: "manual",
    });

    console.log("[proxy] ◀ Upstream response", {
      target,
      status: upstream.status,
      contentType: upstream.headers.get("content-type"),
    });

    const respHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) respHeaders.set(key, value);
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: respHeaders,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[proxy] ✗ Unhandled error:", message, err);
    return new Response(`Jira proxy error: ${message}`, { status: 502 });
  }
}
