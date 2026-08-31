"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { Button } from "@/components/ui/button";

const APP_URL = "https://gng-get-food-app.vercel.app";

type Platform = "ios" | "android" | "other";

type BrowserState = {
  platform: Platform;
  /** True when this browser can complete a real home-screen install. */
  canInstallHere: boolean;
  standalone: boolean;
  label: string;
};

function detectBrowser(): BrowserState {
  const ua = navigator.userAgent || "";
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  // Chrome / Edge / Firefox / Opera on iOS — cannot Add to Home Screen as a real PWA.
  const isIosAltBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Firefox|Edg/i.test(ua);
  // Common in-app browsers (Gmail, Instagram, Facebook, etc.).
  const isInApp =
    /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp|MicroMessenger|Snapchat|GSA\//i.test(
      ua
    ) ||
    // iOS WebViews often omit "Safari" while still including AppleWebKit.
    (isIos && /AppleWebKit/i.test(ua) && !/Safari/i.test(ua));

  const isIosSafari = isIos && /Safari/i.test(ua) && !isIosAltBrowser && !isInApp;
  const isAndroidChrome =
    isAndroid &&
    /Chrome/i.test(ua) &&
    !/EdgA|OPR|SamsungBrowser|FVChrome/i.test(ua) &&
    !isInApp;

  if (isIos) {
    return {
      platform: "ios",
      canInstallHere: isIosSafari && !standalone,
      standalone,
      label: isIosSafari
        ? "Safari on iPhone"
        : isInApp
          ? "an email or social app browser"
          : "a browser that is not Safari",
    };
  }

  if (isAndroid) {
    return {
      platform: "android",
      canInstallHere: isAndroidChrome && !standalone,
      standalone,
      label: isAndroidChrome
        ? "Chrome on Android"
        : isInApp
          ? "an email or social app browser"
          : "a browser that is not Chrome",
    };
  }

  return {
    platform: "other",
    canInstallHere: false,
    standalone,
    label: "this device",
  };
}

type StepImage = { src: string; alt: string; width: number; height: number };

function Step({
  n,
  children,
  images,
}: {
  n: number;
  children: ReactNode;
  images?: StepImage[];
}) {
  return (
    <li className="flex gap-4">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-green)] text-base font-semibold text-white"
        aria-hidden
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 pt-1 text-lg leading-relaxed text-foreground/90">
        {children}
        {images?.length ? (
          <div className="mt-3 flex flex-col gap-3">
            {images.map((image) => (
              <figure
                key={image.src}
                className="max-w-sm overflow-hidden rounded-lg border bg-background shadow-sm"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="h-auto w-full"
                  sizes="(max-width: 384px) 100vw, 384px"
                />
              </figure>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleCopy}
      className="h-12 w-full rounded-xl text-base"
    >
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}

function WrongBrowserWall({
  platform,
  label,
}: {
  platform: Platform;
  label: string;
}) {
  const need = platform === "android" ? "Chrome" : "Safari";
  const needHint =
    platform === "android"
      ? "the Chrome app on your phone"
      : "Safari (the blue compass icon)";

  return (
    <section className="rounded-2xl border border-border bg-background/90 px-5 py-6 shadow-sm">
      <p className="text-sm font-medium tracking-wide text-muted-foreground">
        Almost there
      </p>
      <h2 className="mt-2 font-heading text-2xl leading-tight">
        Open this page in {need}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        It looks like you&apos;re viewing this in {label}. To put Get Food on
        your Home Screen, please open it in {needHint} instead — email apps
        don&apos;t show the install option.
      </p>

      <ol className="mt-5 space-y-2.5 text-base leading-relaxed text-foreground/90">
        <li>
          <span className="font-medium">1.</span> Tap Copy link below.
        </li>
        <li>
          <span className="font-medium">2.</span> Open {need} on your phone.
        </li>
        <li>
          <span className="font-medium">3.</span> Paste the link in the address bar
          and go.
        </li>
        <li>
          <span className="font-medium">4.</span> Come back to these steps — they&apos;ll
          be ready for you.
        </li>
      </ol>

      <div className="mt-5 space-y-3">
        <CopyLinkButton url={APP_URL} />
        <p className="break-all text-center text-sm text-muted-foreground">
          {APP_URL}
        </p>
      </div>
    </section>
  );
}

function IosSteps() {
  return (
    <ol className="space-y-8">
      <Step
        n={1}
        images={[
          {
            src: "/install/ios/01-menu.jpeg",
            alt: "Safari address bar with the more options button circled in red",
            width: 473,
            height: 126,
          },
          {
            src: "/install/ios/02-share.jpeg",
            alt: "Safari menu with the Share option circled in red",
            width: 312,
            height: 413,
          },
        ]}
      >
        Tap the <span className="font-medium">···</span> button, then tap{" "}
        <span className="font-medium">Share</span> — the square with an arrow
        pointing up.
        <span className="mt-1 block text-base text-muted-foreground">
          On some iPhones, Share is already in the toolbar at the bottom.
        </span>
      </Step>
      <Step
        n={2}
        images={[
          {
            src: "/install/ios/03-view-more.jpeg",
            alt: "Share sheet with View More circled in red",
            width: 1024,
            height: 384,
          },
          {
            src: "/install/ios/04-add-to-home.jpeg",
            alt: "Share sheet with Add to Home Screen circled in red",
            width: 446,
            height: 325,
          },
        ]}
      >
        Scroll and tap <span className="font-medium">Add to Home Screen</span>.
        <span className="mt-1 block text-base text-muted-foreground">
          Don&apos;t see it? Tap{" "}
          <span className="font-medium text-foreground">View More</span> first,
          then look again.
        </span>
      </Step>
      <Step
        n={3}
        images={[
          {
            src: "/install/ios/05-confirm-add.jpeg",
            alt: "Add to Home Screen screen with the blue Add button in the top right",
            width: 1024,
            height: 961,
          },
        ]}
      >
        Leave the name as <span className="font-medium">Get Food</span>, then tap{" "}
        <span className="font-medium">Add</span> (top right).
        <span className="mt-1 block text-base text-muted-foreground">
          Keep <span className="font-medium text-foreground">Open as Web App</span>{" "}
          on if you see that switch.
        </span>
      </Step>
      <Step n={4}>
        Go to your Home Screen and open the{" "}
        <span className="font-medium">Get Food</span> icon. Sign in with your GNG
        email.
      </Step>
    </ol>
  );
}

function AndroidSteps() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-background/90 px-4 py-4">
        <p className="mb-3 text-base text-muted-foreground">
          If you see an install button, you can use that:
        </p>
        <InstallAppButton />
        <p className="mt-3 text-sm text-muted-foreground">
          Otherwise, follow the steps below.
        </p>
      </div>

      <ol className="space-y-5">
        <Step n={1}>
          Tap the <span className="font-medium">three dots</span> in Chrome’s top
          right corner.
        </Step>
        <Step n={2}>
          Tap <span className="font-medium">Install app</span>, then{" "}
          <span className="font-medium">Install</span>.
          <span className="mt-1 block text-base text-muted-foreground">
            Prefer Install app — not “Add to Home screen” (that leaves a Chrome
            badge on the icon).
          </span>
        </Step>
        <Step n={3}>
          Open <span className="font-medium">Get Food</span> from your Home Screen
          and sign in with your GNG email.
        </Step>
      </ol>
    </div>
  );
}

export function InstallGuide() {
  const [browser, setBrowser] = useState<BrowserState | null>(null);
  const [manual, setManual] = useState<"ios" | "android" | null>(null);

  useEffect(() => {
    setBrowser(detectBrowser());
  }, []);

  const platform = manual ?? browser?.platform ?? "other";
  const showWrongBrowser =
    browser && !browser.standalone && !browser.canInstallHere && !manual;

  return (
    <div className="mx-auto max-w-xl px-5 pb-16 pt-10 sm:px-6">
      <BrandLogo size={72} />

      <header className="mt-8 space-y-3">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Good Neighbor Gardens · San Diego
        </p>
        <h1 className="font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
          Add Get Food to your phone
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          It isn&apos;t in the App Store or Google Play — you save it once to
          your Home Screen, then open it like any other app.
        </p>
      </header>

      {browser?.standalone ? (
        <section className="mt-8 rounded-2xl border bg-background/80 px-5 py-5 shadow-sm">
          <h2 className="font-heading text-xl">Ready to go</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Get Food is already on this phone. Sign in with the email you use for
            Good Neighbor Gardens.
          </p>
          <Button asChild className="mt-5 h-14 w-full rounded-2xl text-lg">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </section>
      ) : null}

      {showWrongBrowser && browser ? (
        <div className="mt-8">
          <WrongBrowserWall platform={browser.platform} label={browser.label} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already in the right browser?{" "}
            <button
              type="button"
              className="text-foreground underline underline-offset-4"
              onClick={() =>
                setManual(browser.platform === "android" ? "android" : "ios")
              }
            >
              Show the steps here
            </button>
          </p>
        </div>
      ) : null}

      {!browser?.standalone && (!showWrongBrowser || manual) ? (
        <div className="mt-8 space-y-6">
          {browser?.canInstallHere ? (
            <p className="text-base text-muted-foreground">
              You&apos;re all set to continue below — this page is already open in
              the right browser.
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant={platform === "ios" ? "default" : "outline"}
              className="h-12 flex-1 rounded-xl"
              onClick={() => setManual("ios")}
            >
              iPhone
            </Button>
            <Button
              type="button"
              variant={platform === "android" ? "default" : "outline"}
              className="h-12 flex-1 rounded-xl"
              onClick={() => setManual("android")}
            >
              Android
            </Button>
          </div>

          <section className="rounded-2xl border bg-background/80 px-5 py-5 shadow-sm">
            <h2 className="font-heading text-2xl leading-tight">
              {platform === "android"
                ? "Install on Android"
                : "Install on iPhone"}
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              {platform === "android"
                ? "A few taps in Chrome, then you’re done."
                : "A few taps in Safari, then you’re done."}
            </p>
            <div className="mt-6">
              {platform === "android" ? <AndroidSteps /> : <IosSteps />}
            </div>
          </section>
        </div>
      ) : null}

      {!browser?.standalone ? (
        <section className="mt-10 rounded-2xl border bg-background/80 px-5 py-5 shadow-sm">
          <h2 className="font-heading text-xl">After it’s installed</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-lg leading-relaxed text-foreground/90">
            <li>Open Get Food from your Home Screen (not from email).</li>
            <li>Sign in with your Good Neighbor Gardens email.</li>
            <li>Allow notifications so harvest reminders reach you.</li>
          </ol>
          <Button asChild variant="secondary" className="mt-5 h-12 w-full rounded-xl">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </section>
      ) : null}

      <p className="mt-8 text-base leading-relaxed text-muted-foreground">
        Stuck? Ask a family member for help, or text GNG. You only do this once.
      </p>
    </div>
  );
}
