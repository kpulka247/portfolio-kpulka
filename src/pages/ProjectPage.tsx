import type { IconType } from "react-icons";
import {
  FaChrome,
  FaFirefoxBrowser,
  FaGithub,
  FaGooglePlay,
} from "react-icons/fa";
import {
  PiArrowLeftBold,
  PiArrowRightBold,
  PiArrowUpRightBold,
  PiCodeBold,
} from "react-icons/pi";
import { Link, type MetaFunction, useLocation } from "react-router";

import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { projectNameTransition } from "../components/projectName";
import { findProject, projects } from "../content/projects";
import type { Project, ProjectType, Screenshot } from "../content/schema";
import {
  type Store,
  projectStatus,
  statsFor,
  storeLinks,
  storesOf,
} from "../content/status";
import { pageMeta } from "../seo";
import NotFound, { meta as notFoundMeta } from "./NotFound";

const TYPE_NAMES: Record<ProjectType, string> = {
  extension: "Browser extension",
  web: "Web app",
  mobile: "Mobile app",
  plugin: "Plugin",
};

const STORE_ACTIONS: Record<Store, { label: string; Icon: IconType }> = {
  chrome: { label: "Add to Chrome", Icon: FaChrome },
  firefox: { label: "Add to Firefox", Icon: FaFirefoxBrowser },
  play: { label: "Get it on Google Play", Icon: FaGooglePlay },
};

// "/projects/novice" and "/projects/novice/" both give "novice".
function slugOf(pathname: string): string {
  return pathname.split("/").filter(Boolean)[1] ?? "";
}

// Names longer than this get a smaller title, so they wrap onto fewer lines.
const LONG_NAME = 12;

export const meta: MetaFunction = (args) => {
  const project = findProject(slugOf(args.location.pathname));
  if (!project) return notFoundMeta(args);
  return pageMeta({
    title: `${project.name} | Kamil Pułka`,
    description: project.pitch,
    path: `/projects/${project.slug}`,
    image: `/og/${project.slug}.jpg`,
    imageAlt: `The ${project.name} cover`,
  });
};

export default function ProjectPage() {
  const project = findProject(slugOf(useLocation().pathname));
  if (!project) return <NotFound />;

  const [lead, ...rest] = project.screenshots;
  const next = projects[(projects.indexOf(project) + 1) % projects.length];

  return (
    <>
      <Navbar />
      <main id="main">
        <div
          data-surface="ground"
          className="bg-ground pt-24 pb-21 text-ink md:pt-32 md:pb-30"
        >
          <div className={CONTAINER}>
            <Link
              to="/#work"
              viewTransition
              className="text-link inline-flex min-h-11 items-center gap-2 text-sm text-ink-dim hover:text-ink"
            >
              <PiArrowLeftBold aria-hidden="true" className="size-4" />
              All work
            </Link>
            <Intro project={project} />
          </div>
        </div>
        <div
          data-surface="sheet"
          className="relative -mt-7 rounded-t-[28px] bg-sheet shadow-[0_-1px_0_var(--color-sheet-line)] pt-12 text-soft md:-mt-10 md:rounded-t-sheet md:pt-18"
        >
          <div className={CONTAINER}>
            {project.screenshotLayout === "grid" ? (
              <Grid screenshots={project.screenshots} />
            ) : (
              lead && (
                <figure>
                  <img
                    src={lead.src}
                    alt={lead.alt}
                    decoding="async"
                    className={SHOT}
                  />
                  {lead.caption && (
                    <figcaption className="mt-3 text-sm text-dim">
                      {lead.caption}
                    </figcaption>
                  )}
                </figure>
              )
            )}

            <section
              aria-labelledby="features-heading"
              className="mt-20 grid gap-6 md:mt-28 lg:grid-cols-[340px_1fr] lg:gap-20"
            >
              <h2 id="features-heading" className={H3}>
                What it does
              </h2>
              <ul className="border-b border-rule">
                {project.features.map((feature) => (
                  <li
                    key={feature.name}
                    className="grid gap-1 border-t border-rule py-4.5 text-base leading-[1.55] md:grid-cols-[200px_1fr] md:gap-6"
                  >
                    <p className="font-semibold text-paper">{feature.name}</p>
                    <p>{feature.text}</p>
                  </li>
                ))}
              </ul>
            </section>

            {project.screenshotLayout === "stack" &&
              rest.map((shot) => <Row key={shot.src} screenshot={shot} />)}

            <Link
              to={`/projects/${next.slug}`}
              viewTransition
              className="group mt-24 flex items-center justify-between gap-6 border-y border-rule py-8 md:mt-32 md:py-10"
            >
              <span>
                <span className="block text-sm text-dim">Next project</span>
                <span className="mt-2 block font-display text-[clamp(36px,9vw,72px)] leading-none font-extrabold text-paper [font-stretch:112%]">
                  <span style={projectNameTransition(next.slug)}>
                    {next.name}
                  </span>
                </span>
              </span>
              <PiArrowRightBold
                aria-hidden="true"
                className="size-8 shrink-0 text-paper transition-transform group-hover:translate-x-1 md:size-10"
              />
            </Link>
          </div>
        </div>
      </main>
      <div className="mt-20 md:mt-24">
        <Footer />
      </div>
    </>
  );
}

function Intro({ project }: { project: Project }) {
  const stats = statsFor(project.slug);
  const status = projectStatus(project, stats);
  const stores = storeLinks(project, stats);
  const release = stats.github?.release;
  const plannedStores = storesOf(project).length;
  const waitingForStores = plannedStores > 0 && stores.length === 0;
  // The status already names the version when there is nothing bigger to say.
  const releaseFacts =
    release && !status.label.includes(`version ${release}`)
      ? [{ label: "Latest release", value: release }]
      : [];

  const actions: { href: string; label: string; Icon: IconType }[] = [
    ...stores.map((link) => ({
      href: link.href,
      ...STORE_ACTIONS[link.store],
    })),
  ];
  if (project.links.website) {
    const host = new URL(project.links.website).host.replace(/^www\./, "");
    actions.push({
      href: project.links.website,
      label: `Open ${host}`,
      Icon: PiArrowUpRightBold,
    });
  }
  if (stores.length === 0 && project.links.releases) {
    actions.push({
      href: project.links.releases,
      label: "Download from GitHub",
      Icon: FaGithub,
    });
  }
  if (project.links.github) {
    actions.push({
      href: project.links.github,
      label: "Source",
      Icon: PiCodeBold,
    });
  }

  const facts = [
    { label: "Type", value: TYPE_NAMES[project.type] },
    { label: "Runs in", value: project.platforms },
    ...releaseFacts,
    { label: "Built with", value: project.builtWith.join(", ") },
    ...(project.facts ?? []),
  ];

  return (
    <div className="mt-8 grid gap-12 md:mt-10 lg:grid-cols-[1fr_340px] lg:items-end lg:gap-20">
      <div>
        <h1
          className={`font-display leading-[0.85] font-[850] tracking-[-0.03em] [font-stretch:96%] md:[font-stretch:118%] ${
            project.name.length > LONG_NAME
              ? "text-[clamp(48px,10vw,104px)]"
              : "text-[clamp(64px,15vw,144px)]"
          }`}
        >
          <span style={projectNameTransition(project.slug)}>
            {project.name}
          </span>
        </h1>
        <p className="mt-6 max-w-[32ch] text-[22px] leading-[1.3] font-medium md:mt-7 md:text-lg">
          {project.tagline}
        </p>
        <p className="mt-3.5 max-w-[46ch] text-base leading-normal text-ink-dim md:text-md">
          {project.summary}
        </p>
        {(actions.length > 0 || waitingForStores) && (
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            {actions.map(({ href, label, Icon }, index) => (
              <a
                key={href}
                href={href}
                className={`btn max-sm:w-full ${index === 0 ? "btn-solid" : "btn-tonal"}`}
              >
                <Icon aria-hidden="true" className="size-4.5" />
                {label}
              </a>
            ))}
            {waitingForStores && (
              <span className="text-sm text-ink-dim">
                {plannedStores > 1
                  ? "Store buttons appear here once the listings are live."
                  : "The store button appears here once the listing is live."}
              </span>
            )}
          </div>
        )}
      </div>
      <dl className="border-b border-edge">
        <div className={FACT}>
          <dt className={FACT_LABEL}>Status</dt>
          <dd className={`${FACT_VALUE} flex items-baseline gap-2`}>
            <i
              aria-hidden="true"
              className={`block size-2 shrink-0 -translate-y-px rounded-full ${
                status.tone === "soon" ? "bg-soon" : "bg-live"
              }`}
            />
            {status.label}
          </dd>
        </div>
        {facts.map(({ label, value }) => (
          <div key={label} className={FACT}>
            <dt className={FACT_LABEL}>{label}</dt>
            <dd className={FACT_VALUE}>{value}</dd>
          </div>
        ))}
        {project.links.privacy && (
          <div className={FACT}>
            <dt className={FACT_LABEL}>Privacy</dt>
            <dd className={FACT_VALUE}>
              <Link to={project.links.privacy} className="text-link">
                Privacy policy
              </Link>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function Row({ screenshot }: { screenshot: Screenshot }) {
  return (
    <figure className="mt-20 grid gap-5 md:mt-28 lg:grid-cols-[340px_1fr] lg:items-end lg:gap-20">
      <figcaption className="text-base leading-[1.55] lg:order-1">
        {screenshot.title && (
          <span className={`${H3} mb-3 block`}>{screenshot.title}</span>
        )}
        {screenshot.caption}
      </figcaption>
      <img
        src={screenshot.src}
        alt={screenshot.alt}
        loading="lazy"
        decoding="async"
        className={`${SHOT} lg:order-2`}
      />
    </figure>
  );
}

function Grid({ screenshots }: { screenshots: Screenshot[] }) {
  return (
    <ul
      className={`grid gap-3 md:gap-5 ${
        screenshots.length === 3
          ? "max-w-[880px] grid-cols-3"
          : "grid-cols-2 md:grid-cols-3"
      }`}
    >
      {screenshots.map((shot) => (
        <li key={shot.src}>
          <figure>
            <img
              src={shot.src}
              alt={shot.alt}
              loading="lazy"
              decoding="async"
              className={SHOT}
            />
            {shot.caption && (
              <figcaption className="mt-3 text-sm text-dim">
                {shot.caption}
              </figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
  );
}

const H3 =
  "font-display text-lg leading-none font-extrabold text-paper [font-stretch:108%]";
// The hairline keeps a screenshot from melting into a sheet of the same
// tone, light or dark.
const SHOT =
  "block h-auto w-full rounded-md outline outline-1 -outline-offset-1 outline-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const CONTAINER = "mx-auto max-w-[1280px] px-5 md:px-16";
const FACT = "border-t border-edge py-4";
const FACT_LABEL = "text-sm text-ink-dim";
const FACT_VALUE = "mt-1 text-base";
