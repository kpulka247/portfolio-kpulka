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
      className={`icon-btn icon-btn-compact cursor-pointer ${className}`}
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
      className="inline-flex gap-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-paper)_8%,transparent)] p-1"
    >
      {CHOICES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={preference === value}
          onClick={() => setPreference(value)}
          className="h-8 cursor-pointer rounded-full px-3.5 text-sm font-medium text-dim hover:text-paper aria-checked:bg-paper aria-checked:text-sheet"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
