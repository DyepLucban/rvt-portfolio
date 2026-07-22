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
  Vitest: null,
  Playwright: null,
  ESLint: SI.siEslint,
  Docker: SI.siDocker,
  Vue: SI.siVuedotjs,
  "Vue.js": SI.siVuedotjs,
  Svelte: SI.siSvelte,
  Angular: SI.siAngular,
  PostgreSQL: SI.siPostgresql,
  MongoDB: SI.siMongodb,
  MySQL: SI.siMysql,
  Redis: SI.siRedis,
  GraphQL: SI.siGraphql,
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

export function getIconComponent(skillName) {
  const iconData = ICON_MAP[skillName];
  if (!iconData) return null;

  return (props) => <SimpleIcon iconData={iconData} {...props} />;
}
