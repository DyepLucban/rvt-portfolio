// No longer imported at runtime — skillService.js now reads this from the
// Supabase `skills` table. Kept here as the seed data for that table.
export const skills = [
  {
    id: 1,
    category: "Backend",
    items: ["PHP", "Python", "Node.js", "Laravel", "Codeigniter", "Sails.js", "Express.js", "Adonis.js", "MySQL", "PostgreSQL", "MongoDB", "Redis"],
  },
  {
    id: 2,
    category: "Web",
    items: ["HTML", "CSS", "JavaScript", "TypeScript", "Vue.js", "Bootstrap", "React.js", "Tailwind CSS"],
  },
  {
    id: 3,
    category: "Tools",
    items: ["Git", "Github", "Docker", "Claude", "Claude Code", "Github Copilot"],
  },
  {
    id: 4,
    category: "Game Development",
    items: ["C#", "Unity", "Unreal Engine"],
  },
  {
    id: 4,
    category: "Practices",
    items: ["Design Systems", "Performance", "CI/CD"],
  },
];
