import type { Cover, ProjectIcon } from "../content/schema";
import "./ProjectCover.css";

const LED_COLOURS = ["#2fd35a", "#ffc21a", "#ff3b30"];

function Mark({ icon }: { icon: ProjectIcon }) {
  if (icon.kind === "image") {
    return <img src={icon.image.src} alt="" width={44} height={44} />;
  }
  return (
    <span className="cover__leds" aria-hidden="true">
      {LED_COLOURS.map((colour) => (
        <i key={colour} style={{ "--led": colour }} />
      ))}
    </span>
  );
}

function Screen({ cover }: { cover: Cover }) {
  const { screen } = cover;
  if (screen.kind === "image") {
    return (
      <img
        src={screen.image.src}
        alt={screen.image.alt}
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <div className="cover__gallery">
      <img
        className="cover__gallery-wordmark"
        src={screen.wordmark.src}
        alt={screen.wordmark.alt}
      />
      <div className="cover__gallery-grid">
        {screen.images.map((image) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}

export function ProjectCover({
  cover,
  icon,
}: {
  cover: Cover;
  icon: ProjectIcon;
}) {
  return (
    <div
      className="cover"
      data-device={cover.device}
      data-depth={cover.depth}
      style={{ "--tint": cover.tint }}
    >
      <div className="cover__mark">
        <Mark icon={icon} />
      </div>
      <div className="cover__device">
        <div className="cover__bar" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="cover__screen">
          <Screen cover={cover} />
        </div>
      </div>
      {cover.front && (
        <div className="cover__front">
          <img
            src={cover.front.src}
            alt={cover.front.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
    </div>
  );
}
