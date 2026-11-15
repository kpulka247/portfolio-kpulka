import type { Project } from "../schema";
import cover from "../../assets/projects/do-nothing/cover.webp";
import done from "../../assets/projects/do-nothing/done.webp";
import icon from "../../assets/projects/do-nothing/icon.png";
import idle from "../../assets/projects/do-nothing/idle.webp";
import intro from "../../assets/projects/do-nothing/intro.webp";

export const doNothing: Project = {
  slug: "do-nothing",
  name: "do nothing",
  type: "mobile",
  pitch:
    "Tap, put the phone down, and the app counts the minutes it stays still. Everything stays on the device.",
  summary:
    "do nothing is a one-screen app for short breaks from the phone. Tap, put the phone down, and leave it. The motion sensors notice when the phone is still, and the timer counts only that time. Pick the phone up and the timer pauses until you put it down again.",
  meta: "Mobile app with Expo and React Native",
  platforms: "Android, with iOS to follow",
  builtWith: ["Expo", "React Native", "TypeScript", "Skia", "Reanimated"],
  links: {},
  stores: { playId: "com.kpulka.donothing" },
  icon: { kind: "image", image: { src: icon, alt: "" } },
  cover: {
    device: "phone",
    depth: "deep",
    tint: "#d9dadf",
    screen: {
      kind: "image",
      image: {
        src: cover,
        alt: "do nothing asking you to put the phone down, with the edge glow following the screen corners",
      },
    },
  },
  features: [
    {
      name: "One tap",
      text: "Tap the screen, put the phone down, and leave it. There is nothing else to set up.",
    },
    {
      name: "Only stillness counts",
      text: "The timer starts after three still seconds and pauses the moment the phone moves.",
    },
    {
      name: "Works when locked",
      text: "The session continues with the screen off. Android shows a quiet notification, iOS a Live Activity.",
    },
    {
      name: "Gentle nudges",
      text: "If you pick the phone up, the edges glow and a short vibration asks you to put it back down.",
    },
    {
      name: "Private",
      text: "No account and no analytics. Everything stays on the device.",
    },
  ],
  screenshots: [
    { src: intro, alt: "The first-launch screen that explains the app" },
    { src: idle, alt: "The idle screen with today's time" },
    {
      src: done,
      alt: "The summary after a session: you did nothing for 07:31",
    },
  ],
  order: 3,
};
