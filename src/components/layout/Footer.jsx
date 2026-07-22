import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import Container from "./Container";
import { SITE, SOCIALS } from "@/lib/constants";

const SOCIAL_ICONS = [
  { href: SOCIALS.github, label: "GitHub", Icon: GithubIcon },
  { href: SOCIALS.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  { href: SOCIALS.email, label: "Email", Icon: Mail },
];

export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-mono text-xs text-text-muted">
          © {new Date().getFullYear()} {SITE.name}. Built with React &amp; Tailwind.
        </p>
        <div className="flex items-center gap-5">
          {SOCIAL_ICONS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noreferrer"
              className="text-text-muted transition-colors hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded"
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </Container>
    </footer>
  );
}
