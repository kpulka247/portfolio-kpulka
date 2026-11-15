import type { Project } from "../schema";
import sources from "../sources.json";
import challenges from "../../assets/projects/dark-connect/challenges.webp";
import cover from "../../assets/projects/dark-connect/cover.webp";
import hrv from "../../assets/projects/dark-connect/hrv.webp";
import icon from "../../assets/projects/dark-connect/icon.png";
import popup from "../../assets/projects/dark-connect/popup.webp";
import training from "../../assets/projects/dark-connect/training.webp";

export const darkConnect: Project = {
  slug: "dark-connect",
  name: "Dark Connect",
  type: "extension",
  pitch:
    "Garmin Connect, finally in dark mode. Charts, sleep, training and the rest of the site, without a white flash.",
  summary:
    'Garmin Connect has no dark mode, so Dark Connect adds one. Every page, chart and pop-up is themed by hand, because Garmin colours many features one by one and a simple "invert the colours" approach breaks its charts. The extension runs only on Garmin\'s sites and leaves the rest of the web alone.',
  meta: "Browser extension for Chrome and Firefox",
  platforms: "Chrome and Firefox",
  builtWith: [
    "Webpack",
    "PostCSS",
    "Stylelint",
    "Playwright",
    "semantic-release",
  ],
  links: {
    github: "https://github.com/kpulka247/dark-connect",
    releases: "https://github.com/kpulka247/dark-connect/releases/latest",
  },
  sources: sources["dark-connect"],
  icon: { kind: "image", image: { src: icon, alt: "" } },
  cover: {
    device: "browser",
    depth: "deep",
    tint: "#1e74d9",
    screen: {
      kind: "image",
      image: { src: cover, alt: "The Garmin Connect dashboard in dark mode" },
    },
    front: {
      src: popup,
      alt: "The Dark Connect popup with the theme set to Dark",
    },
  },
  features: [
    {
      name: "All of Garmin Connect",
      text: "Dashboards, activities, health stats, training, courses, challenges and settings, plus LiveTrack.",
    },
    {
      name: "Charts that still read right",
      text: "Garmin's own chart and zone colours stay, on a dark background.",
    },
    {
      name: "Auto, Dark or Light",
      text: "Follow the device setting, keep Garmin Connect dark, or pause the extension.",
    },
    {
      name: "Scan this page",
      text: "Something still white? One click finds it and prepares a report.",
    },
    {
      name: "Private",
      text: "Dark Connect collects no data and runs only on Garmin's own sites.",
    },
  ],
  screenshots: [
    { src: training, alt: "The training page of Garmin Connect in dark mode" },
    { src: hrv, alt: "The HRV status page in dark mode" },
    { src: challenges, alt: "The challenges page in dark mode" },
  ],
  order: 5,
};
