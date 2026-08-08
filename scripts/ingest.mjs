#!/usr/bin/env node
// Pushes knowledge/*.md into the knowledge base. Deliberately a CLI step, not
// an admin UI: these documents change a few times a year, and a manual,
// versioned, reviewable run is the right shape for that.
//
//   npm run ingest              # all files in knowledge/
//   npm run ingest -- faq       # just knowledge/faq.md
//
// Requires in .env (all unprefixed — local tooling only, never bundled):
//   VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, INGEST_SECRET

import { readFile, readdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KNOWLEDGE_DIR = join(ROOT, "knowledge");

// Minimal .env reader — one dependency-free pass, no dotenv needed.
async function loadEnv() {
  try {
    const raw = await readFile(join(ROOT, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const match = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/.exec(line);
      if (!match || line.trim().startsWith("#")) continue;
      const value = (match[2] ?? "").trim().replace(/^["']|["']$/g, "");
      if (!(match[1] in process.env)) process.env[match[1]] = value;
    }
  } catch {
    // No .env — fall through to the missing-variable check below.
  }
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`✗ Missing ${name}. Add it to .env (see README).`);
    process.exit(1);
  }
  return value;
}

// The first H1 is the document title; strip it from the body so it doesn't
// also become a heading level inside the chunk breadcrumbs.
function parseDocument(raw, source) {
  const match = /^#\s+(.+)$/m.exec(raw);
  return {
    title: match ? match[1].trim() : source,
    content: match ? raw.replace(match[0], "").trim() : raw.trim(),
  };
}

async function main() {
  await loadEnv();

  const url = required("VITE_SUPABASE_URL").replace(/\/$/, "");
  const anonKey = required("VITE_SUPABASE_PUBLISHABLE_KEY");
  const secret = required("INGEST_SECRET");

  const only = process.argv.slice(2);
  const files = (await readdir(KNOWLEDGE_DIR))
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .filter((name) => !only.length || only.includes(basename(name, ".md")));

  if (!files.length) {
    console.error(`✗ No matching markdown files in knowledge/.`);
    process.exit(1);
  }

  let failed = 0;
  for (const file of files) {
    const source = basename(file, ".md");
    const raw = await readFile(join(KNOWLEDGE_DIR, file), "utf8");
    const { title, content } = parseDocument(raw, source);

    // A file that is nothing but HTML-comment placeholders would ingest as
    // zero chunks — worth saying out loud rather than reporting success.
    const substantive = content.replace(/<!--[\s\S]*?-->/g, "").trim();
    if (!substantive) {
      console.warn(`⚠ ${file} — still empty (only comments). Skipped.`);
      continue;
    }

    // Embeddings run in-process in the Edge Function and are metered against a
    // per-request CPU limit, so ingest processes a document in batches: re-POST
    // with a rising offset until the server reports `done`. Each call embeds
    // only a handful of chunks, keeping every request well under the limit.
    let offset = 0;
    let inserted = 0;
    let ok = true;
    for (;;) {
      const response = await fetch(`${url}/functions/v1/portfolio/ingest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
          "Content-Type": "application/json",
          "x-ingest-secret": secret,
        },
        body: JSON.stringify({ source, title, content, offset }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error(`✗ ${file} — ${response.status} ${result.error ?? ""}`);
        failed++;
        ok = false;
        break;
      }

      inserted += result.inserted ?? 0;
      offset = result.next ?? offset;
      if (result.done) break;
    }

    if (ok) {
      console.log(`✓ ${file} — ${inserted} chunks from ${content.length} chars (${title})`);
    }
  }

  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
