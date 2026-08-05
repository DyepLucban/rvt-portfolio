import * as SI from "simple-icons";

// Map skill names to Simple Icons objects (which contain svg path data).
// Icon keys are from simple-icons: e.g., "siJavascript", "siReact", etc.
const ICON_MAP = {
  JavaScript: SI.siJavascript,
  TypeScript: SI.siTypescript,
  HTML: SI.siHtml5,
  CSS: SI.siCss,
  Python: SI.siPython,
  React: SI.siReact,
  "Next.js": SI.siNextdotjs,
  Vite: SI.siVite,
  "Tailwind CSS": SI.siTailwindcss,
  "Node.js": SI.siNodedotjs,
  Git: SI.siGit,
  ESLint: SI.siEslint,
  Docker: SI.siDocker,
  Vue: SI.siVuedotjs,
  "Vue.js": SI.siVuedotjs,
  PostgreSQL: SI.siPostgresql,
  MongoDB: SI.siMongodb,
  MySQL: SI.siMysql,
  Redis: SI.siRedis,
  GraphQL: SI.siGraphql,
  Laravel: SI.siLaravel,
  Codeigniter: SI.siCodeigniter,
  PHP: SI.siPhp,
  "Sails.js": SI.siNodedotjs,
  "Express.js": SI.siNodedotjs,
  "Adonis.js": SI.siNodedotjs,
  Bootstrap: SI.siBootstrap,
  "React.js": SI.siReact,
  "C#": SI.siC,
  Unity: SI.siUnity,
  "Unreal Engine": SI.siUnrealengine,
  Claude: SI.siClaude,
  "Claude Code": SI.siClaudecode,
  Github: SI.siGithub,
  "Github Copilot": SI.siGithubcopilot,
  "Design Systems": SI.siCodecrafters,
  "Performance": SI.siCodecrafters,
  "CI/CD": SI.siCodecrafters,
  Supabase: SI.siSupabase,
};

// React component wrapper for Simple Icons
export function SimpleIcon({ iconData, className = "h-6 w-6" }) {
  if (!iconData) return null;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path d={iconData.path} />
    </svg>
  );
}

export function getIconData(skillName) {
  return ICON_MAP[skillName] ?? null;
}
