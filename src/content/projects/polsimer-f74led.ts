import type { Project } from "../schema";
import cover from "../../assets/projects/polsimer-f74led/cover.webp";
import ledEffects from "../../assets/projects/polsimer-f74led/led-effects.webp";
import settings from "../../assets/projects/polsimer-f74led/settings.webp";

export const polsimerF74led: Project = {
  slug: "polsimer-f74led",
  name: "Polsimer F74LED plugin",
  type: "plugin",
  pitch:
    "Lights the 12 LEDs on the Polsimer F74LED wheel with every SimHub effect: shift lights, flags, pit limiter.",
  summary:
    "The Polsimer F74LED wheel has 12 LEDs, and this plugin lets SimHub drive them. Every effect set up in SimHub's LED Effects Engine shows on the wheel. The plugin runs inside SimHub and talks to the wheel over USB HID, so no other app has to run in the background.",
  meta: "SimHub plugin in C#, talks to the wheel over USB",
  platforms: "SimHub on Windows",
  builtWith: ["C#", ".NET Framework 4.8", "USB HID", "SimHub plugin API"],
  links: {
    github: "https://github.com/kpulka247/polsimer-simhub-plugin",
    releases:
      "https://github.com/kpulka247/polsimer-simhub-plugin/releases/latest",
  },
  githubRepo: "kpulka247/polsimer-simhub-plugin",
  icon: { kind: "leds" },
  cover: {
    device: "window",
    depth: "deep",
    tint: "#f5a524",
    screen: {
      kind: "image",
      image: {
        src: cover,
        alt: "The Polsimer F74LED tab in SimHub with the brightness slider, LED profile and connection status",
      },
    },
  },
  features: [
    {
      name: "Runs inside SimHub",
      text: "The plugin sends LED frames straight to the wheel over USB HID and checks the connection 20 times a second.",
    },
    {
      name: "Every SimHub LED effect",
      text: "Game telemetry, shift lights and flag colours from your SimHub profile light the wheel's 12 LEDs.",
    },
    {
      name: "Real brightness control",
      text: "SimHub's brightness slider and its Day and Night presets set the wheel's own LED brightness.",
    },
    {
      name: "Recovers on re-plug",
      text: "Unplug the wheel or change game, and the effects pick up in sync again.",
    },
  ],
  screenshots: [
    {
      src: ledEffects,
      alt: "Ten SimHub LED effects playing on the F74LED wheel",
      caption: "Ten SimHub effects on the wheel's 12 LEDs.",
    },
    {
      src: settings,
      alt: "The Polsimer F74LED tab in SimHub",
      caption: "The plugin's tab in SimHub.",
    },
  ],
  order: 2,
};
