import portrait1600 from "../assets/about/portrait-1600.webp";
import portrait800 from "../assets/about/portrait-800.webp";
import { INSTAGRAM_URL } from "../data/contact";
import { Contact } from "./Contact";

const FACTS = [
  { title: "Based in Poland", body: "Working remote-first" },
  { title: "End to end", body: "Design, code, payments and releases" },
] as const;

// The hero's light panel comes back to close the page: About on top, Contact
// as its last band.
export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="-mx-2 grid scroll-mt-24 overflow-hidden rounded-[28px] bg-ground text-ink md:mx-0 md:rounded-sheet lg:grid-cols-[minmax(300px,4fr)_8fr] xl:grid-cols-[5fr_8fr]"
    >
      <div className="relative h-[340px] md:h-[440px] lg:h-auto">
        <img
          src={portrait800}
          srcSet={`${portrait800} 800w, ${portrait1600} 1600w`}
          sizes="(min-width: 1024px) 460px, 100vw"
          alt="Kamil Pułka"
          width={1600}
          height={1524}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover object-top"
        />
      </div>
      <div className="@container px-5 pt-8 pb-5 md:px-14 md:pt-14 md:pb-12">
        <h2
          id="about-heading"
          className="font-display text-[48px] leading-[0.95] font-extrabold tracking-[-0.02em] [font-stretch:112%] md:text-2xl"
        >
          About
        </h2>
        <p className="mt-4 max-w-[40ch] text-[18px] leading-[1.45] font-medium md:mt-6 md:text-md">
          I'm Kamil, a developer from Poland. I take a product from the first
          sketch to the store listing.
        </p>
        <p className="mt-3.5 max-w-[52ch] text-base leading-[1.6] text-ink-dim">
          Most of what I ship started as something that annoyed me. A white
          Garmin dashboard at night, GTA VI spoilers everywhere, a phone I kept
          picking up.
        </p>
        <ul className="mt-6 grid border-t-[1.5px] border-ink text-sm leading-[1.45] text-ink-dim md:mt-8 md:grid-cols-3">
          {FACTS.map(({ title, body }) => (
            <li key={title} className={FACT}>
              <p className={FACT_TITLE}>{title}</p>
              {body}
            </li>
          ))}
          <li className={FACT}>
            <p className={FACT_TITLE}>Off the keyboard</p>
            Cycling, snowboarding, sim racing. Trips on{" "}
            <a
              href={INSTAGRAM_URL}
              className="underline decoration-ink/35 underline-offset-3 hover:decoration-ink"
            >
              Instagram
            </a>
          </li>
        </ul>
        <Contact />
      </div>
    </section>
  );
}

const FACT =
  "border-b border-ink/16 py-3.5 last:border-b-0 last:pb-0 md:border-b-0 md:pt-4 md:pr-4 md:pb-0 md:not-first:border-l md:not-first:pl-4";
const FACT_TITLE = "mb-0.5 text-[15px] font-semibold text-ink";
