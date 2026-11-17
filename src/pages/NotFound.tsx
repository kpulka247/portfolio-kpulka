import { Link, type MetaFunction } from "react-router";

import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";

export const meta: MetaFunction = () => [
  { title: "Page not found | Kamil Pułka" },
  { name: "robots", content: "noindex" },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        id="main"
        data-surface="ground"
        className="bg-ground pt-32 pb-24 text-ink md:pt-40 md:pb-30"
      >
        <div className="mx-auto max-w-[1280px] px-5 md:px-16">
          <p
            aria-hidden="true"
            className="font-display text-[clamp(120px,22vw,240px)] leading-[0.8] font-[850] tracking-[-0.03em] [font-stretch:112%]"
          >
            404
          </p>
          <h1 className="mt-10 font-display text-[32px] leading-none font-extrabold tracking-[-0.02em] [font-stretch:112%] md:text-xl">
            This page doesn't exist
          </h1>
          <p className="mt-4 max-w-[44ch] text-base text-ink-dim md:text-md">
            The address may be mistyped, or the page moved when the site was
            rebuilt.
          </p>
          <Link to="/" viewTransition className="btn btn-solid mt-8">
            Go to the home page
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
