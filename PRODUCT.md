# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two overlapping audiences land on this portfolio:

- **Recruiters / hiring managers** — non-technical or lightly-technical screeners deciding whether to advance Jeffrey to an interview. They skim Me, Skills, and Experience for fit signals (role, location, availability, seniority).
- **Technical peers / engineers / tech leads** — dig deeper into Projects and Experience to assess real technical depth before deciding to advance a candidate. They're the audience most likely to notice implementation quality in the projects shown and in the site itself.

## Product Purpose

A personal portfolio for Jeffrey Lucban that helps him get hired. It presents who he is, what he can do, and what he's built, so that both non-technical screeners and technical evaluators can each get what they need to move him forward in a hiring process. Success is a visitor (recruiter or engineer) coming away convinced he's worth an interview or a follow-up.

## Positioning

Full-stack versatility framed from a backend lean: Jeffrey positions as a backend engineer who is comfortable end-to-end, not backend-only. The portfolio site itself is direct proof of this — solo-built with a React frontend, a Supabase Postgres database, and a Deno Edge Function backend layer he designed (see architecture in CLAUDE.md). The differentiator a visitor should walk away with is "can own a feature from schema to UI," not just "writes backend code."

## Operating Context

- Visited via a shared link (job applications, LinkedIn, resume, direct outreach) — first-touch, not a returning-user product.
- Four routed pages: Me (`/`), Experience (`/experience`), Skills (`/skills`), Projects (`/projects`), sharing a Navbar/Footer layout.
- Content (skills, experience entries, project entries) is stored in Supabase Postgres and fetched at runtime through a single Edge Function — nothing about content is static in this repo. Future content edits happen in the Supabase DB, not in code.
- Availability status ("Open to work") is a live, changeable fact surfaced on the Me page — expect this to flip over time as Jeffrey's job search status changes.

## Capabilities and Constraints

- Almost entirely read-only and public: no auth, no admin UI, no forms beyond mailto/external links (GitHub, LinkedIn, email) — with two deliberate exceptions, both added by the chat feature. Visitors can POST a question to `portfolio/chat`, which is rate-limited per IP (15/hour, 60/day) and logs every exchange to `chat_logs`; and there is one secret-guarded write endpoint, `portfolio/ingest`, reachable only from the `npm run ingest` CLI step.
- No CMS in this codebase — content changes require direct Supabase DB edits, outside this repo's scope.
- A resume PDF is referenced at `/resume.pdf` (`src/lib/constants.js` → `SITE.resumeUrl`) but the file does not yet exist in `public/`. This is a known, deliberate gap — the file is coming later; the link wiring should stay as-is in the meantime.
- No dark/light theme toggle by design (single dark navy/gold palette, per CLAUDE.md).
- An AI surface exists: a grounded chat widget on every route, answering from an ingested knowledge base (`knowledge/*.md`) plus the live database. It is bound by the same no-fabrication rule as the rest of the site (Product Principle 4), speaks about Jeffrey in the third person, and never commits him to availability, rates, or start dates beyond what its context states. Conversations are logged, and the widget says so.

## Brand Commitments

- Name: Jeffrey Lucban. Role: Backend Engineer. Location: Philippines. Contact: lucbanjep@gmail.com.
- GitHub: github.com/DyepLucban · LinkedIn: linkedin.com/in/jeffrey-lucban
- Current tagline: "Turning complex requirements into reliable and scalable products that streamline operations." — consistent with the full-stack-leaning-backend positioning above; not yet explicitly updated to foreground versatility.
- `documentations/CYBER_DRIVE_DESIGN_REFERENCE.md` is an unrelated fan-project design system (a fictional "Cyber Drive" car-culture brand) kept only as loose future inspiration — it has no bearing on this portfolio's identity or current visual system.

## Evidence on Hand

- No real project descriptions, case studies, or experience entries exist in this repo — all of that content lives in the Supabase database and is not visible from the codebase alone. Do not fabricate project names, employers, metrics, or testimonials when working on this site.
- `knowledge/cv.md` and `knowledge/linkedin.md` are structural scaffolds only — the real content has not been converted from the source PDFs yet, and their placeholders sit inside HTML comments so nothing unverified reaches the chatbot. `knowledge/faq.md` is partially filled from facts already published on the site; the rest is commented TODOs only Jeffrey can answer.
- Two project-related images exist in `public/images/` (`prev-portfolio.png`, `project-paw.png`) suggesting at least two real projects, but their descriptions/context are not in-repo.
- No resume file currently present despite being referenced in code (see Capabilities and Constraints).

## Product Principles

1. Serve both audiences at once — don't optimize copy/layout for recruiters at the expense of scannable technical substance for engineers, or vice versa.
2. Every page should reinforce "full-stack versatility, backend lean" — including the engineering of the site itself, which is part of the pitch.
3. Content is data, not code — never hardcode project/experience/skill content into components; the Supabase-backed layered architecture (Component → Hook → Service → Edge Function → Postgres) is load-bearing product truth, not an implementation detail.
4. Never fabricate proof (projects, employers, metrics, testimonials) — absence of visible content in-repo means it lives in Supabase, not that it's free to invent.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established beyond standard web accessibility practice (semantic HTML, focus states, `prefers-reduced-motion` handling already present in the codebase per CLAUDE.md).
