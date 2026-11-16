import { Link } from "react-router";

import { SOURCE_URL } from "../data/contact";
import { ThemeChoice } from "./ThemeSwitch";

export default function Footer() {
  return (
    <footer className="border-t border-rule bg-sheet px-5 pt-6 pb-8 text-sm text-dim md:flex md:items-center md:justify-between md:px-16 md:py-7">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 md:order-2 md:gap-x-7">
        <ThemeChoice />
        <Link
          to="/privacy"
          className="underline decoration-dim decoration-1 underline-offset-4 hover:decoration-paper"
        >
          Privacy
        </Link>
        <a
          href={SOURCE_URL}
          className="underline decoration-dim decoration-1 underline-offset-4 hover:decoration-paper"
        >
          Source on GitHub
        </a>
      </div>
      <p className="mt-3 md:order-1 md:mt-0">
        © {new Date().getFullYear()} Kamil Pułka
      </p>
    </footer>
  );
}
