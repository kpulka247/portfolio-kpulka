import photo from "/static/images/photo1.jpg";

import { INSTAGRAM_URL } from "../data/contact";
import { SectionHeading } from "./SectionHeading";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="grid scroll-mt-24 items-end gap-x-16 md:grid-cols-[1fr_2fr]"
    >
      <img
        src={photo}
        alt="Kamil Pułka"
        width={609}
        height={913}
        loading="lazy"
        decoding="async"
        className="order-2 mt-6 w-[70%] rounded-md grayscale contrast-[1.05] md:order-1 md:mt-0 md:w-full"
      />
      <div className="order-1 md:order-2">
        <SectionHeading id="about-heading">About</SectionHeading>
        <div className="mt-6 max-w-[36em] space-y-3.5 text-base leading-[1.55] text-soft md:mt-7 md:space-y-4.5 md:text-md md:leading-normal">
          <p>
            I'm Kamil, a developer from Poland. I like taking an idea all the
            way to a store listing: the design, the code, payments, releases and
            the support emails that come after.
          </p>
          <p>
            Most of what I ship started as something that annoyed me. A white
            Garmin dashboard at night, GTA VI spoilers everywhere, a phone I
            kept picking up.
          </p>
          <p>
            Away from the keyboard I cycle, snowboard, travel and drive in a sim
            racing rig. The trips end up on{" "}
            <a
              href={INSTAGRAM_URL}
              className="text-paper underline decoration-dim decoration-1 underline-offset-4 hover:decoration-paper"
            >
              Instagram
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
