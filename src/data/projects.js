// Static project data (placeholder). Swap these entries for your own.
// The `slug` field is here now so routing to detail pages stays cheap later.
export const projects = [
  {
    id: 1,
    slug: "portfolio-website",
    title: "Portfolio Website",
    description:
      "My personal portfolio built with React, Vite, and Tailwind CSS — a fully static site architected to plug into a real API later with minimal refactoring.",
    tags: ["React", "Vite", "Tailwind"],
    image: "/assets/images/portfolio.png",
    liveUrl: "https://yourdomain.com",
    githubUrl: "https://github.com/you/portfolio",
    featured: true,
  },
  {
    id: 2,
    slug: "task-flow",
    title: "TaskFlow",
    description:
      "A keyboard-first task manager with offline sync, optimistic updates, and a command palette. Handles thousands of tasks without a jank.",
    tags: ["React", "TypeScript", "IndexedDB"],
    image: "/assets/images/taskflow.png",
    liveUrl: "https://taskflow.example.com",
    githubUrl: "https://github.com/you/taskflow",
    featured: true,
  },
  {
    id: 3,
    slug: "api-forge",
    title: "API Forge",
    description:
      "A CLI that scaffolds typed REST clients from an OpenAPI spec, with retries, caching, and mock servers baked in for local development.",
    tags: ["Node", "TypeScript", "OpenAPI"],
    image: "/assets/images/apiforge.png",
    liveUrl: "https://apiforge.example.com",
    githubUrl: "https://github.com/you/api-forge",
    featured: false,
  },
  {
    id: 4,
    slug: "pixel-weather",
    title: "Pixel Weather",
    description:
      "A tiny, delightful weather app rendering forecasts as animated pixel-art scenes. Built to explore Canvas performance and playful UI.",
    tags: ["React", "Canvas", "Open-Meteo"],
    image: "/assets/images/pixelweather.png",
    liveUrl: "https://pixelweather.example.com",
    githubUrl: "https://github.com/you/pixel-weather",
    featured: false,
  },
];
