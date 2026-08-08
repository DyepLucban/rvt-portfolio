# Frequently Asked Questions

<!--
  The highest-leverage file in knowledge/. Answered sections are grounded in the CV, the
  LinkedIn profile, or facts already published on the site. Sections still wrapped in HTML
  comments are the ones only Jeffrey can answer — uncomment and fill them in.

  Nothing inside an HTML comment is ingested, so an unfinished section is safe: the bot
  will say it doesn't know and point to the email address rather than guess.

  Re-run `npm run ingest` after editing.
-->

## Who is Jeffrey Lucban?

Jeffrey Lucban is a backend developer with 8+ years of experience, based in General Trias,
Cavite, Philippines. He builds scalable backend systems, RESTful APIs, payment
integrations, and identity verification (eKYC) solutions, and describes his work as turning
complex requirements into reliable and scalable products that streamline operations.

## How much experience does he have?

8+ years. His first industry role was a web development internship starting December 2015,
and his most recent position was Senior Backend Developer at Twala, from October 2020 to
May 2026.

## What industries has he worked in?

FinTech, SaaS, and gaming. In practice that has meant payments and subscription billing,
identity verification, document processing and e-signature platforms, admin and monitoring
portals, and game backends.

## Is he backend-only, or full-stack?

He positions as a backend engineer who is comfortable end-to-end, rather than backend-only.
The claim a visitor should come away with is that he can own a feature from database schema
through to the user interface, not just write the server half of it.

The evidence is concrete: at Twala he worked across the identity verification pipeline, the
payment and subscription layer, the document processing pipeline, and the internal admin
portal. Earlier, at iParent Portal, he delivered end-to-end features connecting frontend and
backend, including an RFID canteen system that involved hardware, deployment, and training
the people who used it. He has also shipped frontend work in React and Vue, and game
content in Unity and Unreal Engine.

## What is the most significant thing he has worked on?

eGovDocs — the official e-signature platform of the Philippines, which he collaborated on
while at Twala. It is now integrated into the eGov PH App, enabling millions of Filipinos to
sign government documents online.

## What is the best way to contact him?

Email: lucbanjep@gmail.com. He is also on GitHub at github.com/DyepLucban and LinkedIn at
linkedin.com/in/jeffrey-lucban.

## Is he currently open to work?

The availability status shown on the portfolio's home page is the live answer, and it
changes as his job search does. His most recent role ended in May 2026. For anything
specific — timelines, process, next steps — email lucbanjep@gmail.com.

## How was this portfolio site built?

He built it solo. The frontend is React 19 with Vite, React Router, Tailwind CSS 4, and
Framer Motion. Content is stored in Supabase Postgres and served through a single Deno Edge
Function that routes by path, shapes the JSON server-side, and keeps the browser from ever
talking to the database directly. The site is deployed on Vercel.

The layering is strict and deliberate: component to hook to service to Edge Function to
Postgres. A component never calls Supabase itself.

## How does this chat assistant work?

It is part of the same Edge Function. Questions are answered from two sources at once: a set
of background documents (CV, LinkedIn profile, and this FAQ) that were chunked and embedded
with a 384-dimension gte-small model into Postgres using pgvector, and the live contents of
the portfolio's own database, read fresh on every question. The assembled context goes to a
Groq-hosted model and the answer is streamed back token by token as server-sent events.

It is instructed to answer only from that context and never to invent employers, project
names, metrics, or dates. If it says it doesn't know something, that means the answer
genuinely isn't in the material it was given.

The site itself is the demonstration: the retrieval pipeline, the streaming endpoint, and
the widget are all his own work.

## What projects has he built?

The project list on this site is read live from its database, so whatever the Projects page
currently shows is the current, complete answer.

## Does he use AI tools in his work?

Yes, and openly. He uses Claude Code and GitHub Copilot to accelerate code reviews, test
generation, and API integration, cutting time on routine tasks. This site — including the
chat assistant answering you right now — was built that way.

## Why do his Twala and POLKER dates overlap?

His Twala role (Oct 2020 – May 2026) overlaps his POLKER / CPE Games role (Jun 2021 – Oct
2023) because the POLKER role was part-time, held alongside his full-time position at Twala.
The earlier overlap is the same story: his freelance web development (Feb 2017 – Oct 2020)
ran alongside his employed roles, including WTech (Feb 2018 – Apr 2020). This is concurrent
part-time and contract work, not a gap or a discrepancy in the timeline.

## Where is he willing to work — remote, hybrid, or onsite?

He prefers fully remote work. He is open to a hybrid arrangement, but ideally no more than
about one day onsite per week, with the rest work-from-home. His recent roles were remote,
including a part-time role for a Malta-based studio, so he has a track record of working
across time zones and overlapping with European hours from the Philippines.

## What is his notice period / when can he start?

He is available to start immediately. His most recent role ended in May 2026. For specifics
on timelines and next steps, email lucbanjep@gmail.com.

## What are his salary expectations?

He prefers to discuss compensation directly with the hiring team rather than list a figure
publicly. Email lucbanjep@gmail.com to start that conversation.

## What is he learning right now?

His current focus is AI engineering and game development. On the AI side, this portfolio's
own chat assistant — its retrieval pipeline and streaming endpoint — is a working example of
that interest. On the game side, he holds a TESDA Game Programming NC III and builds in Unity
and Unreal Engine. (LinkedIn lists Go among his top skills with a Udemy certification, but Go
was a one-off course rather than a current focus, which is why it does not appear on his CV
or this site's skills list.)

## Does he have a degree?

He holds a Diploma in Web Application from ACLC and a TESDA Game Programming NC III
certification. His path into engineering was non-traditional: he started as a junior web
developer and grew across the stack over eight-plus years of shipping production systems,
rather than through a traditional four-year computer-science degree.

## Why backend?

He started as a junior web developer — HTML, CSS, JS, the usual front-end grind of pixel-perfect layouts and browser quirks. It was fine work, but what kept pulling his attention was what happened after the form submitted: how data got validated, stored, and turned into something the rest of the system could trust. Building a login flow taught him more about how an app actually works than months of styling buttons ever did.
That curiosity turned into a shift. He started picking up backend tickets whenever he could, then found himself gravitating toward the API layer, the database schema, the "why does this break under load" problems. What he likes about backend is that the constraints are honest — a query is either fast or it isn't, a system either handles concurrent writes correctly or it doesn't. There's less room for "it looks fine" to substitute for "it works."
He never fully left the front end behind, though. Years of building things end-to-end — APIs, admin portals, integrations, the occasional UI — mean he's just as comfortable reasoning about a React component as he is about a Lambda function or a Postgres index. That range is less about being a generalist for its own sake and more a byproduct of always wanting to see how the whole thing fits together.

## How does he work with a team?

At Twala, he spearheaded code reviews and refactoring initiatives, so this isn't theoretical — it's how he actually operates day to day. His reviews tend to focus less on style nitpicks and more on structure and long-term maintainability: is this going to be easy to change in six months, does it introduce a pattern the rest of the codebase will have to live with, is there a simpler way to get the same result. He'd rather leave a comment that teaches something than one that just fixes a line.
He mixes async and synchronous review depending on what the change calls for. Most reviews happen async, through PR comments — it gives him time to actually sit with the code and think it through rather than react in real time, and it leaves a written trail the author (and anyone else) can revisit later. But for anything genuinely ambiguous, high-risk, or hard to untangle in text — a gnarly refactor, a payment or identity-verification change, a design decision with real tradeoffs — he'll pull the author into a quick call or pair on it directly. He treats sync review as a tool for the moments that need it, not a default.
He documents as he goes rather than after the fact — API integrations, admin portal logic, the reasoning behind a schema decision — because he's found that context decays fast, and the person most likely to need it later is future-him on a different project.
When requirements are ambiguous, he'd rather ask a clarifying question early than build the wrong thing efficiently. He tends to sketch out an approach or edge cases before writing code, especially for anything touching payments, identity verification, or other places where "mostly right" isn't good enough.
As for how he prefers work handed to him: give him the why along with the what. A ticket that explains the underlying problem gives him room to flag a better approach or catch an edge case the requirement missed — versus a spec so detailed it leaves no room to think.

## What are his English / communication skills like?

Strong, professional, and tested in practice — not just self-reported. He's worked remotely with a Malta-based studio, which meant daily written and verbal communication in English with an international team: standups, PR reviews, technical discussions, requirement clarifications, all in English, with no language barrier slowing anything down. Remote work also means communication has to carry more weight than in an office, since there's no hallway conversation to fall back on — so he's used to writing clear async updates, documenting decisions, and asking precise clarifying questions rather than assuming context. If it helps, a call is the fastest way to confirm this directly.

## Copy of resume

Share this link https://drive.google.com/file/d/1UKLR_YIG7cM_MQtR_Zt1MGQ513glXhAz/view?usp=drive_link.