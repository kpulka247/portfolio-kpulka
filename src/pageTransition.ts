// Tells the page transition which way a click goes: to the home page is
// "back" (the current page drops away), anywhere else is "forward" (the new
// page rises over this one). It listens in the capture phase, so the
// attribute is set before React Router starts the transition.
export function trackNavDirection(): () => void {
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest?.("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;
    if (link.origin !== location.origin) return;
    document.documentElement.dataset.nav =
      link.pathname === "/" ? "back" : "forward";
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
