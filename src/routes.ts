import { type RouteConfig, index, route } from "@react-router/dev/routes";

import { projectSlugs } from "./content/projectSlugs";

// Each project gets its own static route instead of one "projects/:slug".
// GitHub Pages answers an unknown path with 404.html, which is rendered for
// the "*" route. A dynamic route would match an unknown slug in the browser
// and fail to hydrate that page.
export default [
  index("pages/MainPage.tsx"),
  ...projectSlugs().map((slug) =>
    route(`projects/${slug}`, "pages/ProjectPage.tsx", {
      id: `project-${slug}`,
    }),
  ),
  route("projects/do-nothing/privacy", "pages/DoNothingPrivacy.tsx"),
  route("privacy", "pages/PrivacyPolicy.tsx"),
  route("*", "pages/NotFound.tsx"),
] satisfies RouteConfig;
