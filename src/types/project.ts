export type CardFrontVariant =
  | "mood-gradient"
  | "night-panel"
  | "academic-board";

export type CardBackMotif =
  | "gifoji-generative-frames"
  | "dark-connect-toggle-night"
  | "student-offers-coupons";

export type CardAnimationProfile =
  | "pulse-drift"
  | "scan-flicker"
  | "float-glow";

export type CardLinkButtonStyle = "glass-pill" | "neon-outline" | "paper-ticket";

export interface CardThemePalette {
  baseStart: string;
  baseEnd: string;
  accent: string;
  accentSoft: string;
  textMain: string;
  textMuted: string;
  tagBg: string;
  linkBg: string;
  edgeColor: string;
}

export interface CardTheme {
  palette: CardThemePalette;
  frontVariant: CardFrontVariant;
  backMotif: CardBackMotif;
  animationProfile: CardAnimationProfile;
  linkButtonStyle: CardLinkButtonStyle;
}

export interface Project {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  techStack: string[];
  githubLink?: string;
  websiteLink?: string;
  cardTheme?: CardTheme;
  chromeExtensionId?: string;
  firefoxExtensionId?: string;
}
