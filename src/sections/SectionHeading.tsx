import type { ReactNode } from "react";

export function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="rise-on-scroll font-display text-[48px] leading-[0.95] font-extrabold tracking-[-0.02em] text-paper [font-stretch:112%] md:text-2xl"
    >
      {children}
    </h2>
  );
}
