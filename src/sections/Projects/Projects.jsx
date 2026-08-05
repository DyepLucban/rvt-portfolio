import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeading, Spinner, Tag } from "@/components/ui";
import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "./ProjectCard";
import { staggerContainer, filterItem } from "@/lib/motionVariants";

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
              <AnimatePresence mode="popLayout">
                {visibleProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    variants={filterItem}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}
