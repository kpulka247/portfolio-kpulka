import "react";

// Lets style props set CSS custom properties, such as { "--tint": "#ff3d9a" },
// without a cast.
declare module "react" {
  interface CSSProperties {
    [variable: `--${string}`]: string | number | undefined;
  }
}
