import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { cardHover } from "@/lib/motionVariants";

export default function ProjectCard({ project }) {
  return (
    <motion.div
      {...cardHover}
      className="h-full"
    >
      <Card className="group flex flex-col h-full hover:border-accent hover:shadow-[0_8px_24px_-8px_var(--color-accent)] transition-all overflow-hidden">
        {project.snapshot_url && (
          <div className="mb-4 h-48 w-full overflow-hidden rounded-lg bg-gradient-to-br from-accent/20 to-accent-warm/20">
            <img
              src={project.snapshot_url}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold text-text">
            {project.name}
          </h3>
          <div className="flex shrink-0 gap-3 pt-1">
            {project.githubUrl && (
              <motion.a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.title} on GitHub`}
                className="text-text-muted transition-colors hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <GithubIcon className="h-5 w-5" />
              </motion.a>
            )}
            {project.live_url && (
              <motion.a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.title} live site`}
                className="text-text-muted transition-colors hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="h-5 w-5" strokeWidth={1.5} />
              </motion.a>
            )}
          </div>
          <>
            {console.log(project)}
          </>
        </div>

        <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-text-muted">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag, idx) => (
            <Badge
              key={tag}
              className={idx % 2 === 0 ? "text-accent-green" : ""}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
