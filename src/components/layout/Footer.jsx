import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import IconButton from "@/components/ui/IconButton";
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
        <div className="flex items-center gap-2">
          {SOCIAL_ICONS.map(({ href, label, Icon }) => (
            <IconButton
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              label={label}
              size="sm"
              icon={<Icon strokeWidth={1.5} />}
            />
          ))}
        </div>
      </Container>
    </footer>
  );
}
