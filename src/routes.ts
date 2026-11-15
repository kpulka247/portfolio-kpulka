import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/MainPage.tsx"),
  route("privacy", "pages/PrivacyPolicy.tsx"),
  route("*", "pages/NotFound.tsx"),
] satisfies RouteConfig;
