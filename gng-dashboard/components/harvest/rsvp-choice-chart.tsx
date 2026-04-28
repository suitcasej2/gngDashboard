import type { RsvpChoiceCount } from "@/lib/live-harvest-rsvp-stats";

function normalizeChoice(choice: string) {
  return choice.trim().toLowerCase();
}

function colorForChoice(choice: string) {
  // CEO mapping:
  // donate=brown, receive=green, gift=yellow, bank=purple, redeem=light purple
  const c = normalizeChoice(choice);
  if (c === "donate") return "#381810"; // brown
  if (c === "receive") return "#56BB55"; // green
  if (c === "gift") return "#FFF904"; // yellow
  if (c === "bank") return "#BC32A3"; // purple
  if (c === "redeem") return "color-mix(in oklab, #BC32A3, white 40%)"; // light purple
  return "color-mix(in oklab, #381810, white 35%)"; // fallback
}

function formatPct(n: number) {
  return `${Math.round(n)}%`;
}

export function RsvpChoiceChart({ data }: { data: RsvpChoiceCount[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const ordered = [...data].sort((a, b) => {
    // Put the known choices in a consistent order.
    const order = ["receive", "gift", "donate", "bank", "redeem"];
    const ai = order.indexOf(normalizeChoice(a.choice));
    const bi = order.indexOf(normalizeChoice(b.choice));
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.choice.localeCompare(b.choice);
  });

  // Donut chart via SVG strokes.
  const size = 220;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const segments = ordered.reduce(
    (acc, d) => {
      const fraction = total > 0 ? d.count / total : 0;
      const dash = fraction * c;
      const dasharray = `${dash} ${c - dash}`;
      const dashoffset = -acc.offset;
      return {
        offset: acc.offset + dash,
        segments: [
          ...acc.segments,
          {
            choice: d.choice,
            count: d.count,
            dasharray,
            dashoffset,
            stroke: colorForChoice(d.choice),
          },
        ],
      };
    },
    {
      offset: 0,
      segments: [] as {
        choice: string;
        count: number;
        dasharray: string;
        dashoffset: number;
        stroke: string;
      }[],
    },
  ).segments;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted-foreground">Total RSVPs</p>
        <p className="text-2xl font-semibold tabular-nums">{total}</p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No RSVP data.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[260px_1fr] sm:items-center">
            <div className="mx-auto w-fit">
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                role="img"
                aria-label="RSVP Choice donut chart"
              >
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke="oklch(0.92 0 0 / 35%)"
                  strokeWidth={stroke}
                />
                {segments.map((s) => (
                  <circle
                    key={s.choice}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={s.stroke}
                    strokeWidth={stroke}
                    strokeLinecap="butt"
                    strokeDasharray={s.dasharray}
                    strokeDashoffset={s.dashoffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  />
                ))}

                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground"
                >
                  <tspan className="text-2xl font-semibold tabular-nums">{total}</tspan>
                  <tspan x="50%" dy="1.25em" className="text-xs fill-muted-foreground">
                    RSVPs
                  </tspan>
                </text>
              </svg>
            </div>

            <div className="space-y-2">
              <div className="grid gap-2">
                {ordered.map((d) => {
                  const pct = total > 0 ? (d.count / total) * 100 : 0;
                  return (
                    <div
                      key={d.choice}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-background/40 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="inline-block size-3 rounded-sm"
                          style={{ backgroundColor: colorForChoice(d.choice) }}
                          aria-hidden
                        />
                        <span className="truncate text-sm font-medium">{d.choice}</span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm tabular-nums text-muted-foreground">{formatPct(pct)}</span>
                        <span className="text-sm font-semibold tabular-nums">{d.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
