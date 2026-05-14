import type { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { PWA_SPLASH_BACKGROUND } from "@/lib/pwa-splash";

const PRESETS: Record<string, readonly [number, number]> = {
  "1290-2796": [1290, 2796],
  "1284-2778": [1284, 2778],
  "1179-2556": [1179, 2556],
  "1170-2532": [1170, 2532],
  "1242-2688": [1242, 2688],
  "828-1792": [828, 1792],
  "1125-2436": [1125, 2436],
  "750-1334": [750, 1334],
};

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const preset = req.nextUrl.searchParams.get("preset") ?? "1170-2532";
  const dims = PRESETS[preset] ?? PRESETS["1170-2532"]!;
  const [width, height] = dims;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: PWA_SPLASH_BACKGROUND,
        }}
      />
    ),
    { width, height },
  );
}
