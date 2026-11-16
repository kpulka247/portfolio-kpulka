import type { Project } from "../schema";
import sources from "../sources.json";
import acrossTheWeb from "../../assets/projects/novice/across-the-web.webp";
import cover from "../../assets/projects/novice/cover.webp";
import icon from "../../assets/projects/novice/icon.png";
import popup from "../../assets/projects/novice/popup.webp";
import search from "../../assets/projects/novice/search.webp";
import spoilerCover from "../../assets/projects/novice/spoiler-cover.webp";

export const novice: Project = {
  slug: "novice",
  name: "NoVice",
  type: "extension",
  pitch:
    "Play GTA VI knowing nothing about it. Blurs trailers, leaks and story spoilers on every website you visit.",
  tagline: "Play GTA VI knowing nothing about it.",
  summary:
    "NoVice blurs every trailer, leak, post and story spoiler about Grand Theft Auto VI on every website you visit, and leaves the rest of the internet alone. It is on from the moment you install it.",
  meta: "Browser extension for Chrome and Firefox",
  platforms: "Chrome and Firefox",
  builtWith: ["Webpack", "web-ext", "Playwright", "semantic-release"],
  facts: [{ label: "Languages", value: "20, following the browser" }],
  links: {
    github: "https://github.com/kpulka247/novice",
    releases: "https://github.com/kpulka247/novice/releases/latest",
  },
  sources: sources["novice"],
  icon: { kind: "image", image: { src: icon, alt: "" } },
  cover: {
    device: "browser",
    depth: "deep",
    tint: "#ff3d9a",
    screen: {
      kind: "image",
      image: {
        src: cover,
        alt: "YouTube search results with every GTA VI result blurred by NoVice",
      },
    },
    front: {
      src: popup,
      alt: "The NoVice popup with protection, blur and strict mode switched on",
    },
  },
  features: [
    {
      name: "Blur or remove",
      text: "Spoilers blur in place with a small tag. Hover to see which words matched, click to see the post, or switch to removing them.",
    },
    {
      name: "Knows the game",
      text: "Every spelling of the title in every script, the characters, the places of Leonida, and Rockstar's own channels.",
    },
    {
      name: "Strict mode",
      text: 'Also catches GTA and Rockstar posts, insiders, leakers, creators and roleplay servers, and posts that hide GTA VI behind "See more".',
    },
    {
      name: "Your own keywords",
      text: "Add any word or phrase, and it is blocked everywhere, like GTA VI.",
    },
    {
      name: "Covers whole pages",
      text: "Trailers, reviews and wikis about GTA VI get a see-through cover.",
    },
    {
      name: "Private",
      text: "Everything runs on your device. No data leaves it.",
    },
  ],
  screenshots: [
    {
      src: acrossTheWeb,
      alt: "GTA VI content blurred on YouTube, Wikipedia, Steam and Twitch",
      caption: "The same filter on YouTube, Wikipedia, Steam and Twitch.",
    },
    {
      src: spoilerCover,
      title: "Whole pages",
      alt: "The Spoiler ahead cover over a page about GTA VI, with the NoVice popup open",
      caption: "Whole pages about the game get a see-through cover.",
    },
    {
      src: search,
      title: "Search results",
      alt: "Bing results for Rockstar Games with the GTA results blurred",
      caption: "Search results stay readable around the blurred ones.",
    },
  ],
  screenshotLayout: "stack",
  order: 1,
};
