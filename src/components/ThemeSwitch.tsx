import { PiMoonBold, PiSunBold } from "react-icons/pi";

import {
  type ThemePreference,
  setPreference,
  usePreference,
  useTheme,
} from "../theme";

// The round switch in the nav: a moon by day, a sun at night. Both icons
// are in the HTML and CSS picks one from the theme on <html>, so the
// prerendered page shows the right one before React starts.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => setPreference(next)}
      className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)] transition-colors hover:bg-white/10 ${className}`}
    >
      <PiMoonBold aria-hidden="true" className="size-4.5 dark:hidden" />
      <PiSunBold aria-hidden="true" className="hidden size-4.5 dark:block" />
    </button>
  );
}

const CHOICES: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Auto" },
];

export function ThemeChoice() {
  const preference = usePreference();
  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex rounded-full p-0.75 shadow-[inset_0_0_0_1px_var(--color-rule)]"
    >
      {CHOICES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={preference === value}
          onClick={() => setPreference(value)}
          className="cursor-pointer rounded-full px-2.5 py-1.25 text-sm text-dim transition-colors hover:text-paper aria-checked:bg-raised aria-checked:text-paper"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
