import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { PiArrowUpRightBold } from "react-icons/pi";
import { useSearchParams } from "react-router";

import { ProjectCard } from "../components/ProjectCard";
import { earlierProjects, projects } from "../content/projects";
import type { ProjectType } from "../content/schema";
import { SectionHeading } from "./SectionHeading";

type Filter = ProjectType | "all";

const GLIDE = "filter-glide";

const FILTER_LABELS: Record<ProjectType, string> = {
  extension: "Browser extensions",
  web: "Web apps",
  mobile: "Mobile",
  plugin: "Plugins",
};

const FILTER_ORDER: ProjectType[] = ["extension", "web", "mobile", "plugin"];

const NUMBER_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];

// Only the types that have a project get a chip.
const filters = FILTER_ORDER.map((type) => ({
  type,
  label: FILTER_LABELS[type],
  count: projects.filter((project) => project.type === type).length,
})).filter((filter) => filter.count > 0);

function isFilter(value: string | null): value is ProjectType {
  return value !== null && value in FILTER_LABELS;
}

function Chip({
  label,
  count,
  selected,
  onSelect,
}: {
  label: string;
  count: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className="chip"
    >
      {label}
      <span className={selected ? "opacity-60" : "text-dim"}>{count}</span>
    </button>
  );
}

export function Work() {
  const [searchParams, setSearchParams] = useSearchParams();
  // The prerendered HTML has no query string, so the first render always
  // shows every project. The URL filter applies after hydration.
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const type = searchParams.get("type");
    setFilter(isFilter(type) ? type : "all");
  }, [searchParams]);

  const gridRef = useRef<HTMLDivElement>(null);

  const select = (next: Filter) => {
    const cards = () =>
      gridRef.current?.querySelectorAll<HTMLElement>(".project-card") ?? [];
    // Where each card is on screen now, mid-glide included, so a quick
    // second click carries on from there.
    const before = new Map<string, DOMRect>();
    for (const card of cards()) {
      before.set(card.getAttribute("href") ?? "", card.getBoundingClientRect());
    }
    flushSync(() => setFilter(next));
    setSearchParams(next === "all" ? {} : { type: next }, {
      replace: true,
      preventScrollReset: true,
    });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // The cards that stay glide from their old places to the new ones. The
    // others come and go at once.
    for (const card of cards()) {
      for (const glide of card.getAnimations()) {
        if (glide.id === GLIDE) glide.cancel();
      }
      const from = before.get(card.getAttribute("href") ?? "");
      if (!from) continue;
      const to = card.getBoundingClientRect();
      const x = from.left - to.left;
      const y = from.top - to.top;
      if (Math.abs(x) < 1 && Math.abs(y) < 1) continue;
      card.animate([{ translate: `${x}px ${y}px` }, { translate: "0 0" }], {
        id: GLIDE,
        duration: 400,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      });
    }
  };

  const visible =
    filter === "all"
      ? projects
      : projects.filter((project) => project.type === filter);

  return (
    <section id="work" aria-labelledby="work-heading" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div>
          <SectionHeading id="work-heading">Work</SectionHeading>
          <p className="mt-4 max-w-[40ch] text-base leading-normal text-soft md:mt-5 md:text-md">
            {NUMBER_WORDS[projects.length] ?? projects.length} things I built on
            my own, newest first.
          </p>
        </div>
        <div
          role="group"
          aria-label="Filter projects"
          className="-mx-5 flex w-[calc(100%+40px)] gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:w-auto md:flex-wrap md:overflow-visible md:px-0"
        >
          <Chip
            label="All"
            count={projects.length}
            selected={filter === "all"}
            onSelect={() => select("all")}
          />
          {filters.map(({ type, label, count }) => (
            <Chip
              key={type}
              label={label}
              count={count}
              selected={filter === type}
              onSelect={() => select(type)}
            />
          ))}
        </div>
      </div>

      <div
        ref={gridRef}
        className="mt-8 grid grid-cols-1 gap-y-14 md:mt-14 md:grid-cols-2 md:gap-x-10 md:gap-y-18 lg:grid-cols-3"
      >
        {visible.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            wide={index === 0}
          />
        ))}
      </div>

      <h3 className="mt-18 font-display text-[24px] font-extrabold text-paper [font-stretch:112%] md:mt-32 md:text-lg">
        Earlier work
      </h3>
      <ul className="mt-4 md:mt-5">
        {earlierProjects.map((project) => (
          <li key={project.name}>
            <a
              href={project.link}
              className="group grid grid-cols-[1fr_20px] items-center gap-x-8 gap-y-1.5 border-y border-rule py-4.5 hover:bg-raised md:-mx-4 md:grid-cols-[240px_1fr_120px_24px] md:px-4 md:py-5.5"
            >
              <span className="font-semibold text-paper">{project.name}</span>
              <PiArrowUpRightBold
                aria-hidden="true"
                className="size-5 text-dim md:order-last"
              />
              <span className="col-span-2 text-sm leading-normal text-soft md:col-span-1 md:text-base">
                {project.summary}
              </span>
              <span className="hidden text-sm text-dim md:block">
                {project.linkLabel}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
