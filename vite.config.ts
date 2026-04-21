import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Dynamic Jira proxy.
 * The browser calls /jira/<domain>/<rest-of-path>, e.g.
 *   /jira/triharder1303.atlassian.net/rest/api/3/issue/SCRUM-5
 * We forward the request to https://<domain>/<rest-of-path>. This sidesteps
 * Jira's browser CORS restriction while letting the user pick the domain at
 * runtime.
 */
function jiraProxy(): Plugin {
  return {
    name: "jirathon:jira-proxy",
    configureServer(server) {
      server.middlewares.use("/jira", async (req, res) => {
        try {
          const match = (req.url ?? "").match(/^\/([^/?#]+)([/?#].*)?$/);
          const host = match?.[1];
          const rest = match?.[2] ?? "/";
          if (!host) {
            res.statusCode = 400;
            res.end("Missing Jira domain in path.");
            return;
          }

          const target = `https://${host}${rest}`;
          const headers: Record<string, string> = {};
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === "string" && k.toLowerCase() !== "host") {
              headers[k] = v;
            }
          }

          const upstream = await fetch(target, {
            method: req.method ?? "GET",
            headers,
          });

          res.statusCode = upstream.status;
          upstream.headers.forEach((value, key) => {
            // Hop-by-hop headers shouldn't be forwarded.
            if (
              key === "transfer-encoding" ||
              key === "content-encoding" ||
              key === "content-length" ||
              key === "connection"
            )
              return;
            res.setHeader(key, value);
          });
          const buf = Buffer.from(await upstream.arrayBuffer());
          res.end(buf);
        } catch (err) {
          res.statusCode = 502;
          res.end(
            `Jira proxy error: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), jiraProxy()],
});
