import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Briefcase, Layers, FolderKanban } from "lucide-react";
import Container from "./Container";
import PanelHeader from "@/components/ui/PanelHeader";
import { SITE } from "@/lib/constants";

const NAV_ITEMS = [
  { to: '/', label: 'Me', icon: User },
  { to: '/experience', label: 'Experience', icon: Briefcase },
  { to: '/skills', label: 'Skills', icon: Layers },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
];

// The site's whole chrome reads as one open terminal window — every content
// panel opens with this exact dot-chrome + mono-path header, so the
// persistent shell gets the same titlebar instead of a plain generic nav.
const SITE_PATH = `~/${SITE.name.toLowerCase().replace(/\s+/g, "-")}`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-surface/70 backdrop-blur-md">
      <PanelHeader label={SITE_PATH} />
      <Container className="flex h-16 items-center justify-between border-b border-border">
        <NavLink
          to="/"
          className="whitespace-nowrap font-display text-sm font-semibold uppercase tracking-normal text-text transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm sm:text-lg sm:tracking-wide"
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
