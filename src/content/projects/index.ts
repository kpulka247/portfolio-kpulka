import type { EarlierProject, Project } from "../schema";
import { darkConnect } from "./dark-connect";
import { gifoji } from "./gifoji";
import { novice } from "./novice";
import { polsimerF74led } from "./polsimer-f74led";

export const projects: Project[] = [
  novice,
  polsimerF74led,
  gifoji,
  darkConnect,
].sort((a, b) => a.order - b.order);

export const earlierProjects: EarlierProject[] = [
  {
    name: "StudentOffers",
    summary:
      "Offers for students, built as my engineering thesis with React and Django.",
    link: "https://github.com/kpulka247/studentoffers",
    linkLabel: "GitHub",
  },
];

export function findProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
