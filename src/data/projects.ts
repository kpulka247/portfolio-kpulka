import type { Project } from "../types/project";

export const projectsData: Project[] = [
  {
    id: 1,
    title: "Gifoji",
    shortDescription:
      "Mood-driven AI image and GIF generation app with profiles, pricing plans, and a moderated public gallery.",
    description:
      "Gifoji is an AI image and animation app built around mood-driven generation. It includes authentication, token-based generation and animation, subscription and token-pack billing, profile/settings management, and a moderated public gallery with reporting and admin controls.",
    techStack: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Supabase",
      "OpenAI",
      "fal.ai",
      "Lemon Squeezy",
    ],
    websiteLink: "https://gifoji.com",
    cardTheme: {
      palette: {
        baseStart: "#8b7fab",
        baseEnd: "#6d648f",
        accent: "#e0c9ff",
        accentSoft: "#bde3ff",
        textMain: "#ffffff",
        textMuted: "rgba(245,247,252,0.86)",
        tagBg: "rgba(111, 106, 136, 0.9)",
        linkBg: "rgba(0, 0, 0, 0.76)",
        edgeColor: "#5c5c5f",
      },
      frontVariant: "mood-gradient",
      backMotif: "gifoji-generative-frames",
      animationProfile: "pulse-drift",
      linkButtonStyle: "glass-pill",
    },
  },
  {
    id: 2,
    title: "Dark Connect",
    shortDescription:
      "Dark mode for Garmin Connect website that replaces light colors with their dark theme.",
    description:
      "This is a simple browser extension designed to turn the Garmin Connect website into dark mode. Frustrated by the lack of a dark mode feature on Garmin Connect, I created this extension to enhance the browsing experience for users who prefer a darker interface, especially during nighttime use. The extension is lightweight, easy to to install, and only affects Garmin Connect domains, leaving all other websites untouched.",
    techStack: ["React.js", "JavaScript", "HTML5", "CSS3", "Webpack"],
    githubLink: "https://github.com/kpulka247/dark-connect",
    chromeExtensionId: "nadhhgppikppmjacnkebagbgcibnfnob",
    firefoxExtensionId: "dark-connect",
    cardTheme: {
      palette: {
        baseStart: "#69717e",
        baseEnd: "#4f5762",
        accent: "#aac4e7",
        accentSoft: "#becbd9",
        textMain: "#ffffff",
        textMuted: "rgba(238,242,248,0.84)",
        tagBg: "rgba(80, 88, 101, 0.9)",
        linkBg: "rgba(0, 0, 0, 0.78)",
        edgeColor: "#5c5c5f",
      },
      frontVariant: "night-panel",
      backMotif: "dark-connect-toggle-night",
      animationProfile: "scan-flicker",
      linkButtonStyle: "glass-pill",
    },
  },
  {
    id: 3,
    title: "StudentOffers",
    shortDescription:
      "A full-stack application with a Django backend and a responsive React frontend.",
    description:
      "The site was created using React.js and Django. It is a continuation of my original project of a website with offers for students, which was part of my Engineering Thesis. The site will be further developed, as it is also a project for learning new skills as well as testing different solutions.",
    techStack: [
      "React.js",
      "Django",
      "JavaScript",
      "Tailwind CSS",
      "HTML5",
      "CSS3",
    ],
    githubLink: "https://github.com/kpulka247/studentoffers",
    cardTheme: {
      palette: {
        baseStart: "#898598",
        baseEnd: "#706b80",
        accent: "#e3dbc9",
        accentSoft: "#d4cebf",
        textMain: "#ffffff",
        textMuted: "rgba(242,246,252,0.86)",
        tagBg: "rgba(108, 103, 120, 0.9)",
        linkBg: "rgba(0, 0, 0, 0.76)",
        edgeColor: "#5c5c5f",
      },
      frontVariant: "academic-board",
      backMotif: "student-offers-coupons",
      animationProfile: "float-glow",
      linkButtonStyle: "paper-ticket",
    },
  },
];
