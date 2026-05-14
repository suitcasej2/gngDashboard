import { PWA_SPLASH_BACKGROUND } from "@/lib/pwa-splash";

/** Shown while the root segment streams (after HTML arrives; not the native iOS pre-WebView flash). */
export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        backgroundColor: PWA_SPLASH_BACKGROUND,
        color: "#381810",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "2rem",
          height: "2rem",
          borderRadius: "9999px",
          border: "2px solid #56bb55",
          borderTopColor: "transparent",
          animation: "gng-spin 0.7s linear infinite",
        }}
        aria-hidden
      />
      <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.72 }}>
        Loading…
      </p>
      <style>{`@keyframes gng-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
