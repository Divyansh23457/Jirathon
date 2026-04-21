import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { JiraStory } from "../types";
import { adfToPlainText } from "../utils/adf";

/** Strip protocol, paths, and trailing slashes so we get just the host. */
export function normalizeDomain(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

/**
 * Fetch a Jira story by key. Uses axios via the Vite dev proxy at
 * /jira/<domain> to sidestep browser CORS. Auth is HTTP Basic
 * (email:apiToken, base64).
 */
export async function fetchJiraStory(
  domain: string,
  email: string,
  apiToken: string,
  storyId: string,
): Promise<JiraStory> {
  const host = normalizeDomain(domain);
  if (!host) throw new Error("Jira domain is required.");

  const key = storyId.trim().toUpperCase();
  if (!key) throw new Error("Story ID is required.");

  const credentials = btoa(`${email}:${apiToken}`);

  const config: AxiosRequestConfig = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://${encodeURIComponent(host)}/rest/api/3/issue/${encodeURIComponent(
      key,
    )}?fields=summary,description,issuetype`,
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${credentials}`,
    },
  };

  try {
    const response = await axios.request(config);
    const data = response.data;
    const description = adfToPlainText(data?.fields?.description);

    return {
      key: data.key,
      summary: data?.fields?.summary ?? "(no summary)",
      issueType: data?.fields?.issuetype?.name ?? "Story",
      description,
    };
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status;
      if (status === 401)
        throw new Error("Unauthorized. Check your email and API token.");
      if (status === 404)
        throw new Error(`Story "${key}" not found on ${host}.`);
      if (status === 403)
        throw new Error(
          "Forbidden. Your token lacks permission for this issue.",
        );
      if (status) throw new Error(`Jira API error (${status}).`);
      throw new Error(err.message || "Network error reaching Jira.");
    }
    throw err;
  }
}
