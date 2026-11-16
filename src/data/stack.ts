import type { ComponentType, SVGProps } from "react";
import { PiPuzzlePieceBold } from "react-icons/pi";
import {
  SiClaude,
  SiCloudflare,
  SiExpo,
  SiGithubactions,
  SiNextdotjs,
  SiOpenai,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

import { PlaywrightIcon } from "../components/icons/PlaywrightIcon";

export interface StackItem {
  name: string;
  // Where the tool was used. Proof, never a skill level.
  note: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const stack: StackItem[] = [
  { name: "TypeScript", note: "Web, mobile and tooling", Icon: SiTypescript },
  { name: "React", note: "Gifoji and this site", Icon: SiReact },
  {
    name: "Next.js",
    note: "Gifoji, routes and server actions",
    Icon: SiNextdotjs,
  },
  {
    name: "React Native and Expo",
    note: "do nothing, with native modules",
    Icon: SiExpo,
  },
  { name: "Tailwind CSS", note: "Gifoji and this site", Icon: SiTailwindcss },
  {
    name: "Supabase",
    note: "Auth, Postgres, RPCs and policies",
    Icon: SiSupabase,
  },
  {
    name: "Browser extensions",
    note: "Manifest V3 for Chrome and Firefox",
    Icon: PiPuzzlePieceBold,
  },
  {
    name: "Playwright",
    note: "Tests for both extensions",
    Icon: PlaywrightIcon,
  },
  {
    name: "GitHub Actions and semantic-release",
    note: "Automated releases in every repo",
    Icon: SiGithubactions,
  },
  {
    name: "Vercel and Cloudflare",
    note: "Deploys, DNS and the edge",
    Icon: SiCloudflare,
  },
  { name: "AI APIs", note: "OpenAI and fal.ai in Gifoji", Icon: SiOpenai },
  {
    name: "AI coding agents",
    note: "Claude Code, Codex and MCP",
    Icon: SiClaude,
  },
];
