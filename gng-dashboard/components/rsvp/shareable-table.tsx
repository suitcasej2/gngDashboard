"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";

function toCsv(rows: Record<string, string | null | undefined>[], columns: string[]) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = columns.map(escape).join(",");
  const lines = rows.map((r) => columns.map((c) => escape(String(r[c] ?? ""))).join(","));
  return [header, ...lines].join("\n");
}

async function shareOrDownloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const file = new File([blob], filename, { type: blob.type });

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  const canShareFiles = typeof nav.canShare === "function" && nav.canShare({ files: [file] });

  if (typeof navigator.share === "function" && canShareFiles) {
    await navigator.share({ files: [file], title: filename });
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ShareCsvButton(props: {
  filename: string;
  columns: string[];
  rows: Record<string, string | null | undefined>[];
}) {
  const csv = useMemo(() => toCsv(props.rows, props.columns), [props.rows, props.columns]);

  return (
    <Button
      type="button"
      variant="secondary"
      className="h-11 w-full sm:w-auto"
      onClick={() => shareOrDownloadCsv(props.filename, csv)}
    >
      Share CSV
    </Button>
  );
}

