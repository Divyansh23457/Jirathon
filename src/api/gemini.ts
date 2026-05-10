import { GoogleGenAI } from "@google/genai";
import type { JiraStory } from "../types";

const MODEL = "gemini-2.5-flash-lite";

function buildPrompt(story: JiraStory): string {
  return `### The Prompt

**Role:** Act as an expert Senior Technical Product Manager and Agile Lead with 15 years of experience in software development and estimation.

**Objective:** I will provide you with a Jira Story description (including Title, Description, and Acceptance Criteria if available). Your task is to analyze the story and provide a Story Point estimate based on the **Fibonacci sequence (1, 2, 3, 5, 8, 13, 21).**

**Estimation Framework:**
Please evaluate the story based on the following three dimensions:
1. **Complexity:** How difficult is the logic? Are there many edge cases or intricate integrations?
2. **Effort:** How much volume of work is involved, even if it is simple?
3. **Uncertainty/Risk:** Are there unknown dependencies, new technologies, or vague requirements that might lead to scope creep?

**Reference Scale Guidelines:**
* **1-2 points:** Trivial change, documentation, or a simple UI fix. Low risk, clear path.
* **3 points:** Standard task. Clear requirements, moderate effort, no major unknowns.
* **5 points:** Significant task. Complex logic or multiple files involved. Requires careful testing.
* **8 points:** Large feature. Significant uncertainty or high complexity. Might need to be broken down into smaller stories.
* **13+ points:** Epic level. Too many unknowns or massive effort. Recommend splitting the story.

**Instructions for Output (use Markdown headings exactly):**
## Estimated Story Points
[Number]

## Complexity Analysis
(Briefly explain the technical difficulty)

## Effort / Volume
(Briefly explain the amount of work)

## Risks & Dependencies
(Highlight any potential "gotchas" or things that need clarification)

## Recommended Roadmap
A short, ordered checklist of concrete steps to deliver this story efficiently.

## Recommendation
(If the story is an 8 or higher, suggest how it could be split.)

---

**Here is the Jira Story:**

**Key:** ${story.key}
**Type:** ${story.issueType}
**Title:** ${story.summary}

**Description:**
${story.description || "(No description provided.)"}`;
}

export async function estimateStory(
  apiKey: string,
  story: JiraStory,
): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "Missing VITE_GEMINI_API_KEY. Add it to .env.local and restart the dev server.",
    );
  }

  console.log("[Gemini] Estimating story", story.key);
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(story),
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Gemini returned an empty response.");
  console.log("[Gemini] Estimation complete for", story.key);
  return text;
}
