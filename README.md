<div align="center">

# RVT Portfolio

**A personal portfolio with a grounded AI chat assistant, built on React, Vite, and Supabase.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white)
![Node](https://img.shields.io/badge/Node-%E2%89%A5%2020-339933?logo=nodedotjs&logoColor=white)

</div>

---

## Overview

RVT Portfolio showcases **Me**, **Projects**, **Experience**, and **Skills** pages, backed by a Supabase Postgres database through a single Deno Edge Function.

It also ships with a floating **"Know more"** chat widget: a grounded AI assistant that answers questions about Jeffrey using his CV and the live content of the site, so answers stay accurate and current.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)

## Features

- **Multi-page portfolio** with Me, Projects, Experience, and Skills sections
- **Smooth animations** powered by Framer Motion
- **Single Edge Function backend** serving all site data from Supabase Postgres
- **Grounded AI chat** that answers from two sources at once: curated documents and the live database
- **Streamed responses** from Groq (`openai/gpt-oss-120b`)
- **Built-in rate limiting and chat logging** to protect the endpoint and learn from real visitor questions

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, React Router 7, Vite 8 with `@vitejs/plugin-react` |
| **Styling & Animation** | Tailwind CSS 4 (via `@tailwindcss/vite`), Framer Motion, lucide-react, simple-icons |
| **Backend & Data** | Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Supabase Edge Functions (Deno), Postgres + pgvector |
| **AI** | Groq (`openai/gpt-oss-120b`) for streamed chat completions |
| **Tooling** | ESLint 10 |