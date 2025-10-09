import type { Project } from "../types/project";

export const projectsData: Project[] = [
  {
    id: 1,
    title: "Dark Connect",
    shortDescription:
      "Dark mode for Garmin Connect website that replaces light colors with their dark theme.",
    description:
      "This is a simple browser extension designed to turn the Garmin Connect website into dark mode. Frustrated by the lack of a dark mode feature on Garmin Connect, I created this extension to enhance the browsing experience for users who prefer a darker interface, especially during nighttime use. The extension is lightweight, easy to to install, and only affects Garmin Connect domains, leaving all other websites untouched.",
    techStack: ["React.js", "JavaScript", "HTML5", "CSS3", "Webpack"],
    githubLink: "https://github.com/kpulka247/dark-connect",
    chromeExtensionId: "nadhhgppikppmjacnkebagbgcibnfnob",
    firefoxExtensionId: "dark-connect",
  },
  {
    id: 2,
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
  },
];
