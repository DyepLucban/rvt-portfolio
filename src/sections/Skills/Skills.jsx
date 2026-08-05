import { motion } from "framer-motion";
import { Frame, PanelHeader, SectionHeading, Spinner } from "@/components/ui";
import { useSkills } from "@/hooks/useSkills";
import SkillBadge from "./SkillBadge";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

export default function Skills() {
  const { skills, loading, error } = useSkills();

  return (
    <section id="skills">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <SectionHeading eyebrow="Skills" title="What I work with" />

        {loading && <Spinner label="Loading skills…" className="mt-8" />}
        {error && (
          <p className="mt-8 font-mono text-sm text-text-muted">
            Couldn’t load skills.
          </p>
        )}

        {!loading && !error && (
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {skills.map((group) => (
              <motion.div key={group.id} variants={staggerItem} className="h-full">
                <Frame className="flex h-full flex-col overflow-hidden rounded-sm border border-border bg-surface/80">
                  <PanelHeader label={group.category} />
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <SkillBadge key={item} label={item} />
                      ))}
                    </div>
                  </div>
                </Frame>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
