import { stack } from "../data/stack";
import { SectionHeading } from "./SectionHeading";

export function Stack() {
  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="grid scroll-mt-24 gap-x-16 md:grid-cols-[1fr_2fr]"
    >
      <div>
        <SectionHeading id="stack-heading">Stack</SectionHeading>
        <p className="mt-4 max-w-[28ch] text-base leading-normal text-soft md:mt-5 md:text-md">
          The tools I reach for, including the AI coding agents I work with
          every day.
        </p>
      </div>
      <ul className="mt-6 grid gap-x-10 md:mt-0 md:grid-cols-2">
        {stack.map(({ name, note, Icon }) => (
          <li
            key={name}
            className="flex items-center gap-3.5 border-t border-rule py-4.5"
          >
            <Icon aria-hidden="true" className="size-6 shrink-0 text-text" />
            <div>
              <p className="font-semibold text-paper">{name}</p>
              <p className="mt-0.5 text-sm text-dim">{note}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
