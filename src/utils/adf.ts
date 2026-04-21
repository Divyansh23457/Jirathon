/**
 * Atlassian Document Format (ADF) -> plain text.
 * Jira's v3 API returns descriptions as a structured JSON tree, not a string.
 * We walk the tree and produce something readable for the LLM prompt.
 */
type AdfNode = {
  type?: string;
  text?: string;
  content?: AdfNode[];
  attrs?: Record<string, unknown>;
};

export function adfToPlainText(node: unknown): string {
  if (!node) return "";
  if (typeof node === "string") return node;

  const out: string[] = [];
  walk(node as AdfNode, out, 0);
  return out.join("").trim();
}

function walk(node: AdfNode, out: string[], listDepth: number): void {
  if (!node) return;

  switch (node.type) {
    case "text":
      out.push(node.text ?? "");
      return;
    case "hardBreak":
      out.push("\n");
      return;
    case "paragraph":
      walkChildren(node, out, listDepth);
      out.push("\n\n");
      return;
    case "heading": {
      const level = Number(node.attrs?.level ?? 1);
      out.push(`${"#".repeat(level)} `);
      walkChildren(node, out, listDepth);
      out.push("\n\n");
      return;
    }
    case "bulletList":
    case "orderedList":
      walkList(node, out, listDepth);
      return;
    case "listItem": {
      walkChildren(node, out, listDepth);
      return;
    }
    case "codeBlock":
      out.push("```\n");
      walkChildren(node, out, listDepth);
      out.push("\n```\n\n");
      return;
    case "blockquote":
      out.push("> ");
      walkChildren(node, out, listDepth);
      out.push("\n\n");
      return;
    case "rule":
      out.push("\n---\n\n");
      return;
    default:
      walkChildren(node, out, listDepth);
  }
}

function walkChildren(node: AdfNode, out: string[], listDepth: number): void {
  if (!node.content) return;
  for (const child of node.content) walk(child, out, listDepth);
}

function walkList(node: AdfNode, out: string[], listDepth: number): void {
  const indent = "  ".repeat(listDepth);
  const ordered = node.type === "orderedList";
  let i = 1;
  for (const item of node.content ?? []) {
    out.push(`${indent}${ordered ? `${i}.` : "-"} `);
    const inner: string[] = [];
    walkChildren(item, inner, listDepth + 1);
    out.push(inner.join("").trim());
    out.push("\n");
    i += 1;
  }
  out.push("\n");
}
