import { Mail, ArrowDown } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui";
import { SITE, SOCIALS } from "@/lib/constants";

export default function Hero() {
  return (
    <section id="top" className="relative pt-28 pb-24 sm:pt-36 sm:pb-32">
      <Container>
        <p className="font-mono text-sm text-accent">Hi, my name is</p>

        <h1 className="mt-4 font-display text-5xl font-bold leading-tight text-text sm:text-7xl">
          {SITE.name}
          {/* Signature terminal cursor (SPEC §6.3) */}
          <span className="text-accent animate-cursor" aria-hidden="true">
            |
          </span>
        </h1>

        <h2 className="mt-3 font-display text-2xl font-medium text-text-muted sm:text-3xl">
          {SITE.role}
        </h2>

        <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-text-muted sm:text-lg">
          {SITE.tagline}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button href="#projects">
            View my work
            <ArrowDown className="h-4 w-4" strokeWidth={2} />
          </Button>
          <Button href={SOCIALS.email} variant="ghost">
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            Get in touch
          </Button>
          <a
            href={SOCIALS.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="ml-1 text-text-muted transition-colors hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded"
          >
            <GithubIcon className="h-6 w-6" />
          </a>
        </div>
      </Container>
    </section>
  );
}
