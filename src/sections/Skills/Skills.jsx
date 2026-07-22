import { motion } from "framer-motion";
import { Card, SectionHeading } from "@/components/ui";
import { useSkills } from "@/hooks/useSkills";
import SkillBadge from "./SkillBadge";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

export default function Skills() {
  const { skills, loading, error } = useSkills();

  return (
    <section id="skills">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionHeading eyebrow="Skills" title="What I work with" />

        {loading && (
          <p className="mt-8 font-mono text-sm text-text-muted">
            Loading skills…
          </p>
        )}
        {error && (
          <p className="mt-8 font-mono text-sm text-text-muted">
            Couldn’t load skills.
          </p>
        )}

        {!loading && !error && (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {skills.map((group) => (
              <motion.div key={group.id} variants={staggerItem}>
                <Card>
                  <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
                    {group.category}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <SkillBadge key={item} label={item} />
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
