import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `***

### The Prompt

**Role:** Act as an expert Senior Technical Product Manager and Agile Lead with 15 years of experience in software development and estimation.

**Objective:** I will provide you with a Jira Story description (including Title, Description, and Acceptance Criteria if available). Your task is to analyze the story and provide a Story Point estimate based on the **Fibonacci sequence (1, 2, 3, 5, 8, 13, 21).**

**Estimation Framework:**
Please evaluate the story based on the following three dimensions:
1.  **Complexity:** How difficult is the logic? Are there many edge cases or intricate integrations?
2.  **Effort:** How much volume of work is involved, even if it is simple?
3.  **Uncertainty/Risk:** Are there unknown dependencies, new technologies, or vague requirements that might lead to scope creep?

**Reference Scale Guidelines:**
*   **1-2 points:** Trivial change, documentation, or a simple UI fix. Low risk, clear path.
*   **3 points:** Standard task. Clear requirements, moderate effort, no major unknowns.
*   **5 points:** Significant task. Complex logic or multiple files involved. Requires careful testing.
*   **8 points:** Large feature. Significant uncertainty or high complexity. Might need to be broken down into smaller stories.
*   **13+ points:** Epic level. Too many unknowns or massive effort. Recommend splitting the story.

**Instructions for Output:**
Please provide your response in the following format:
1.  **Estimated Story Points:** [Number]
2.  **Complexity Analysis:** (Briefly explain the technical difficulty)
3.  **Effort/Volume:** (Briefly explain the amount of work)
4.  **Risks & Dependencies:** (Highlight any potential "gotchas" or things that need clarification)
5.  **Recommendation:** (If the story is an 8 or higher, suggest how it could be split).

**Here is the Jira Story Description:**
${jiraDescription}
***

### How to use this effectively:

1.  **Provide Acceptance Criteria:** The AI estimates much better if you include the "Acceptance Criteria" (AC). Without AC, the AI might assume the story is simpler than it actually is.
2.  **Contextualize:** If your project uses a specific tech stack (e.g., "This is a React/Node.js project"), add that to the top of the prompt.
3.  **Calibrate:** If the AI gives a '5' for something your team usually calls a '3', you can reply: *"For our team, a standard API integration is a 3. Please adjust your future estimates based on this baseline."*

### Example of what to paste in the bracket:
> **Title:** Implement JWT Authentication for User Login
> **Description:** As a user, I want to log in securely using my email and password so that I can access my dashboard.
> **Acceptable Criteria:** 
> - Validate email format.
> - Hash passwords using bcrypt.
> - Return a signed JWT token on success.
> - Return 401 Error on invalid credentials.
> - Implement token expiration (24h).`,
  });
  console.log(response.text);
}

main();
 

// ***

// ### The Prompt

// **Role:** Act as an expert Senior Technical Product Manager and Agile Lead with 15 years of experience in software development and estimation.

// **Objective:** I will provide you with a Jira Story description (including Title, Description, and Acceptance Criteria if available). Your task is to analyze the story and provide a Story Point estimate based on the **Fibonacci sequence (1, 2, 3, 5, 8, 13, 21).**

// **Estimation Framework:**
// Please evaluate the story based on the following three dimensions:
// 1.  **Complexity:** How difficult is the logic? Are there many edge cases or intricate integrations?
// 2.  **Effort:** How much volume of work is involved, even if it is simple?
// 3.  **Uncertainty/Risk:** Are there unknown dependencies, new technologies, or vague requirements that might lead to scope creep?

// **Reference Scale Guidelines:**
// *   **1-2 points:** Trivial change, documentation, or a simple UI fix. Low risk, clear path.
// *   **3 points:** Standard task. Clear requirements, moderate effort, no major unknowns.
// *   **5 points:** Significant task. Complex logic or multiple files involved. Requires careful testing.
// *   **8 points:** Large feature. Significant uncertainty or high complexity. Might need to be broken down into smaller stories.
// *   **13+ points:** Epic level. Too many unknowns or massive effort. Recommend splitting the story.

// **Instructions for Output:**
// Please provide your response in the following format:
// 1.  **Estimated Story Points:** [Number]
// 2.  **Complexity Analysis:** (Briefly explain the technical difficulty)
// 3.  **Effort/Volume:** (Briefly explain the amount of work)
// 4.  **Risks & Dependencies:** (Highlight any potential "gotchas" or things that need clarification)
// 5.  **Recommendation:** (If the story is an 8 or higher, suggest how it could be split).

// **Here is the Jira Story Description:**
// [PASTE YOUR JIRA STORY DESCRIPTION HERE]

// ***

// ### How to use this effectively:

// 1.  **Provide Acceptance Criteria:** The AI estimates much better if you include the "Acceptance Criteria" (AC). Without AC, the AI might assume the story is simpler than it actually is.
// 2.  **Contextualize:** If your project uses a specific tech stack (e.g., "This is a React/Node.js project"), add that to the top of the prompt.
// 3.  **Calibrate:** If the AI gives a '5' for something your team usually calls a '3', you can reply: *"For our team, a standard API integration is a 3. Please adjust your future estimates based on this baseline."*

// ### Example of what to paste in the bracket:
// > **Title:** Implement JWT Authentication for User Login
// > **Description:** As a user, I want to log in securely using my email and password so that I can access my dashboard.
// > **Acceptable Criteria:** 
// > - Validate email format.
// > - Hash passwords using bcrypt.
// > - Return a signed JWT token on success.
// > - Return 401 Error on invalid credentials.
// > - Implement token expiration (24h).