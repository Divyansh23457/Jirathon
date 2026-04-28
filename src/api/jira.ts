import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { JiraStory } from "../types";
import { adfToPlainText } from "../utils/adf";

const JIRA_DOMAIN = "triharder1303.atlassian.net";

/**
 * Fetch a Jira story by key using hardcoded domain.
 * Auth is HTTP Basic (email:apiToken, base64).
 */
export async function fetchJiraStory(
  email: string,
  apiToken: string,
  storyId: string,
): Promise<JiraStory> {
  const key = storyId.trim().toUpperCase();
  if (!key) throw new Error("Story ID is required.");

  const credentials = btoa(`${email}:${apiToken}`);

  const url = `/api/jira/rest/api/3/issue/${encodeURIComponent(key)}?fields=summary,description,issuetype`;

  console.log("[Jira] ▶ Request", { url, domain: JIRA_DOMAIN });

  const config: AxiosRequestConfig = {
    method: "get",
    maxBodyLength: Infinity,
    url,
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${credentials}`,
    },
  };

  try {
    const response = await axios.request(config);
    console.log("[Jira] ◀ Response", {
      status: response.status,
      headers: response.headers,
      data: response.data,
    });

    const data = response.data;
    const description = adfToPlainText(data?.fields?.description);

    const story = {
      key: data.key,
      summary: data?.fields?.summary ?? "(no summary)",
      issueType: data?.fields?.issuetype?.name ?? "Story",
      description,
    };
    console.log("[Jira] ✓ Story parsed", story);
    return story;
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error("[Jira] ✗ Axios error", {
        message: err.message,
        status: err.response?.status,
        responseData: err.response?.data,
        responseHeaders: err.response?.headers,
        requestUrl: err.config?.url,
        requestHeaders: {
          ...err.config?.headers,
          Authorization: "[redacted]",
        },
      });
      const status = err.response?.status;
      if (status === 401)
        throw new Error("Unauthorized. Check your email and API token.");
      if (status === 404)
        throw new Error(`Story "${key}" not found.`);
      if (status === 403)
        throw new Error(
          "Forbidden. Your token lacks permission for this issue.",
        );
      if (status) throw new Error(`Jira API error (${status}).`);
      throw new Error(err.message || "Network error reaching Jira.");
    }
    console.error("[Jira] ✗ Unexpected error", err);
    throw err;
  }
}
