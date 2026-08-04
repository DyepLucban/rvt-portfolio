import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Frame from "@/components/ui/Frame";
import IconButton from "@/components/ui/IconButton";
import { cardHover } from "@/lib/motionVariants";

export default function ProjectCard({ project }) {
  return (
    <motion.div
      {...cardHover}
      className="h-full"
    >
      <Card className="group flex flex-col h-full hover:border-accent transition-all overflow-hidden bg-surface/80">
        {project.snapshot_url && (
          <Frame className="mb-4 h-48 w-full overflow-hidden rounded-sm bg-linear-to-br from-accent/20 to-accent-warm/20">
            <img
              src={project.snapshot_url}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          </Frame>
        )}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold text-text">
            {project.name}
          </h3>
          <div className="flex shrink-0 gap-2 pt-1">
            {project.githubUrl && (
              <IconButton
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                label={`${project.name} on GitHub`}
                size="sm"
                icon={<GithubIcon />}
              />
            )}
            {project.live_url && (
              <IconButton
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                label={`${project.name} live site`}
                size="sm"
                icon={<ExternalLink strokeWidth={1.5} />}
              />
            )}
          </div>
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
