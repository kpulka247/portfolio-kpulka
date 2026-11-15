import type { MetaFunction } from "react-router";

import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { About } from "../sections/About";
import { Hero } from "../sections/Hero";
import { Stack } from "../sections/Stack";
import { Work } from "../sections/Work";

export const meta: MetaFunction = () => [
  { title: "Kamil Pułka | Full-stack developer" },
  {
    name: "description",
    content:
      "Full-stack developer from Poland. I build and ship web apps, browser extensions and mobile apps that people use every day.",
  },
];

export default function MainPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <div className="relative z-10 -mt-7 rounded-t-[28px] bg-sheet text-text md:-mt-10 md:rounded-t-sheet">
          <div className="mx-auto max-w-[1280px] space-y-24 px-5 pt-18 pb-3 md:space-y-32 md:px-16 md:pt-32 md:pb-16">
            <Work />
            <Stack />
            <About />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
