import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading, Spinner, Tag } from "@/components/ui";
import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "./ProjectCard";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

export default function Projects() {
  const { projects, loading, error } = useProjects();
  const [activeTag, setActiveTag] = useState(null);

  const allTags = useMemo(
    () => [...new Set(projects.flatMap((project) => project.tags ?? []))].sort(),
    [projects]
  );

  const visibleProjects = activeTag
    ? projects.filter((project) => project.tags?.includes(activeTag))
    : projects;

  return (
    <section id="projects">
      <motion.div
        initial="initial"
        animate="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <SectionHeading eyebrow="Projects" title="Things I’ve built" />

        {loading && <Spinner label="Loading projects…" className="mt-8" />}
        {error && (
          <p className="mt-8 font-mono text-sm text-text-muted">
            Couldn’t load projects.
          </p>
        )}

        {!loading && !error && (
          <>
            {allTags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                <Tag selected={activeTag === null} onClick={() => setActiveTag(null)}>
                  All
                </Tag>
                {allTags.map((tag) => (
                  <Tag
                    key={tag}
                    selected={activeTag === tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {visibleProjects.map((project) => (
                <motion.div key={project.id} variants={staggerItem}>
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}
