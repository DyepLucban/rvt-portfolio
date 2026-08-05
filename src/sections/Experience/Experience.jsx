import { motion } from "framer-motion";
import { SectionHeading, Spinner } from "@/components/ui";
import { useExperience } from "@/hooks/useExperience";
import ExperienceItem from "./ExperienceItem";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

export default function Experience() {
  const { experience, loading, error } = useExperience();

  return (
    <section id="experience">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <SectionHeading eyebrow="Experience" title="Where I’ve worked" />

        {loading && <Spinner label="Loading experience…" className="mt-8" />}
        {error && (
          <p className="mt-8 font-mono text-sm text-text-muted">
            Couldn’t load experience.
          </p>
        )}

        {!loading && !error && (
          <ol className="mt-12">
            {experience.map((item, index) => (
              <motion.li key={item.id} variants={staggerItem}>
                <ExperienceItem item={item} index={index} />
              </motion.li>
            ))}
          </ol>
        )}
      </motion.div>
    </section>
  );
}
