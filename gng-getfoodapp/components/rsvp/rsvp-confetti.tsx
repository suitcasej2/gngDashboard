"use client";

import { useEffect, useRef } from "react";

const PALETTE = [
  "#f0c14a",
  "#ffd54f",
  "#7cb342",
  "#fff9c4",
  "#ff8f45",
  "#558b2f",
  "#fffef7",
  "#aed581",
];

export function RsvpConfetti({ enabled }: { enabled: boolean }) {
  const ran = useRef(false);

  useEffect(() => {
    if (!enabled || ran.current) return;
    ran.current = true;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let cancelled = false;

    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;

      const burst = (opts: Parameters<typeof confetti>[0]) => {
        confetti({
          ticks: 320,
          gravity: 1,
          decay: 0.91,
          scalar: 1.05,
          colors: PALETTE,
          ...opts,
        });
      };

      burst({
        particleCount: 65,
        spread: 52,
        startVelocity: 42,
        angle: 62,
        origin: { x: 0.08, y: 0.58 },
      });
      burst({
        particleCount: 65,
        spread: 52,
        startVelocity: 42,
        angle: 118,
        origin: { x: 0.92, y: 0.58 },
      });

      window.setTimeout(() => {
        if (cancelled) return;
        burst({
          particleCount: 95,
          spread: 100,
          startVelocity: 32,
          origin: { x: 0.5, y: 0.38 },
          shapes: ["circle", "square"],
        });
      }, 180);

      window.setTimeout(() => {
        if (cancelled) return;
        const end = Date.now() + 2000;
        const tick = () => {
          if (cancelled || Date.now() >= end) return;
          burst({
            particleCount: 4,
            spread: 70,
            startVelocity: 22,
            angle: 55 + Math.random() * 15,
            origin: { x: 0.02 + Math.random() * 0.06, y: 0.55 + Math.random() * 0.12 },
            shapes: ["circle"],
          });
          burst({
            particleCount: 4,
            spread: 70,
            startVelocity: 22,
            angle: 110 + Math.random() * 15,
            origin: { x: 0.92 + Math.random() * 0.06, y: 0.55 + Math.random() * 0.12 },
            shapes: ["circle"],
          });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 350);

      window.setTimeout(() => {
        if (cancelled) return;
        burst({
          particleCount: 150,
          spread: 360,
          startVelocity: 26,
          origin: { x: 0.5, y: 0.48 },
          shapes: ["circle"],
          scalar: 0.9,
        });
      }, 850);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return null;
}
