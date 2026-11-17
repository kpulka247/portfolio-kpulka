import { Link } from "react-router";

import { SOURCE_URL } from "../data/contact";
import { ThemeChoice } from "./ThemeSwitch";

export default function Footer() {
  return (
    <footer
      data-surface="sheet"
      className="border-t border-rule bg-sheet px-5 pt-6 pb-8 text-sm text-dim md:flex md:items-center md:justify-between md:px-16 md:py-7"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 md:order-2 md:gap-x-7">
        <ThemeChoice />
        <Link to="/privacy" className="text-link hover:text-paper">
          Privacy
        </Link>
        <a href={SOURCE_URL} className="text-link hover:text-paper">
          Source on GitHub
        </a>
      </div>
      <p className="mt-3 md:order-1 md:mt-0">
        © {new Date().getFullYear()} Kamil Pułka
      </p>
    </footer>
  );
}
