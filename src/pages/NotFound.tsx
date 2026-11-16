import { Link, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Page not found | Kamil Pułka" },
  { name: "robots", content: "noindex" },
];

export default function NotFound() {
  return (
    <main
      id="main"
      className="min-h-screen bg-ground px-6 py-24 text-ink md:px-10"
    >
      <p
        aria-hidden="true"
        className="font-display text-[clamp(120px,22vw,260px)] leading-[0.8] font-extrabold tracking-tight"
        style={{ fontStretch: "50%" }}
      >
        404
      </p>
      <h1
        className="mt-10 font-display text-xl leading-none font-extrabold"
        style={{ fontStretch: "112%" }}
      >
        This page doesn't exist
      </h1>
      <p className="mt-4 max-w-[44ch] text-md text-ink-dim">
        The address may be mistyped, or the page moved when the site was
        rebuilt.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <Link
          to="/"
          className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-ground"
        >
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
