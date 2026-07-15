"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { toAirtableRsvpChoice } from "@/lib/rsvp-choices";
import { cn } from "@/lib/utils";
import type { HarvestRsvpParticipant } from "@/types/rsvp";

const PREVIEW_COUNT = 3;
const HOME_PANEL_ID = "home-panel-scroll";

const PANEL_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

const MOBILE_PANEL_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "translate3d(0, 100%, 0)" },
  { opacity: 0.85, transform: "translate3d(0, 12%, 0)", offset: 0.4 },
  { opacity: 1, transform: "translate3d(0, -5px, 0)", offset: 0.82 },
  { opacity: 1, transform: "translate3d(0, 0, 0)", offset: 1 },
];

const DESKTOP_PANEL_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "translate3d(0, 28px, 0) scale(0.985)" },
  { opacity: 0.9, transform: "translate3d(0, 6px, 0) scale(0.995)", offset: 0.45 },
  { opacity: 1, transform: "translate3d(0, -4px, 0) scale(1)", offset: 0.8 },
  { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)", offset: 1 },
];

function lockPageScroll() {
  const scrollY = window.scrollY;
  const html = document.documentElement;
  const body = document.body;
  const homePanel = document.getElementById(HOME_PANEL_ID);
  const panelScrollY = homePanel?.scrollTop ?? 0;

  const snapshot = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyWidth: body.style.width,
    bodyPaddingRight: body.style.paddingRight,
    panelOverflow: homePanel?.style.overflow ?? "",
    scrollY,
    panelScrollY,
  };

  const scrollbarWidth = window.innerWidth - html.clientWidth;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.width = "100%";
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
  if (homePanel) {
    homePanel.style.overflow = "hidden";
  }

  return () => {
    html.style.overflow = snapshot.htmlOverflow;
    body.style.overflow = snapshot.bodyOverflow;
    body.style.position = snapshot.bodyPosition;
    body.style.top = snapshot.bodyTop;
    body.style.width = snapshot.bodyWidth;
    body.style.paddingRight = snapshot.bodyPaddingRight;
    if (homePanel) {
      homePanel.style.overflow = snapshot.panelOverflow;
      homePanel.scrollTop = snapshot.panelScrollY;
    }
    window.scrollTo(0, snapshot.scrollY);
  };
}

function StackedAvatars({
  participants,
  size = 28,
}: {
  participants: HarvestRsvpParticipant[];
  size?: number;
}) {
  const preview = participants.slice(0, PREVIEW_COUNT);

  if (preview.length === 0) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--brand-green),white_75%)] ring-2 ring-[color-mix(in_oklab,var(--brand-green),white_88%)]"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <span className="text-[10px] font-medium text-muted-foreground">+</span>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center">
      {preview.map((participant, index) => (
        <ProfileAvatar
          key={participant.id}
          avatarUrl={participant.avatarUrl}
          name={participant.fullName}
          size={size}
          className={cn(
            "ring-2 ring-[color-mix(in_oklab,var(--brand-green),white_88%)]",
            index > 0 && "-ml-2.5"
          )}
        />
      ))}
    </div>
  );
}

function RsvpRosterPanel({
  harvestName,
  participants,
  onClose,
}: {
  harvestName: string;
  participants: HarvestRsvpParticipant[];
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const unlock = lockPageScroll();

    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (backdrop && panel) {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const desktop = window.matchMedia("(min-width: 640px)").matches;

      if (reducedMotion) {
        backdrop.style.opacity = "1";
        panel.style.opacity = "1";
        panel.style.transform = "none";
      } else {
        panel.style.transformOrigin = desktop ? "center center" : "bottom center";

        backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 320,
          easing: "ease-out",
          fill: "forwards",
        });

        panel.animate(desktop ? DESKTOP_PANEL_KEYFRAMES : MOBILE_PANEL_KEYFRAMES, {
          duration: desktop ? 520 : 580,
          easing: PANEL_EASING,
          fill: "forwards",
        });
      }
    }

    return unlock;
  }, []);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        ref={backdropRef}
        type="button"
        aria-label="Close RSVP list"
        className="absolute inset-0 bg-black/40"
        style={{ opacity: 0 }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rsvp-roster-title"
        className="relative z-10 flex max-h-[min(80dvh,32rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-background shadow-xl will-change-transform"
        style={{
          opacity: 0,
          transform: "translate3d(0, 110%, 0)",
          transformOrigin: "bottom center",
        }}
      >
        <div className="flex items-start justify-between gap-3 border-b px-4 py-4">
          <div className="min-w-0 space-y-1">
            <h2 id="rsvp-roster-title" className="font-heading text-lg leading-tight">
              Who RSVP&apos;d
            </h2>
            <p className="truncate text-sm text-muted-foreground">{harvestName}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-2 py-2">
          {participants.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              No RSVPs yet. Be the first to let the community know your plan.
            </p>
          ) : (
            <ul className="space-y-1">
              {participants.map((participant) => (
                <li
                  key={participant.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5"
                >
                  <ProfileAvatar
                    avatarUrl={participant.avatarUrl}
                    name={participant.fullName}
                    size={40}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {participant.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {toAirtableRsvpChoice(participant.choice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function HarvestRsvpRoster({
  harvestName,
  participants,
}: {
  harvestName: string;
  participants: HarvestRsvpParticipant[];
}) {
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const count = participants.length;
  const label =
    count === 0
      ? "Who RSVP'd"
      : count === 1
        ? "1 RSVP'd"
        : `${count} RSVP'd`;

  useEffect(() => {
    setPortalReady(true);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex max-w-[min(100%,14rem)] items-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--brand-green),white_88%)] py-1.5 pl-1.5 pr-3 text-left text-xs font-medium text-[var(--brand-brown)] transition-colors hover:bg-[color-mix(in_oklab,var(--brand-green),white_82%)] active:scale-[0.98] sm:max-w-none"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <StackedAvatars participants={participants} />
        <span className="truncate">{label}</span>
      </button>

      {open && portalReady ? (
        <RsvpRosterPanel
          harvestName={harvestName}
          participants={participants}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
