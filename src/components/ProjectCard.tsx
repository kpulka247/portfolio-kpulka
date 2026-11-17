import { Link } from "react-router";

import type { Project } from "../content/schema";
import { projectStatus, statsFor } from "../content/status";
import { ProjectCover } from "./ProjectCover";

export function ProjectCard({
  project,
  wide,
}: {
  project: Project;
  wide: boolean;
}) {
  const status = projectStatus(project, statsFor(project.slug));

  return (
    <Link
      to={`/projects/${project.slug}`}
      className={`project-card group flex h-full min-w-0 flex-col rounded-md text-text outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-4 focus-visible:ring-offset-sheet ${wide ? "lg:col-span-2" : ""}`}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-md bg-raised md:aspect-auto md:h-[clamp(240px,25vw,320px)]">
        <ProjectCover cover={project.cover} icon={project.icon} />
      </div>
      <h3 className="mt-5 font-display text-lg leading-[1.05] font-extrabold tracking-[-0.01em] text-paper [font-stretch:108%]">
        {project.name}
      </h3>
      <p className="mt-2.5 mb-4.5 max-w-[54ch] text-base leading-normal text-soft">
        {project.pitch}
      </p>
      <div className="mt-auto flex flex-col items-start gap-1.5 border-t border-rule pt-3">
        <span className="inline-flex items-baseline gap-2 text-sm leading-snug font-medium text-text">
          <i
            aria-hidden="true"
            className={`block size-2 shrink-0 -translate-y-px rounded-full ${status.tone === "soon" ? "bg-soon" : "bg-live"}`}
          />
          {status.label}
        </span>
        <span className="text-sm text-dim">{project.meta}</span>
      </div>
    </Link>
  );
}
