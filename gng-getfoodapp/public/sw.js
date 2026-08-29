/// <reference lib="webworker" />

// OneSignal push — optional; must not prevent the SW from installing.
try {
  importScripts("/push/onesignal/OneSignalSDK.sw.js");
} catch (error) {
  console.warn("[sw] OneSignal SDK not loaded:", error);
}

const CACHE_NAME = "gng-get-food-v7";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll([OFFLINE_URL, "/login"]);
      } catch (error) {
        console.warn("[sw] Precache skipped:", error);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Required for Android WebAPK: a fetch handler that returns a Response.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch {
        const cache = await caches.open(CACHE_NAME);
        if (event.request.mode === "navigate") {
          return (
            (await cache.match(OFFLINE_URL)) ||
            (await cache.match("/login")) ||
            new Response("Offline", {
              status: 200,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
        return (
          (await cache.match(event.request)) ||
          new Response("", { status: 503, statusText: "Offline" })
        );
      }
    })()
  );
});
