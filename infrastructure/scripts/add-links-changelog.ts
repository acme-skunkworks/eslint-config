// Pure helper: rewrite bare Linear issue IDs (e.g. ASW-123) in changelog entry
// bodies into markdown links, masking code fences / inline code / already-linked
// IDs first so they're left untouched. Ported from octavo's add-links.mjs,
// adapted to this workspace (acme-skunkworks).
//
// Library module (no CLI): the release-time orchestrator finalise-changelog.ts
// applies it. Kept pure so it's trivially unit-testable.

const WORKSPACE = "acme-skunkworks";
const TEAM_KEYS = ["ASW", "AKW"];
const ISSUE_RE = new RegExp(`\\b(?:${TEAM_KEYS.join("|")})-\\d+\\b`, "g");
const FENCE_RE = /```[\s\S]*?```/g;
const INLINE_CODE_RE = /`[^`]*`/g;
const ALREADY_LINKED_RE = /\[[^\]]*\]\([^)]*\)/g;

function buildUrl(id: string): string {
  return `https://linear.app/${WORKSPACE}/issue/${id}`;
}

/**
 * Rewrite bare Linear IDs in a markdown body to links, masking code/links.
 */
export function rewriteBody(body: string): string {
  const masks: string[] = [];
  function mask(label: string) {
    return (matched: string): string => {
      masks.push(matched);
      return `${label}${masks.length - 1}`;
    };
  }

  let masked = body
    .replaceAll(FENCE_RE, mask("FENCE"))
    .replaceAll(INLINE_CODE_RE, mask("INLINE"))
    .replaceAll(ALREADY_LINKED_RE, mask("LINK"));

  masked = masked.replaceAll(ISSUE_RE, (id) => `[${id}](${buildUrl(id)})`);

  return masked
    .replaceAll(/FENCE(\d+)/g, (_, index) => masks[Number(index)])
    .replaceAll(/INLINE(\d+)/g, (_, index) => masks[Number(index)])
    .replaceAll(/LINK(\d+)/g, (_, index) => masks[Number(index)]);
}

/**
 * Split leading YAML frontmatter from the body, preserving the fence bytes.
 */
export function splitFrontmatter(raw: string): { body: string; fm: string } {
  if (!raw.startsWith("---\n")) {
    return { body: raw, fm: "" };
  }

  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    return { body: raw, fm: "" };
  }

  return { body: raw.slice(end + 5), fm: raw.slice(0, end + 5) };
}
