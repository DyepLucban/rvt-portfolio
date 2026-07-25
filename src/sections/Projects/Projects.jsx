import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui";
import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "./ProjectCard";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

export default function Projects() {
  const { projects, loading, error } = useProjects();

  return (
    <section id="projects">
      <motion.div
        initial="initial"
        animate="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionHeading eyebrow="Projects" title="Things I’ve built" />

        {loading && (
          <p className="mt-8 font-mono text-sm text-text-muted">
            Loading projects…
          </p>
        )}
        {error && (
          <p className="mt-8 font-mono text-sm text-text-muted">
            Couldn’t load projects.
          </p>
        )}

        {!loading && !error && (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <motion.div key={project.id} variants={staggerItem}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
