import { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { PiSteeringWheelBold } from "react-icons/pi";

import boardDesktop from "../assets/hero/board-desktop.webp";
import boardPhone from "../assets/hero/board-phone.webp";
import { GITHUB_URL, LINKEDIN_URL } from "../data/contact";
import type { PinBoard, RunState } from "../hero/pinBoard";
import { currentTheme, useTheme } from "../theme";

// The controls hint stays this long after the first touch of a control.
const HINT_MS = 5_000;
// The best distance stays in this browser only.
const BEST_KEY = "kpulka:best-distance";

// How long the score and hint take to fade in and out.
const FADE_MS = 300;

// Keeps an element mounted while it fades out, and lets it fade in a frame
// after it mounts, so CSS can animate both ways.
function usePresence(show: boolean) {
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    if (show) {
      setMounted(true);
      const frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), FADE_MS);
    return () => clearTimeout(timer);
  }, [show]);
  return { mounted, visible };
}

const PILL =
  "rounded-full bg-white/70 py-1.5 text-sm whitespace-nowrap text-ink-dim shadow-[inset_0_0_0_1px_var(--color-edge)] backdrop-blur-sm transition-[opacity,translate] duration-300 ease-out dark:bg-ground/70";

// A finger has no keys, so touch screens get their own words.
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

// The board needs WebGL 2. Without it, the hero shows a capture of the
// board instead (scripts/capture-hero.mjs). The capture is cropped
// differently on every screen, so it is only for those visitors: everyone
// else sees the real board fade in.
function hasWebGL(): boolean {
  const gl = document.createElement("canvas").getContext("webgl2");
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return gl !== null;
}

// Visitors who prefer less motion get one still frame of the real board.
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

// Stays pinned while the black sheet scrolls over it. The bottom padding
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
          // Each run shows the hint again, until 5 s after its first input.
          onRunStart: () => {
            clearTimeout(hintTimer.current);
            setShowHint(true);
          },
          onFirstInput: () => {
            clearTimeout(hintTimer.current);
            hintTimer.current = setTimeout(() => setShowHint(false), HINT_MS);
          },
          // The SUV drives down to the top of the name, behind the Play row.
          playBottom: () => {
            const name = nameRef.current?.getBoundingClientRect();
            const top = canvas.getBoundingClientRect().top;
            return name ? name.top - top : canvas.clientHeight * 0.55;
          },
          // Too slow to animate: the board keeps its last frame, and the
          // game goes away.
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

  // The board fades between day and night with the page.
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

  // A new best is kept as soon as it happens, so a closed tab keeps it.
  useEffect(() => {
    if (run.distance <= best) return;
    setBest(run.distance);
    saveBest(run.distance);
  }, [run.distance, best]);

  // Short enough to sit on one line next to Play, so nothing moves when
  // they come and go.
  const hint = run.crashed
    ? keyboard
      ? "Crashed. Press W to go again."
      : "Tap to go again"
    : showHint
      ? keyboard
        ? "W A S D to drive. Escape stops."
        : "Hold to drive"
      : null;
  // The last hint stays on screen while it fades out.
  const [lastHint, setLastHint] = useState("");
  useEffect(() => {
    if (hint) setLastHint(hint);
  }, [hint]);
  const score = usePresence(playing);
  const hintPresence = usePresence(playing && hint !== null);
  const fade = (visible: boolean) =>
    visible ? "opacity-100" : "-translate-x-1 opacity-0";
  const scoreFade = score.visible ? "opacity-100" : "-translate-y-1 opacity-0";

  return (
    <section
      ref={hostRef}
      aria-label="Introduction"
      className={`hero-pin sticky top-0 flex h-svh min-h-[560px] flex-col justify-end overflow-hidden bg-ground px-5 pb-14 text-ink md:px-10 md:pb-22 ${
        playing ? "touch-none select-none [-webkit-touch-callout:none]" : ""
      }`}
      // A long press while driving would open the browser's menu.
      onContextMenu={playing ? (event) => event.preventDefault() : undefined}
    >
      {noWebGL && (
        // A capture of the board by day, so it is left out at night.
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
        className={`absolute inset-0 size-full transition-opacity duration-700 ${
          live ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-linear-to-t from-ground from-38% to-ground/0"
      />

      {/* The score sits under the site name, out of the way of the board. */}
      {score.mounted && (
        <p
          className={`pointer-events-none absolute top-15 left-5 text-ink tabular-nums transition-[opacity,translate] duration-300 ease-out md:top-19 md:left-10 ${scoreFade}`}
        >
          <span className="block font-display text-[28px] leading-none font-extrabold [font-stretch:108%]">
            {run.distance} m
          </span>
          <span className="mt-1 block text-sm text-ink-dim">
            Best {Math.max(best, run.distance)} m
          </span>
        </p>
      )}

      <div className="pointer-events-none relative">
        {loaded && (
          <div className="pointer-events-auto mb-4 flex flex-wrap items-center gap-x-3.5 gap-y-2 md:mb-5">
            <button
              type="button"
              aria-pressed={playing}
              onClick={() => setPlaying((on) => !on)}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white/70 pr-4 pl-3 text-sm font-semibold shadow-[inset_0_0_0_1px_var(--color-edge)] backdrop-blur-sm transition-colors hover:bg-white aria-pressed:bg-ink aria-pressed:text-ground dark:bg-ground/70 dark:hover:bg-ground dark:aria-pressed:bg-ink"
            >
              <PiSteeringWheelBold aria-hidden="true" className="size-5" />
              Play
            </button>
            {hintPresence.mounted && (
              <p
                aria-live="polite"
                className={`${PILL} px-3 ${fade(hintPresence.visible)}`}
              >
                {hint ?? lastHint}
              </p>
            )}
          </div>
        )}
        <div>
          <h1
            ref={nameRef}
            className="-ml-[0.04em] font-display text-hero leading-[0.82] font-[850] tracking-[-0.02em]"
          >
            Kamil Pułka
          </h1>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6 md:mt-7">
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
              <a
                href="#work"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-ink px-5.5 text-[15px] font-semibold text-ground transition-colors hover:bg-sheet md:flex-none"
              >
                See my work
              </a>
              <a
                href="#contact"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full px-5.5 text-[15px] font-semibold shadow-[inset_0_0_0_1.5px_var(--color-ink)] transition-colors hover:bg-ink/5 md:flex-none"
              >
                Get in touch
              </a>
              <a
                href={GITHUB_URL}
                aria-label="GitHub"
                className="hidden size-11 items-center justify-center rounded-full transition-colors hover:bg-ink/10 md:inline-flex"
              >
                <FaGithub aria-hidden="true" className="size-6" />
              </a>
              <a
                href={LINKEDIN_URL}
                aria-label="LinkedIn"
                className="hidden size-11 items-center justify-center rounded-full transition-colors hover:bg-ink/10 md:inline-flex"
              >
                <FaLinkedin aria-hidden="true" className="size-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
