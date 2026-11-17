import { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { PiSteeringWheelBold } from "react-icons/pi";
import { Link } from "react-router";

import boardDesktop from "../assets/hero/board-desktop.webp";
import boardPhone from "../assets/hero/board-phone.webp";
import { GITHUB_URL, LINKEDIN_URL } from "../data/contact";
import type { PinBoard, RunState } from "../hero/pinBoard";
import { currentTheme, useTheme } from "../theme";

const HINT_MS = 5_000;
// Matches --duration-fast, the pills' fade out.
const FADE_MS = 250;

// Whether a pill in the Play row is still on screen: it stays for its fade
// out after it should hide, then leaves the row.
function useShown(show: boolean): boolean {
  const [leaving, setLeaving] = useState(false);
  const [wasShown, setWasShown] = useState(show);
  if (show !== wasShown) {
    setWasShown(show);
    setLeaving(!show);
  }
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => setLeaving(false), FADE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);
  return show || leaving;
}
const BEST_KEY = "kpulka:best-distance";

function metres(distance: number): string {
  return `${distance.toLocaleString("en-US")} m`;
}

function hasKeyboard(): boolean {
  return matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(best: number) {
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch {
    // Private windows can refuse storage. The best then lasts the visit.
  }
}

function hasWebGL(): boolean {
  const gl = document.createElement("canvas").getContext("webgl2");
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return gl !== null;
}

function prefersStill(): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function afterFirstPaint(callback: () => void): () => void {
  if ("requestIdleCallback" in window) {
    const id = requestIdleCallback(callback, { timeout: 2_000 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(callback, 200);
  return () => clearTimeout(id);
}

// Stays pinned while the sheet scrolls over it. The bottom padding
// includes the 28 px (phone) or 40 px (desktop) that the sheet overlaps.
export function Hero() {
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<PinBoard | null>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [live, setLive] = useState(false);
  const [noWebGL, setNoWebGL] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState<RunState>({ distance: 0, crashed: false });
  const [best, setBest] = useState(0);
  const [keyboard, setKeyboard] = useState(true);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    if (!hasWebGL()) {
      setNoWebGL(true);
      return;
    }
    const still = prefersStill();

    let cancelled = false;
    const cancelIdle = afterFirstPaint(() => {
      void import("../hero/pinBoard").then(({ mount }) => {
        if (cancelled) return;
        boardRef.current = mount(canvas, host, {
          still,
          theme: currentTheme(),
          onReady: () => setLive(true),
          onStop: () => setPlaying(false),
          onRun: setRun,
          onRunStart: () => {
            clearTimeout(hintTimer.current);
            setShowHint(true);
          },
          onFirstInput: () => {
            clearTimeout(hintTimer.current);
            hintTimer.current = setTimeout(() => setShowHint(false), HINT_MS);
          },
          playBottom: () => {
            const name = nameRef.current?.getBoundingClientRect();
            const top = canvas.getBoundingClientRect().top;
            return name ? name.top - top : canvas.clientHeight * 0.55;
          },
          onSlow: () => {
            setPlaying(false);
            setLoaded(false);
          },
        });
        setLoaded(!still);
      });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      clearTimeout(hintTimer.current);
      boardRef.current?.dispose();
      boardRef.current = null;
    };
  }, []);

  const theme = useTheme();
  useEffect(() => {
    boardRef.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    boardRef.current?.setPlaying(playing);
    if (playing) {
      setKeyboard(hasKeyboard());
      setBest(readBest());
    }
  }, [playing]);

  useEffect(() => {
    if (run.distance <= best) return;
    setBest(run.distance);
    saveBest(run.distance);
  }, [run.distance, best]);

  const hint = run.crashed
    ? keyboard
      ? "Crashed. Press W to go again."
      : "Tap to go again"
    : showHint
      ? keyboard
        ? "W A S D to drive. W + S burns out. Esc stops."
        : "Hold to drive"
      : null;
  const hintOn = playing && hint !== null;
  const scoreShown = useShown(playing);
  const hintShown = useShown(hintOn);
  // The hint keeps its last words while it fades out.
  const [lastHint, setLastHint] = useState("");
  if (hint && hint !== lastHint) setLastHint(hint);

  return (
    <section
      ref={hostRef}
      aria-label="Introduction"
      data-surface="ground"
      className={`hero-pin sticky top-0 flex h-svh min-h-[560px] flex-col justify-end overflow-hidden bg-ground px-5 pb-14 text-ink md:px-10 md:pb-22 ${
        playing ? "touch-none select-none [-webkit-touch-callout:none]" : ""
      }`}
      // A long press while driving would open the browser's menu.
      onContextMenu={playing ? (event) => event.preventDefault() : undefined}
    >
      <div className="board-layer absolute inset-0">
        {noWebGL && (
          <picture aria-hidden="true" className="dark:hidden">
            <source media="(min-width: 700px)" srcSet={boardDesktop} />
            <img
              src={boardPhone}
              alt=""
              className="absolute inset-0 size-full object-cover object-bottom"
            />
          </picture>
        )}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          data-live={live || undefined}
          className="board absolute inset-0 size-full"
        />
      </div>

      <div className="pointer-events-none relative">
        {loaded && live && (
          <div className="appear pointer-events-auto relative z-10 mb-4 flex flex-wrap items-center gap-2.5 md:mb-5">
            <button
              type="button"
              aria-pressed={playing}
              onClick={(event) => {
                setPlaying((on) => !on);
                // After a mouse or finger press, give the focus back to the
                // page: the drive keys would otherwise make the browser show
                // its keyboard focus ring on Play. A keyboard press (detail
                // 0) keeps the focus where it is.
                if (event.detail > 0) event.currentTarget.blur();
              }}
              className="btn btn-compact btn-frosted pl-3"
            >
              <PiSteeringWheelBold aria-hidden="true" className="size-5" />
              Play
            </button>
            {scoreShown && (
              <p
                data-hidden={!playing || undefined}
                className="fade pill appear items-baseline pt-3 tabular-nums"
              >
                <span className="font-display text-[19px] leading-none font-extrabold text-ink [font-stretch:108%]">
                  {metres(run.distance)}
                </span>
                <span>Best {metres(Math.max(best, run.distance))}</span>
              </p>
            )}
            {hintShown && (
              // On phones the hint takes its own line above Play, instead of
              // wrapping under it. The empty rest of the line ignores
              // touches, so holding the board there still drives.
              <div className="pointer-events-none max-md:order-first max-md:basis-full">
                <p
                  aria-live="polite"
                  aria-hidden={!hintOn || undefined}
                  data-hidden={!hintOn || undefined}
                  className="fade pill appear pointer-events-auto"
                >
                  {hint ?? lastHint}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-x-5 -top-10 -bottom-14 bg-linear-to-t from-ground from-50% to-ground/0 md:-inset-x-10 md:-top-16 md:-bottom-22"
          />
          <h1
            ref={nameRef}
            className="relative -ml-[0.04em] font-display text-hero leading-[0.82] font-[850] tracking-[-0.02em]"
          >
            Kamil Pułka
          </h1>
          <div className="relative mt-5 flex flex-wrap items-end justify-between gap-6 md:mt-7">
            <div className="max-w-[560px]">
              <p className="text-[17px] leading-[1.4] font-medium md:text-md">
                Full-stack developer. I build and ship web apps, browser
                extensions and mobile apps that people use every day.
              </p>
              <p className="mt-2 text-sm text-ink-dim md:mt-2.5">
                Open to full-time and contract roles, remote-first, based in
                Poland.
              </p>
            </div>
            <div className="pointer-events-auto flex w-full items-center gap-2.5 md:w-auto">
              <Link to="/#work" className="btn btn-solid flex-1 md:flex-none">
                See my work
              </Link>
              <Link
                to="/#contact"
                className="btn btn-tonal flex-1 md:flex-none"
              >
                Get in touch
              </Link>
              <a
                href={GITHUB_URL}
                aria-label="GitHub"
                className="icon-btn max-md:hidden"
              >
                <FaGithub aria-hidden="true" className="size-5" />
              </a>
              <a
                href={LINKEDIN_URL}
                aria-label="LinkedIn"
                className="icon-btn max-md:hidden"
              >
                <FaLinkedin aria-hidden="true" className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
