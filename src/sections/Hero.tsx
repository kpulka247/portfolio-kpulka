import { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { PiSteeringWheelBold } from "react-icons/pi";

import boardDesktop from "../assets/hero/board-desktop.webp";
import boardPhone from "../assets/hero/board-phone.webp";
import { GITHUB_URL, LINKEDIN_URL } from "../data/contact";
import type { PinBoard, RunState } from "../hero/pinBoard";

// The controls hint stays this long after the first touch of a control.
const HINT_MS = 5_000;
// The best distance stays in this browser only.
const BEST_KEY = "kpulka:best-distance";

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

// The live board needs WebGL 2 and stays off for visitors who ask for less
// motion. The board itself gives up on a device that draws it too slowly.
// Everyone else keeps the still image, which is a capture of the same
// board (scripts/capture-hero.mjs).
function canRunBoard(): boolean {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const gl = document.createElement("canvas").getContext("webgl2");
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return gl !== null;
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
  const playRowRef = useRef<HTMLDivElement>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [live, setLive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState<RunState>({ distance: 0, crashed: false });
  const [best, setBest] = useState(0);
  const [keyboard, setKeyboard] = useState(true);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || !canRunBoard()) return;

    let cancelled = false;
    const cancelIdle = afterFirstPaint(() => {
      void import("../hero/pinBoard").then(({ mount }) => {
        if (cancelled) return;
        boardRef.current = mount(canvas, host, {
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
          playBottom: () => {
            const row = playRowRef.current?.getBoundingClientRect();
            const top = canvas.getBoundingClientRect().top;
            return row ? row.top - top : canvas.clientHeight * 0.5;
          },
          onSlow: () => {
            boardRef.current?.dispose();
            boardRef.current = null;
            setPlaying(false);
            setLive(false);
            setLoaded(false);
          },
        });
        setLoaded(true);
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

  const hint = run.crashed
    ? keyboard
      ? `Crashed at ${run.distance} m. Press W to go again.`
      : `Crashed at ${run.distance} m. Tap the board to go again.`
    : showHint
      ? keyboard
        ? "W to drive, A and D to steer, S to brake or reverse. Escape stops."
        : "Hold the board to drive towards your finger. Tap Play to stop."
      : null;

  return (
    <section
      ref={hostRef}
      aria-label="Introduction"
      className={`sticky top-0 flex h-svh min-h-[560px] flex-col justify-end overflow-hidden bg-ground px-5 pb-14 text-ink md:px-10 md:pb-22 ${
        playing ? "touch-none select-none [-webkit-touch-callout:none]" : ""
      }`}
      // A long press while driving would open the browser's menu.
      onContextMenu={playing ? (event) => event.preventDefault() : undefined}
    >
      <picture aria-hidden="true">
        <source media="(min-width: 700px)" srcSet={boardDesktop} />
        <img
          src={boardPhone}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover object-bottom"
        />
      </picture>
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

      <div className="pointer-events-none relative">
        {loaded && (
          <div
            ref={playRowRef}
            className="pointer-events-auto mb-4 flex flex-wrap items-center gap-x-3.5 gap-y-2 md:mb-5"
          >
            <button
              type="button"
              aria-pressed={playing}
              onClick={() => setPlaying((on) => !on)}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white/70 pr-4 pl-3 text-sm font-semibold shadow-[inset_0_0_0_1px_rgb(27_28_31/0.18)] backdrop-blur-sm transition-colors hover:bg-white aria-pressed:bg-ink aria-pressed:text-ground"
            >
              <PiSteeringWheelBold aria-hidden="true" className="size-5" />
              Play
            </button>
            {playing && (
              <p className="inline-flex items-baseline gap-3 rounded-full bg-white/70 px-3.5 py-1.5 text-sm text-ink-dim tabular-nums backdrop-blur-sm">
                <span className="font-semibold text-ink">{run.distance} m</span>
                <span>Best {Math.max(best, run.distance)} m</span>
              </p>
            )}
            {playing && hint && (
              <p
                aria-live="polite"
                className="rounded-full bg-white/70 px-3 py-1.5 text-sm text-ink-dim backdrop-blur-sm"
              >
                {hint}
              </p>
            )}
          </div>
        )}
        <div>
          <h1 className="-ml-[0.04em] font-display text-hero leading-[0.82] font-[850] tracking-[-0.02em]">
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
