import { useViewTransitionState } from "react-router";

// A project's name, which flies between its card, its page heading and the
// "Next project" link when the page changes. Only the project being entered
// or left takes part, so no other name crosses the screen. The span is an
// inline block: a name that wraps onto two lines is still one box to move.
export function ProjectName({
  slug,
  name,
  size,
}: {
  slug: string;
  name: string;
  size: "small" | "large";
}) {
  const flying = useViewTransitionState(`/projects/${slug}`);
  return (
    <span
      className={`inline-block ${size === "large" ? "name-large" : "name-small"}`}
      style={flying ? { viewTransitionName: `project-${slug}` } : undefined}
    >
      {name}
    </span>
  );
}
