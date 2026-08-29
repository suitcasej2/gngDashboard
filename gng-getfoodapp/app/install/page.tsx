import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { CopyAppLinkButton } from "@/components/pwa/copy-app-link-button";

export const metadata: Metadata = {
  title: "How to install Get Food — Good Neighbor Gardens",
  description:
    "Simple steps to put the GNG Get Food app on your iPhone or Android phone.",
};

const APP_URL = "https://gng-get-food-app.vercel.app";

function Step({
  n,
  children,
  image,
}: {
  n: number;
  children: ReactNode;
  image?: { src: string; alt: string; width: number; height: number };
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
        {image ? (
          <figure className="mt-3 max-w-[200px] overflow-hidden rounded-lg border bg-background shadow-sm">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="h-auto w-full"
              sizes="200px"
            />
          </figure>
        ) : null}
      </div>
    </li>
  );
}

function InstallAccordion({
  label,
  title,
  hint,
  children,
}: {
  label: string;
  title: string;
  hint: ReactNode;
  children: ReactNode;
}) {
  return (
    <details className="group overflow-hidden rounded-2xl border bg-background/80 shadow-sm open:shadow-md">
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <h2 className="mt-1 font-heading text-2xl leading-tight">{title}</h2>
          <p className="mt-2 text-base text-muted-foreground">{hint}</p>
        </div>
        <ChevronDown
          className="size-6 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t px-5 pb-6 pt-5">{children}</div>
    </details>
  );
}

export default function InstallGuidePage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(1100px_circle_at_15%_-5%,theme(colors.primary/14),transparent_45%),radial-gradient(800px_circle_at_100%_0%,theme(colors.accent/35),transparent_40%)]">
      <div className="mx-auto max-w-xl px-5 pb-16 pt-10 sm:px-6">
        <BrandLogo size={72} />

        <header className="mt-8 space-y-3">
          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            Good Neighbor Gardens · San Diego
          </p>
          <h1 className="font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
            How to put Get Food on your phone
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            This is a free app for Good Neighbor Harvest Subscribers. It is{" "}
            <span className="font-medium text-foreground">not</span> in the App
            Store or Google Play. You open a website once, then save it to your
            home screen like any other app.
          </p>
        </header>

        <p className="mt-10 text-base font-medium text-foreground">
          Tap your phone type below:
        </p>

        <div className="mt-4 space-y-4">
          <InstallAccordion
            label="iPhone"
            title="Install on an iPhone"
            hint={
              <>
                Please use the{" "}
                <span className="font-medium text-foreground">Safari</span>{" "}
                browser (the blue compass icon).
              </>
            }
          >
            <ol className="space-y-8">
              <Step n={1}>
                Open <span className="font-medium">Safari</span>.
              </Step>
              <Step n={2}>
                Copy the app link, then paste it into the Safari address bar and
                tap Go.
                <CopyAppLinkButton url={APP_URL} />
              </Step>
              <Step
                n={3}
                image={{
                  src: "/install/ios/01-menu.png",
                  alt: "Safari bottom bar with the three-dot menu button circled in red",
                  width: 473,
                  height: 1024,
                }}
              >
                Tap the <span className="font-medium">three dots</span> (
                <span aria-hidden>···</span>) on the right side of the bar at the
                bottom of the screen.
              </Step>
              <Step
                n={4}
                image={{
                  src: "/install/ios/02-share.png",
                  alt: "Safari menu with the Share option circled in red",
                  width: 473,
                  height: 1024,
                }}
              >
                Tap <span className="font-medium">Share</span>.
                <span className="mt-1 block text-base text-muted-foreground">
                  It has a square with an arrow pointing up.
                </span>
              </Step>
              <Step
                n={5}
                image={{
                  src: "/install/ios/03-view-more.png",
                  alt: "Share sheet row with View More circled in red",
                  width: 1024,
                  height: 384,
                }}
              >
                Swipe the row of icons and tap{" "}
                <span className="font-medium">View More</span> if you see it.
                <span className="mt-1 block text-base text-muted-foreground">
                  This shows more options in the list below.
                </span>
              </Step>
              <Step
                n={6}
                image={{
                  src: "/install/ios/04-add-to-home.png",
                  alt: "Share sheet with Add to Home Screen circled in red",
                  width: 473,
                  height: 1024,
                }}
              >
                Scroll down in the list and tap{" "}
                <span className="font-medium">Add to Home Screen</span>.
              </Step>
              <Step
                n={7}
                image={{
                  src: "/install/ios/05-confirm-add.png",
                  alt: "Add to Home Screen screen with the blue Add button in the top right",
                  width: 1024,
                  height: 961,
                }}
              >
                Leave the name as <span className="font-medium">Get Food</span>,
                then tap <span className="font-medium">Add</span> in the top
                right.
                <span className="mt-1 block text-base text-muted-foreground">
                  Keep{" "}
                  <span className="font-medium text-foreground">
                    Open as Web App
                  </span>{" "}
                  turned on if you see that switch.
                </span>
              </Step>
              <Step n={8}>
                Look on your Home Screen for the{" "}
                <span className="font-medium">Get Food</span> icon. Tap it any
                time to open the app.
              </Step>
            </ol>
          </InstallAccordion>

          <InstallAccordion
            label="Android"
            title="Install on an Android phone"
            hint={
              <>
                Please use the{" "}
                <span className="font-medium text-foreground">Chrome</span>{" "}
                browser.
              </>
            }
          >
            <ol className="space-y-5">
              <Step n={1}>
                Open <span className="font-medium">Chrome</span>.
              </Step>
              <Step n={2}>
                Copy the app link, then paste it into the Chrome address bar and
                tap Go.
                <CopyAppLinkButton url={APP_URL} />
              </Step>
              <Step n={3}>
                Tap the <span className="font-medium">three dots</span> in the
                top right corner.
                <span className="mt-1 block text-base text-muted-foreground">
                  This is the menu button.
                </span>
              </Step>
              <Step n={4}>
                Tap <span className="font-medium">Install app</span>.
                <span className="mt-1 block text-base text-muted-foreground">
                  Do not use Add to Home screen if Install app is available —
                  that puts a Chrome badge on the icon.
                </span>
              </Step>
              <Step n={5}>
                Tap <span className="font-medium">Install</span> to confirm.
                <span className="mt-1 block text-base text-muted-foreground">
                  Wait a few seconds. If Chrome then asks to Add to Home screen
                  instead, cancel, free some phone storage, make sure you are
                  signed into Google Play, remove any old Get Food icon, and
                  try Install app again.
                </span>
              </Step>
              <Step n={6}>
                Look on your Home Screen for the{" "}
                <span className="font-medium">Get Food</span> icon (no Chrome
                badge). Tap it any time to open the app.
              </Step>
            </ol>
          </InstallAccordion>
        </div>

        <section className="mt-12 rounded-2xl border bg-background/80 px-5 py-5 shadow-sm">
          <h2 className="font-heading text-xl">After it is installed</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-lg leading-relaxed text-foreground/90">
            <li>Open Get Food from your Home Screen.</li>
            <li>Sign in with the email you use for Good Neighbor Gardens.</li>
            <li>If you get stuck, ask a family member or call GNG for help.</li>
          </ol>
        </section>

        <section className="mt-8 space-y-2 text-base leading-relaxed text-muted-foreground">
          <p>
            Tip: You only need to do these steps once. After that, use the icon
            on your Home Screen — just like Mail or Photos.
          </p>
          <p>
            Already have the website open?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Go to sign in
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
