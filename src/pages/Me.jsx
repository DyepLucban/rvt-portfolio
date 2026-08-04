import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import Container from "@/components/layout/Container";
import { Button, DataRow, PanelHeader } from "@/components/ui";
import Frame from "@/components/ui/Frame";
import IconButton from "@/components/ui/IconButton";
import { SITE, SOCIALS } from "@/lib/constants";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

const SPEC_ROWS = [
  { label: "Role", value: SITE.role },
  { label: "Location", value: SITE.location },
  { label: "Availability", value: SITE.availability },
  { label: "Contact", value: SITE.email },
];

export default function Me() {
  return (
    <section className="relative min-h-screen pt-28 pb-24 sm:pt-36 sm:pb-32">
      <div className="absolute inset-0 -z-10 bg-grid-dots opacity-40" aria-hidden="true" />

      <Container className="max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-stretch">
          <Frame className="overflow-hidden rounded-sm border border-border bg-surface/40 backdrop-blur-sm">
            <PanelHeader label="~/me" />

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="p-8 sm:p-12"
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
                className="mt-4 font-display text-6xl font-bold leading-[0.95] tracking-tight text-text sm:text-7xl"
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
                className="mt-6 max-w-lg text-base font-mono leading-relaxed text-text-muted sm:text-lg"
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
                className="mt-8 flex items-center gap-2"
              >
                <IconButton
                  href={SOCIALS.github}
                  target="_blank"
                  rel="noreferrer"
                  label="GitHub"
                  icon={<GithubIcon />}
                />
                <IconButton
                  href={SOCIALS.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  label="LinkedIn"
                  icon={<LinkedinIcon />}
                />
              </motion.div>
            </motion.div>
          </Frame>

          <Frame className="overflow-hidden rounded-sm border border-border bg-surface/40 backdrop-blur-sm">
            <PanelHeader label="~/spec.data" />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: 0.15 }}
              className="p-6 sm:p-8"
            >
              <DataRow title="Developer data" rows={SPEC_ROWS} />
            </motion.div>
          </Frame>
        </div>
      </Container>
    </section>
  );
}
