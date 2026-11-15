export type ProjectType = "extension" | "web" | "mobile" | "plugin";

export interface Image {
  src: string;
  alt: string;
}

export interface Screenshot extends Image {
  caption?: string;
}

// The square mark next to the project on its cover. Most projects ship an
// icon file. Polsimer has none, so its cover draws three LEDs instead.
export type ProjectIcon = { kind: "image"; image: Image } | { kind: "leds" };

// What fills the device frame on the cover: one screenshot, or a gallery
// built from several images (Gifoji has no single screenshot of its app).
export type CoverScreen =
  | { kind: "image"; image: Image }
  | { kind: "gallery"; wordmark: Image; images: Image[] };

export interface Cover {
  device: "browser" | "window" | "phone";
  // "deep" runs the window further off the corner, so only its top-left
  // part shows. "shallow" keeps more of it in view.
  depth: "deep" | "shallow";
  // The product's own brand colour, used only for the glow behind the frame.
  tint: string;
  screen: CoverScreen;
  // An extension's own popup, floating fully in view over the window.
  front?: Image;
}

// Store listings the build looks up for user counts, ratings and status.
// A project with a store field shows "Coming to <store>" until the listing
// exists.
export interface Stores {
  chromeId?: string;
  amoSlug?: string;
  playId?: string;
}

export interface Project {
  slug: string;
  name: string;
  type: ProjectType;
  // One line on the card.
  pitch: string;
  // The paragraph on the project page.
  summary: string;
  // The line under the status on the card, such as "Browser extension for
  // Chrome and Firefox".
  meta: string;
  platforms: string;
  builtWith: string[];
  links: { github?: string; website?: string; releases?: string };
  stores?: Stores;
  // "owner/repo", for the latest release and the download count.
  githubRepo?: string;
  icon: ProjectIcon;
  cover: Cover;
  features: { name: string; text: string }[];
  screenshots: Screenshot[];
  // Newest first. The newest project spans two columns on desktop.
  order: number;
}

// A project listed as one row under "Earlier work", with no page.
export interface EarlierProject {
  name: string;
  summary: string;
  link: string;
  linkLabel: string;
}
