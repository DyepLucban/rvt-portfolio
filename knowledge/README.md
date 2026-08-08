# knowledge/

Source documents for the chat widget's knowledge base. Each `.md` file here
becomes one row in `knowledge_documents` (keyed on the filename) plus a set of
embedded rows in `knowledge_chunks`.

**These files cover narrative only** — the story, the motivations, the things a
database row can't hold. Skills, experience entries, and project entries stay
in Supabase Postgres and are pulled live on every question. Never copy a
project description into both places; when they disagree, the bot contradicts
the site.

## Workflow

1. Edit the markdown.
2. `npm run ingest` (or `npm run ingest -- faq` for one file).
3. Ask the widget the question you were trying to fix.

Re-running is idempotent: a document's chunks are deleted and rewritten, so
edits never leave stale text behind to be retrieved later.

## How to write them

- **Headings are chunk boundaries.** One heading per role, per project, per
  question. Structure the file the way you'd want a fragment of it retrieved.
- Sections over ~800 characters get split automatically, with ~100 characters
  of overlap. Shorter, well-titled sections retrieve better than long ones.
- `<!-- HTML comments -->` are stripped before chunking — use them for notes to
  yourself and for placeholders you haven't filled in yet. Anything *not* in a
  comment is content the bot may repeat to a visitor verbatim.
- Write facts, not marketing. The model is told never to invent anything, so
  whatever is missing here it will simply decline to answer.

## Converting the PDFs

Convert `cv.pdf` and the LinkedIn profile PDF (*More → Save to PDF*) by hand,
once. Automated extraction exists, but CV and LinkedIn PDFs are *designed*
documents — multi-column layouts, styled headings, icon glyphs — and extractors
reliably interleave columns and flatten headings into body text. Since headings
are what the chunker splits on, a mangled heading structure degrades every
downstream answer.

## The one that actually matters

`faq.md` carries more weight than the other two combined. At this corpus size
the answer-quality ceiling is set by what the documents *say*, not by how
they're fetched — an hour here beats any amount of retrieval tuning.

Read the `chat_logs` table monthly and feed the real questions back into it:

```sql
select question, created_at from chat_logs order by created_at desc limit 50;
```

That loop is the feature.
