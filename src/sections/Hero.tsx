import { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { PiSteeringWheelBold } from "react-icons/pi";

import boardDesktop from "../assets/hero/board-desktop.webp";
import boardPhone from "../assets/hero/board-phone.webp";
import { GITHUB_URL, LINKEDIN_URL } from "../data/contact";
import type { PinBoard } from "../hero/pinBoard";

// The name's width axis follows the car: 90 when it stands, up to 145 at
// full speed.
const NARROW = 90;
const WIDE = 145;

interface StretchRange {
  min: number;
  max: number;
}

// The widest the name can get without a line wrapping, and the narrowest
// it can get without two lines joining. The axis does not widen the glyphs
// in proportion, so this tries widths on the element itself. It runs in one
// task, so the visitor never sees the tries.
function stretchRange(name: HTMLElement): StretchRange {
  const words = [...name.querySelectorAll("span")];
  const layout = () => words.map((word) => word.offsetTop).join();
  const fits = (stretch: number, lines: string) => {
    name.style.fontStretch = `${stretch}%`;
    return layout() === lines && name.scrollWidth <= name.clientWidth;
  };

  const transition = name.style.transition;
  name.style.transition = "none";
  name.style.fontStretch = "100%";
  const lines = layout();

  let max = 100;
  if (fits(WIDE, lines)) {
    max = WIDE;
  } else {
    let tooWide = WIDE;
    while (tooWide - max > 1) {
      const middle = (max + tooWide) / 2;
      if (fits(middle, lines)) max = middle;
      else tooWide = middle;
    }
  }
  const min = fits(NARROW, lines) ? NARROW : 100;

  name.style.removeProperty("font-stretch");
  name.style.transition = transition;
  return { min, max };
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
  const nameRef = useRef<HTMLHeadingElement>(null);
  const boardRef = useRef<PinBoard | null>(null);
  const rangeRef = useRef<StretchRange>({ min: NARROW, max: WIDE });
  const [loaded, setLoaded] = useState(false);
  const [live, setLive] = useState(false);
  const [playing, setPlaying] = useState(false);

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
          onSpeed: (speed) => {
            const { min, max } = rangeRef.current;
            nameRef.current?.style.setProperty(
              "font-stretch",
              `${min + (max - min) * speed}%`,
            );
          },
          onStop: () => setPlaying(false),
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
      boardRef.current?.dispose();
      boardRef.current = null;
    };
  }, []);

  useEffect(() => {
    const name = nameRef.current;
    if (playing && name) rangeRef.current = stretchRange(name);
    boardRef.current?.setPlaying(playing);
    if (!playing) name?.style.removeProperty("font-stretch");
  }, [playing]);

  return (
    <section
      ref={hostRef}
      aria-label="Introduction"
      className={`sticky top-0 flex h-svh min-h-[560px] flex-col justify-end overflow-hidden bg-ground px-5 pb-14 text-ink md:px-10 md:pb-22 ${
        playing ? "touch-none" : ""
      }`}
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
          <div className="pointer-events-auto mb-4 flex flex-wrap items-center gap-x-3.5 gap-y-2 md:mb-5">
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
              <p className="rounded-full bg-white/70 px-3 py-1.5 text-sm text-ink-dim backdrop-blur-sm">
                Drive with W A S D or the arrow keys, or hold on the board.
                Escape stops.
              </p>
            )}
          </div>
        )}
        <h1
          ref={nameRef}
          className="-ml-[0.04em] font-display text-hero leading-[0.82] font-[850] tracking-[-0.02em] transition-[font-stretch] duration-500"
        >
          {/* Two spans, so stretchRange can measure each word. */}
          <span>Kamil</span> <span>Pułka</span>
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
    </section>
  );
}
