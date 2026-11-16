import { useSyncExternalStore } from "react";

// Light or dark. The page follows the system setting until the visitor
// picks one, and the pick is kept in this browser.
//
// <html> carries two attributes: data-theme, the theme in use, and
// data-theme-preference, what the visitor asked for. THEME_SCRIPT sets both
// before the first paint, so a dark page never flashes light.

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

const KEY = "kpulka:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const CHANGE = "kpulka:themechange";

// Runs inline in <head>. Keep it small and free of imports.
export const THEME_SCRIPT = `(function(){var p;try{p=localStorage.getItem("${KEY}")}catch(e){}if(p!=="light"&&p!=="dark")p="system";var d=document.documentElement;d.dataset.themePreference=p;d.dataset.theme=p==="system"?(matchMedia("${DARK_QUERY}").matches?"dark":"light"):p})()`;

function systemTheme(): Theme {
  return matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function readPreference(): ThemePreference {
  const value = document.documentElement.dataset.themePreference;
  return value === "light" || value === "dark" ? value : "system";
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function apply(preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = preference === "system" ? systemTheme() : preference;
  window.dispatchEvent(new Event(CHANGE));
}

export function setPreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, preference);
  } catch {
    // Private windows can refuse storage. The choice then lasts the visit.
  }
  apply(preference);
}

// Calls back when the theme or the preference changes, including when the
// system setting changes while the page follows it.
export function subscribe(callback: () => void): () => void {
  const media = matchMedia(DARK_QUERY);
  const onSystem = () => {
    if (readPreference() === "system") apply("system");
  };
  media.addEventListener("change", onSystem);
  window.addEventListener(CHANGE, callback);
  return () => {
    media.removeEventListener("change", onSystem);
    window.removeEventListener(CHANGE, callback);
  };
}

// The prerendered HTML is built without a theme, so the server snapshot is
// light. After hydration React switches to the real value.
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => "light");
}

export function usePreference(): ThemePreference {
  return useSyncExternalStore(subscribe, readPreference, () => "system");
}
