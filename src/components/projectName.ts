import type { CSSProperties } from "react";

// A project's name keeps one view transition name on every page it
// appears on, so moving between pages carries the name across.
export function projectNameTransition(slug: string): CSSProperties {
  return { viewTransitionName: `project-${slug}` };
}
