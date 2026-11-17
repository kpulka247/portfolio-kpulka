import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src",
  buildDirectory: "dist",
  ssr: false,
  // Every route without a parameter, which includes each project page, plus
  // the 404 page that scripts/copy-404.js turns into 404.html.
  prerender: ({ getStaticPaths }) => [...getStaticPaths(), "/404"],
} satisfies Config;
