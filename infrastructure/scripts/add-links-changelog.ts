#!/usr/bin/env -S npx tsx
// Rewrites bare Linear issue IDs (e.g. ASW-123) in changelog entry bodies into
// markdown links. Ported from octavo's scripts/add-links.mjs; adapted to this
// workspace (acme-skunkworks). Code fences, inline code, and already-linked IDs
// are masked first so they're left untouched. Frontmatter is never rewritten.
//
// The pure `rewriteBody(body)` is unit-testable; main() walks the directory.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const CHANGELOG_DIR = "changelog";
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

function main(): void {
  let stat;
  try {
    stat = statSync(CHANGELOG_DIR);
  } catch {
    console.error(`changelog directory not found: ${CHANGELOG_DIR}`);
    process.exit(2);
  }

  if (!stat.isDirectory()) {
    console.error(`${CHANGELOG_DIR} is not a directory`);
    process.exit(2);
  }

  const files = readdirSync(CHANGELOG_DIR)
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .map((name) => join(CHANGELOG_DIR, name));

  let touched = 0;
  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const { body, fm } = splitFrontmatter(raw);
    const next = rewriteBody(body);
    if (next !== body) {
      writeFileSync(file, fm + next);
      touched++;
      console.log(`rewrote: ${file}`);
    }
  }

  console.log(`Linear link rewriting complete. ${touched} file(s) updated.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
