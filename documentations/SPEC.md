# React Portfolio: Code Structure Guide
### (React + Vite + Tailwind CSS — Static Now, Dynamic-Ready Later)

This guide documents the recommended folder structure and architecture for a personal portfolio app that starts fully static (local data) but is designed to plug into a real API later with minimal refactoring.

---

## Core Principle

Never let components import data directly. Instead, components call a **hook**, which calls a **service function**. The service function *currently* returns local static data but *later* can fetch from an API — same return shape, zero component changes.

```
Component → Hook → Service → Data (local now / API later)
```

---

## 1. Base Folder Structure

```
src/
├── assets/                # images, icons, fonts, resume.pdf
│   ├── images/
│   └── icons/
│
├── components/             # reusable, "dumb" UI pieces
│   ├── ui/                 # generic building blocks
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   └── SectionHeading.jsx
│   └── layout/
│       ├── Navbar.jsx
│       ├── Footer.jsx
│       └── Container.jsx
│
├── sections/                # page sections (portfolio-specific)
│   ├── Hero/
│   │   └── Hero.jsx
│   ├── Projects/
│   │   ├── Projects.jsx
│   │   └── ProjectCard.jsx
│   ├── Experience/
│   │   ├── Experience.jsx
│   │   └── ExperienceItem.jsx
│   └── Skills/
│       ├── Skills.jsx
│       └── SkillBadge.jsx
│
├── data/                    # STATIC data lives here (for now)
│   ├── projects.js
│   ├── experience.js
│   └── skills.js
│
├── services/                # the "swap point" for future API
│   ├── projectService.js
│   ├── experienceService.js
│   └── skillService.js
│
├── hooks/                   # custom hooks components actually use
│   ├── useProjects.js
│   ├── useExperience.js
│   └── useSkills.js
│
├── context/                 # only if you need global state (theme, etc.)
│   └── ThemeContext.jsx
│
├── lib/                     # utils, constants, helpers
│   ├── constants.js
│   └── utils.js
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## 2. The Static-to-Dynamic Pattern

### Step 1 — Static data file (now)

```js
// src/data/projects.js
export const projects = [
  {
    id: 1,
    slug: "portfolio-website",
    title: "Portfolio Website",
    description: "My personal portfolio built with React + Vite + Tailwind.",
    tags: ["React", "Tailwind", "Vite"],
    image: "/assets/images/portfolio.png",
    liveUrl: "https://yourdomain.com",
    githubUrl: "https://github.com/you/portfolio",
  },
  // ...more projects
];
```

> Add a `slug` field to each item now — it makes routing to detail pages easy later.

### Step 2 — Service function (the abstraction layer)

```js
// src/services/projectService.js
import { projects } from "../data/projects";

// Later, this is the ONLY function you touch to go live:
export async function getProjects() {
  // return await fetch("/api/projects").then(res => res.json());
  return Promise.resolve(projects); // static for now, but already async-shaped
}

export async function getProjectBySlug(slug) {
  const found = projects.find((p) => p.slug === slug);
  return Promise.resolve(found ?? null);
  // later: return fetch(`/api/projects/${slug}`).then(res => res.json());
}
```

The function already returns a **Promise**, so components never need to know whether data came from a local array or a network call.

### Step 3 — Hook that components actually use

```js
// src/hooks/useProjects.js
import { useState, useEffect } from "react";
import { getProjects } from "../services/projectService";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading, error };
}
```

```js
// src/hooks/useProject.js  (single project, by slug)
import { useState, useEffect } from "react";
import { getProjectBySlug } from "../services/projectService";

export function useProject(slug) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProjectBySlug(slug)
      .then(setProject)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [slug]);

  return { project, loading, error };
}
```

### Step 4 — Component consumes the hook

```jsx
// src/sections/Projects/Projects.jsx
import { useProjects } from "../../hooks/useProjects";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  const { projects, loading, error } = useProjects();

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p>Something went wrong.</p>;

  return (
    <section id="projects" className="py-16">
      <h2 className="text-3xl font-bold mb-8">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
```

### Step 5 — Going live later

When ready, only `projectService.js` changes:

```js
export async function getProjects() {
  const res = await fetch("https://your-api.com/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}
```

Nothing else in the app changes. Repeat the same pattern for `experience.js` and `skills.js`.

---

## 3. Extra Tips (Base Setup)

- **Path aliases**: configure `@/` in `vite.config.js` and `jsconfig.json` so imports read `@/hooks/useProjects` instead of `../../../hooks/useProjects`.
- **Barrel exports**: add an `index.js` in folders like `components/ui/` to import multiple components in one line.
- **Tailwind tokens**: keep a `lib/constants.js` for shared design tokens (breakpoints, animation durations) alongside `tailwind.config.js` theme extensions.
- **Environment variables**: add a `.env` now with a placeholder like `VITE_API_BASE_URL=` so switching to a real API later is just filling in a value.
- **Don't over-engineer routing early** — skip React Router until separate URLs are actually needed (see below).

---

## 4. Adding React Router

Add routing once you want **separate URLs** — e.g. individual project case-study pages, a dedicated About page, or a proper 404.

### When it's worth it for a portfolio

- `/` — home (Hero, Skills, Experience, Projects preview)
- `/projects` — full projects list
- `/projects/:slug` — individual project case study
- `/about` — longer bio
- `*` — 404 page

### Install

```bash
npm install react-router-dom
```

### Updated folder structure with routing

```
src/
├── components/
├── sections/
├── data/
│   └── projects.js          # slug field already added
├── services/
│   └── projectService.js
├── hooks/
│   ├── useProjects.js
│   └── useProject.js
├── layouts/
│   └── MainLayout.jsx        # Navbar + Outlet + Footer
├── pages/
│   ├── Home.jsx
│   ├── ProjectsPage.jsx
│   ├── ProjectDetailPage.jsx
│   ├── AboutPage.jsx
│   └── NotFoundPage.jsx
├── routes/
│   └── router.jsx            # centralized route config
├── App.jsx
└── main.jsx
```

### 4.1 Layout component (shared Navbar/Footer across pages)

```jsx
// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet /> {/* page content renders here */}
      </main>
      <Footer />
    </div>
  );
}
```

### 4.2 Centralized router config

```jsx
// src/routes/router.jsx
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "projects/:slug", element: <ProjectDetailPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
```

### 4.3 Wire it up in `main.jsx`

```jsx
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

> `App.jsx` becomes optional in this setup — `main.jsx` renders the router directly. Some devs keep a thin `App.jsx` that just renders `<RouterProvider>` for consistency; either approach is fine.

### 4.4 Detail page (uses the same service/hook pattern, with a param)

```jsx
// src/pages/ProjectDetailPage.jsx
import { useParams, Link } from "react-router-dom";
import { useProject } from "../hooks/useProject";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { project, loading, error } = useProject(slug);

  if (loading) return <p>Loading...</p>;
  if (error || !project) return <p>Project not found.</p>;

  return (
    <article className="max-w-3xl mx-auto py-16 px-4">
      <Link to="/projects" className="text-sm text-blue-500">
        ← Back to projects
      </Link>
      <h1 className="text-4xl font-bold mt-4">{project.title}</h1>
      <p className="mt-4 text-gray-600">{project.description}</p>
      {/* tags, images, live/github links, etc. */}
    </article>
  );
}
```

### 4.5 Navbar using `NavLink`

```jsx
// src/components/layout/Navbar.jsx
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  return (
    <nav className="flex gap-6 p-4">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            isActive ? "font-semibold text-blue-600" : "text-gray-600"
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
```

---

## 5. Extra Tips (Routing-Specific)

- **Lazy-load route pages** with `React.lazy()` + `Suspense` as the app grows, to keep the initial bundle small:
  ```jsx
  const ProjectDetailPage = React.lazy(() => import("../pages/ProjectDetailPage"));
  ```
- **Scroll restoration**: add a small `<ScrollToTop />` component that listens to route changes and calls `window.scrollTo(0, 0)` — React Router doesn't do this automatically.
- **SEO**: consider `react-helmet-async` to set page titles/meta per route (each `/projects/:slug` should have a unique `<title>`).
- **Deployment**: on Netlify/Vercel with `createBrowserRouter`, add a rewrite rule (`/* → /index.html`) so refreshing `/projects/portfolio-website` doesn't 404.
- **Keep `Home.jsx` composing existing sections** — the single-page scrolling feel isn't lost; you're adding deep-linkable pages on top of it. `Home.jsx` can still render `<Hero />`, `<Skills />`, `<Experience />`, `<Projects />` in sequence.

---

## 6. Visual Design & Theme System

Direction: **clean, simple, dark** — generous whitespace, one restrained accent doing the interactive work, and a second warm accent used sparingly so the palette feels paired rather than flat. Precision in spacing and type matters more than decoration here — a minimal direction only reads as "designed" if the details (contrast, alignment, consistent rhythm) are tight.

### 6.1 Color tokens

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#10131A` | Page background — soft near-black navy, not pure black |
| `--color-surface` | `#1A1F2B` | Cards, nav bar, elevated panels |
| `--color-border` | `#2A303D` | Hairline dividers, card outlines |
| `--color-text` | `#E4E7EC` | Primary text |
| `--color-text-muted` | `#8A93A6` | Secondary text, captions, dates |
| `--color-accent` | `#4FD1C5` (teal) | Links, primary buttons, active states |
| `--color-accent-warm` | `#E8A54D` (amber) | Highlights, hover glows, small emphasis details |

Teal and amber sit near-complementary on the color wheel, so they read as intentionally paired rather than random. **Use the teal as the workhorse accent** (links, buttons, focus rings) and **the amber only for small emphasis moments** (a highlighted tag, a hover state, an underline) — never let both compete for attention in the same spot.

### 6.2 Typography

| Role | Typeface | Notes |
|---|---|---|
| Display (name, section headings) | **Space Grotesk** | Semi-bold, used with restraint — big for the hero name, otherwise modest sizes |
| Body | **Inter** | Regular/medium weights for descriptions, bios, paragraphs |
| Utility / mono (tags, dates, labels) | **JetBrains Mono** | Tech stack tags, dates, section eyebrows — reinforces the "developer" register |

Using mono for tags and dates isn't just decoration — it encodes "this is data/metadata" versus "this is prose," which is a real distinction in a portfolio (a project's tech stack vs. its description).

### 6.3 Layout principles

- Single-column, generous vertical rhythm (`py-24`/`py-32` between major sections) — let content breathe rather than filling space.
- Section eyebrows in mono, uppercase, muted color + letter-spacing (e.g. `PROJECTS`, `EXPERIENCE`) sitting above each heading — a quiet structural device, not a numbered sequence (numbering only makes sense for the Experience timeline, where order is real information).
- Cards (`--color-surface` background, `--color-border` 1px outline, subtle rounded corners — `rounded-lg` or `rounded-xl`) for project and experience entries. Avoid heavy shadows; on a dark theme, a 1px border reads cleaner than a drop shadow.
- One signature moment in the hero: a blinking mono-font cursor (`|`) in `--color-accent` right after your name/role, like a terminal prompt — a small, on-brand detail that doesn't require extra animation elsewhere on the page.

### 6.4 Implementation — Tailwind + CSS variables

Using CSS variables (rather than hardcoding hex in `tailwind.config.js`) keeps the door open for a future light-mode toggle without touching component code.

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #10131a;
  --color-surface: #1a1f2b;
  --color-border: #2a303d;
  --color-text: #e4e7ec;
  --color-text-muted: #8a93a6;
  --color-accent: #4fd1c5;
  --color-accent-warm: #e8a54d;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        accent: "var(--color-accent)",
        "accent-warm": "var(--color-accent-warm)",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
```

Now components use semantic class names instead of raw hex values:

```jsx
// src/sections/Projects/ProjectCard.jsx
export default function ProjectCard({ project }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 hover:border-accent transition-colors">
      <h3 className="font-display text-xl text-text">{project.title}</h3>
      <p className="text-text-muted mt-2">{project.description}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-xs px-2 py-1 rounded bg-bg text-accent-warm border border-border"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

```jsx
// Hero signature detail — blinking cursor
<h1 className="font-display text-5xl text-text">
  Your Name
  <span className="text-accent animate-pulse">|</span>
</h1>
```

### 6.5 Component conventions

- **Primary button**: `bg-accent text-bg font-medium rounded-lg px-5 py-2.5 hover:opacity-90` — the one place the strong accent fills a solid background.
- **Secondary/ghost button**: `border border-border text-text hover:border-accent` — outline only, no fill.
- **Links**: `text-accent hover:text-accent-warm underline-offset-4 hover:underline` — the accent swap on hover is a small, consistent way to use both colors without clutter.
- **Focus states**: always keep a visible focus ring (`focus:outline-none focus:ring-2 focus:ring-accent`) — don't strip it for aesthetics, especially on a dark background where default browser outlines are hard to see anyway.
- **Motion**: keep it minimal — a fade/slide-up on scroll into view for sections (e.g. via `Intersection Observer` or a small library like `framer-motion`), and the hero cursor blink. Resist adding motion everywhere; on a "clean and simple" direction, restraint is the point. Respect `prefers-reduced-motion`.

### 6.6 Quick checklist

- [ ] Google Fonts (or self-hosted) import for Space Grotesk, Inter, JetBrains Mono
- [ ] CSS variables defined once in `index.css`, referenced everywhere via Tailwind theme extension
- [ ] Teal (`accent`) used for all primary interactive elements; amber (`accent-warm`) reserved for small highlights only
- [ ] Section eyebrows in mono/uppercase above each heading
- [ ] Cards use border, not heavy shadow
- [ ] Visible focus states on every interactive element
- [ ] Reduced-motion respected for any scroll/hero animation

### 6.7 Icons

Since you don't have a library in mind yet — go with **[Lucide React](https://lucide.dev/)**. It fits this setup well:

- Pure **SVG components**, tree-shakable (only the icons you import end up in your bundle).
- Consistent stroke-based style (1.5–2px strokes, rounded caps) — reads as clean/minimal, matching the direction you're going for, rather than filled/glyph-style icons which feel heavier.
- Every icon inherits `currentColor` by default, so it automatically picks up your Tailwind text/accent colors — no separate icon color system needed.
- Easy to control size/stroke via props, same as any other component.

**Install:**

```bash
npm install lucide-react
```

**Usage — inherits color and sizes like any element:**

```jsx
import { Github, ExternalLink, Mail } from "lucide-react";

// Inherits text color automatically
<Github className="w-5 h-5 text-text-muted hover:text-accent transition-colors" />

// Explicit sizing + stroke width
<ExternalLink size={18} strokeWidth={1.5} className="text-accent" />
```

```jsx
// Example: project card action row
import { Github, ExternalLink } from "lucide-react";

<div className="flex gap-4 mt-4">
  <a href={project.githubUrl} className="text-text-muted hover:text-accent transition-colors">
    <Github className="w-5 h-5" />
  </a>
  <a href={project.liveUrl} className="text-text-muted hover:text-accent transition-colors">
    <ExternalLink className="w-5 h-5" />
  </a>
</div>
```

**If you ever need an icon Lucide doesn't have** (e.g. a specific brand logo like a niche tool's mark), pair it with **[Simple Icons](https://simpleicons.org/)** or **`react-icons`**'s brand set (`react-icons/si`) just for that gap — both are still plain SVG, so they won't clash with the "SVG-only" rule. Keep Lucide as the default for everything else so icon style stays consistent.

**Rule of thumb**: never use icon fonts (like Font Awesome's `<i>` class-based icons) or PNG/raster icon sets — they don't scale as cleanly, don't inherit `currentColor`, and are exactly what the "SVG only" preference is meant to avoid.

---

## Summary

| Layer | Responsibility | Changes when going live? |
|---|---|---|
| `data/` | Local static content | Can be removed once API is live |
| `services/` | Fetches data (local or remote) | **Yes — only file that changes** |
| `hooks/` | Loading/error state + calls service | No |
| `components/` `sections/` `pages/` | Render UI | No |
| `routes/` | URL structure | No (independent of data source) |

This architecture keeps your UI completely decoupled from your data source. Going from static to dynamic later is a small, low-risk change — not a rewrite.
