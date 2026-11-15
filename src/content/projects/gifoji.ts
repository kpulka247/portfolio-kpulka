import type { Image, Project } from "../schema";
import clay from "../../assets/projects/gifoji/clay.webp";
import comic from "../../assets/projects/gifoji/comic.webp";
import glitch from "../../assets/projects/gifoji/glitch.webp";
import heart from "../../assets/projects/gifoji/heart.webp";
import icon from "../../assets/projects/gifoji/icon.png";
import stainedGlass from "../../assets/projects/gifoji/stained-glass.webp";
import voxel from "../../assets/projects/gifoji/voxel.webp";
import wordmark from "../../assets/projects/gifoji/wordmark.svg";

const gallery: Image[] = [
  { src: heart, alt: "A happy creature with hearts, made in Gifoji" },
  { src: comic, alt: "A vintage comic portrait, made in Gifoji" },
  { src: stainedGlass, alt: "A stained glass portrait, made in Gifoji" },
  { src: clay, alt: "A clay stop-motion scene, made in Gifoji" },
  { src: voxel, alt: "A voxel art scene, made in Gifoji" },
  { src: glitch, alt: "A glitch art portrait, made in Gifoji" },
];

export const gifoji: Project = {
  slug: "gifoji",
  name: "Gifoji",
  type: "web",
  pitch:
    "Pick a mood and get an AI image or GIF. Profiles, token plans and a moderated public gallery.",
  summary:
    "Gifoji turns moods, prompts and styles into images and GIFs you can create, animate, remix and share. It has accounts and profiles, token plans and packs, and a public gallery with reporting and moderation.",
  meta: "Web app with Next.js and Supabase",
  platforms: "Web",
  builtWith: [
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Supabase",
    "OpenAI",
    "fal.ai",
    "Lemon Squeezy",
  ],
  links: { website: "https://gifoji.com" },
  icon: { kind: "image", image: { src: icon, alt: "" } },
  cover: {
    device: "browser",
    depth: "shallow",
    tint: "#b48cff",
    screen: {
      kind: "gallery",
      wordmark: { src: wordmark, alt: "Gifoji" },
      images: gallery,
    },
  },
  features: [
    {
      name: "Moods, prompts and styles",
      text: "Pick a mood or write a prompt, choose one of 24 styles, and get an image.",
    },
    {
      name: "Animate",
      text: "Turn an image into a short GIF with camera and character presets.",
    },
    {
      name: "Tokens and plans",
      text: "Pay as you go with token packs, or subscribe to a monthly plan.",
    },
    {
      name: "Moderated gallery",
      text: "Share to a public gallery, with reporting and admin review.",
    },
  ],
  screenshots: gallery,
  order: 4,
};
