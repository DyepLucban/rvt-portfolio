import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Briefcase, Layers, FolderKanban } from "lucide-react";
import Container from "./Container";
import { SITE } from "@/lib/constants";

const NAV_ITEMS = [
  { to: '/', label: 'Me', icon: User },
  { to: '/experience', label: 'Experience', icon: Briefcase },
  { to: '/skills', label: 'Skills', icon: Layers },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <NavLink
          to="/"
          className="font-display text-lg font-semibold uppercase tracking-wide text-text transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        >
          {SITE.name}
          <span className="font-mono text-accent">_</span>
        </NavLink>

        <nav className="flex items-center gap-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-4 py-2 transition-colors font-display text-sm uppercase tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'text-text'
                    : 'text-text-muted hover:text-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-underline"
                      className="absolute inset-x-3 bottom-0 h-0.5 bg-accent"
                      transition={{ duration: 0.15 }}
                    />
                  )}
                  <Icon className="h-4 w-4 relative z-10" strokeWidth={1.5} />
                  <span className="relative z-10 hidden sm:inline">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </Container>
    </header>
  );
}
