"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type CopyAppLinkButtonProps = {
  url: string;
};

export function CopyAppLinkButton({ url }: CopyAppLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleCopy}
      className="mt-3 h-12 w-full rounded-xl text-base"
    >
      {copied ? "Link copied" : "Copy link to clipboard"}
    </Button>
  );
}
