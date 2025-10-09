import type { JSX } from "react";

export interface Skill {
  name: string;
  url: string;
  icon: JSX.Element;
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}
