import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui";
import { SITE, SOCIALS } from "@/lib/constants";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

export default function Me() {
  return (
    <section className="relative min-h-screen pt-28 pb-24 sm:pt-36 sm:pb-32">
      <div className="absolute inset-0 -z-10 bg-grid-dots opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'var(--gradient-hero)' }}
        aria-hidden="true"
      />

      <Container>
        <div className="overflow-hidden rounded-xl border border-border bg-surface/40 backdrop-blur-sm">
          <div className="flex h-9 items-center gap-2 border-b border-border/60 bg-black/10 px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-warm/80" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-text/40" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-green/70" aria-hidden="true" />
            <span className="mx-auto font-mono text-xs text-text-muted/60">~/me</span>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-2xl p-8 sm:p-12"
          >
            <motion.p
              variants={staggerItem}
              className="font-mono text-sm text-accent"
            >
              <span className="text-accent-warm">{"> "}</span>
              Hi, my name is
            </motion.p>

            <motion.h1
              variants={staggerItem}
              className="mt-4 font-display text-6xl font-bold leading-[0.95] tracking-tight text-text sm:text-8xl"
            >
              {SITE.name}
              <span className="text-accent animate-cursor" aria-hidden="true">
                |
              </span>
            </motion.h1>

            <motion.h2
              variants={staggerItem}
              className="mt-3 font-display text-2xl font-medium text-accent-warm sm:text-3xl"
            >
              {SITE.role}
            </motion.h2>

            <motion.p
              variants={staggerItem}
              className="mt-6 max-w-xl font-body text-base leading-relaxed text-text-muted sm:text-lg"
            >
              {SITE.tagline}
            </motion.p>

            <motion.div
              variants={staggerItem}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Button to="/projects">
                View my work
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Button>
              <Button href={SOCIALS.email} variant="ghost">
                <Mail className="h-4 w-4" strokeWidth={1.5} />
                Get in touch
              </Button>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="mt-8 flex items-center gap-4"
            >
              <a
                href={SOCIALS.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-text-muted transition-colors hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded"
              >
                <GithubIcon className="h-6 w-6" />
              </a>
              <a
                href={SOCIALS.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-text-muted transition-colors hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded"
              >
                <LinkedinIcon className="h-6 w-6" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
