const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

const ONESIGNAL_SDK_ID = "onesignal-sdk";
const ONESIGNAL_SDK_SRC = "/push/onesignal/OneSignalSDK.page.js";
const INIT_TIMEOUT_MS = 20_000;

let skippedOnThisOrigin = false;

function isOneSignalOriginError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /can only be used on/i.test(message);
}

function getConfiguredAppOrigin(): string | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (!appUrl) return null;
  try {
    return new URL(appUrl).origin;
  } catch {
    return null;
  }
}

function isLocalDevOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

/** True when this browser origin is allowed to initialize the OneSignal SDK. */
export function isOneSignalActiveOnThisOrigin() {
  if (typeof window === "undefined") return false;
  if (skippedOnThisOrigin) return false;

  const origin = window.location.origin;
  const configuredOrigin = getConfiguredAppOrigin();

  if (configuredOrigin && origin === configuredOrigin) {
    return true;
  }

  if (
    process.env.NEXT_PUBLIC_ONESIGNAL_ALLOW_LOCALHOST === "true" &&
    isLocalDevOrigin(origin)
  ) {
    return true;
  }

  return false;
}

export function isOneSignalConfigured() {
  return Boolean(APP_ID);
}

export function isOneSignalAvailable() {
  return isOneSignalConfigured() && isOneSignalActiveOnThisOrigin();
}

export function getOneSignalUnavailableMessage() {
  if (!isOneSignalConfigured()) {
    return "Push notifications are not configured for this deployment.";
  }

  if (typeof window === "undefined") return null;

  if (isOneSignalActiveOnThisOrigin()) return null;

  if (isLocalDevOrigin(window.location.origin)) {
    return "Push notifications are disabled in local development. They work on the live app.";
  }

  const configuredOrigin = getConfiguredAppOrigin();
  if (configuredOrigin) {
    return `Push notifications are only available on ${configuredOrigin}.`;
  }

  return "Push notifications are not available on this site URL.";
}

function markOneSignalSkippedOnOrigin() {
  skippedOnThisOrigin = true;
  initPromise = null;
  isInitialized = false;
}

// Minimal surface used by this module; full types come from the loaded SDK.
type OneSignalInstance = {
  init: (options: Record<string, unknown>) => Promise<void>;
  login: (externalId: string) => Promise<void>;
  Notifications: {
    isPushSupported: () => boolean;
    requestPermission: () => Promise<boolean>;
    permission: NotificationPermission | boolean;
  };
  User: {
    addTags: (tags: Record<string, string>) => Promise<void>;
    addEmail: (email: string) => Promise<void>;
    PushSubscription: {
      optedIn?: boolean;
      optIn: () => Promise<void>;
      optOut: () => Promise<void>;
      addEventListener: (event: string, listener: () => void) => void;
      removeEventListener: (event: string, listener: () => void) => void;
    };
  };
};

declare global {
  interface Window {
    OneSignalDeferred?: Array<
      (oneSignal: OneSignalInstance) => void | Promise<void>
    >;
    OneSignal?: OneSignalInstance;
  }
}

let initPromise: Promise<void> | null = null;
let isInitialized = false;

export function isBraveBrowser() {
  if (typeof navigator === "undefined") return false;
  const brave = navigator as Navigator & {
    brave?: { isBrave?: () => Promise<boolean> | boolean };
  };
  return Boolean(brave.brave?.isBrave);
}

export async function isBraveBrowserAsync() {
  if (!isBraveBrowser()) return false;
  const brave = navigator as Navigator & {
    brave?: { isBrave?: () => Promise<boolean> | boolean };
  };
  try {
    const result = brave.brave?.isBrave?.();
    return typeof result === "boolean" ? result : await result;
  } catch {
    return true;
  }
}

export function getBravePushHelpMessage() {
  return "In Brave, also enable Settings → Privacy → “Use Google services for push messaging” (open brave://settings/privacy), turn Shields down for this site, allow notifications, then refresh.";
}

function getNativeNotificationPermission(): NotificationPermission | null {
  if (typeof Notification === "undefined") return null;
  return Notification.permission;
}

function getPermissionDeniedMessage(isBrave: boolean) {
  if (isBrave) {
    return "Notifications are blocked for this site in Brave. Open brave://settings/privacy and enable “Use Google services for push messaging”. Then click the lock icon in the address bar → Site settings → Notifications → Allow, refresh, and try again.";
  }

  return "Notifications are blocked for this site. Open your browser site settings, set Notifications to Allow, refresh, and try again.";
}

function getPermissionNotGrantedMessage(isBrave: boolean) {
  if (isBrave) {
    return "Brave did not grant notification permission. Enable “Use Google services for push messaging” at brave://settings/privacy, allow notifications for this site, refresh, then toggle again.";
  }

  return "Permission was not granted. Check your browser site settings and allow notifications for this site.";
}

async function requestNotificationPermission(): Promise<boolean> {
  const current = getNativeNotificationPermission();
  if (current === "granted") return true;
  if (current === "denied") return false;

  if (typeof Notification !== "undefined" && Notification.requestPermission) {
    const result = await Notification.requestPermission();
    if (result === "granted") return true;
    if (result === "denied") return false;
  }

  return withOneSignal((OneSignal) =>
    OneSignal.Notifications.requestPermission()
  );
}

function isPushNotificationsSupported() {
  const supportsVapid =
    typeof PushSubscriptionOptions !== "undefined" &&
    PushSubscriptionOptions.prototype.hasOwnProperty("applicationServerKey");
  const isMacOSSafariInIframe =
    window.top !== window &&
    navigator.vendor === "Apple Computer, Inc." &&
    navigator.platform === "MacIntel";
  const supportsSafari =
    Boolean(
      (window as Window & { safari?: { pushNotification?: unknown } }).safari
        ?.pushNotification
    ) || isMacOSSafariInIframe;

  return supportsVapid || supportsSafari;
}

function runWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function withOneSignal<T>(
  fn: (oneSignal: OneSignalInstance) => Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        resolve(await fn(OneSignal));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function ensureSdkScript(): HTMLScriptElement {
  let script = document.getElementById(
    ONESIGNAL_SDK_ID
  ) as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement("script");
    script.id = ONESIGNAL_SDK_ID;
    script.src = ONESIGNAL_SDK_SRC;
    script.defer = true;
    document.head.appendChild(script);
  }

  return script;
}

function waitForOneSignalShim(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.OneSignal) {
      resolve();
      return;
    }

    const timer = window.setTimeout(() => {
      reject(
        new Error(
          "Timed out loading push notifications. Check your connection or disable ad blockers for this site."
        )
      );
    }, INIT_TIMEOUT_MS);

    const finish = () => {
      window.clearTimeout(timer);
      resolve();
    };

    const fail = (message: string) => {
      window.clearTimeout(timer);
      reject(new Error(message));
    };

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(() => finish());

    const script = ensureSdkScript();
    script.addEventListener(
      "error",
      () => fail("OneSignal script failed to load."),
      { once: true }
    );
  });
}

export function ensureOneSignalInitialized(): Promise<void> {
  if (!APP_ID) {
    return Promise.reject(
      new Error(
        "Push notifications are not configured. Add NEXT_PUBLIC_ONESIGNAL_APP_ID to .env.local."
      )
    );
  }

  const unavailable = getOneSignalUnavailableMessage();
  if (unavailable) {
    markOneSignalSkippedOnOrigin();
    return Promise.reject(new Error(unavailable));
  }

  if (isInitialized) {
    return Promise.resolve();
  }

  if (!initPromise) {
    initPromise = (async () => {
      if (!isPushNotificationsSupported()) {
        throw new Error(
          "This browser does not support Web Push notifications."
        );
      }

      await waitForOneSignalShim();

      if (!isInitialized) {
        try {
          await runWithTimeout(
            withOneSignal((OneSignal) =>
              OneSignal.init({
                appId: APP_ID,
                allowLocalhostAsSecureOrigin:
                  process.env.NEXT_PUBLIC_ONESIGNAL_ALLOW_LOCALHOST === "true",
                serviceWorkerPath: "sw.js",
                serviceWorkerParam: { scope: "/" },
              })
            ),
            INIT_TIMEOUT_MS,
            "Timed out initializing push notifications."
          );
          isInitialized = true;
        } catch (error) {
          if (isOneSignalOriginError(error)) {
            markOneSignalSkippedOnOrigin();
            throw new Error(
              getOneSignalUnavailableMessage() ??
                "Push notifications are not available on this site URL."
            );
          }
          throw error;
        }
      }
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
}

export type PushSubscriptionState = {
  supported: boolean;
  optedIn: boolean;
  permission: NotificationPermission | boolean;
};

export async function getPushSubscriptionState(): Promise<PushSubscriptionState> {
  await ensureOneSignalInitialized();

  const oneSignal = window.OneSignal;
  if (!oneSignal) {
    throw new Error("OneSignal is not available.");
  }

  return {
    supported: oneSignal.Notifications.isPushSupported(),
    optedIn: Boolean(oneSignal.User.PushSubscription.optedIn),
    permission: oneSignal.Notifications.permission,
  };
}

export async function linkSubscriberToOneSignal(subscriber: {
  id: string;
  email: string;
}) {
  await ensureOneSignalInitialized();
  await withOneSignal(async (OneSignal) => {
    await OneSignal.login(subscriber.id);
    await OneSignal.User.addTags({
      role: "subscriber",
      active: "true",
    });
    await OneSignal.User.addEmail(subscriber.email);
  });
}

export async function enablePushNotifications(): Promise<{
  ok: boolean;
  optedIn: boolean;
  message?: string;
}> {
  await ensureOneSignalInitialized();

  const oneSignal = window.OneSignal;
  if (!oneSignal?.Notifications.isPushSupported()) {
    return {
      ok: false,
      optedIn: false,
      message: "Push notifications are not supported in this browser.",
    };
  }

  const isBrave = Boolean(await isBraveBrowserAsync());
  const nativePermission = getNativeNotificationPermission();

  if (nativePermission === "denied") {
    return {
      ok: false,
      optedIn: false,
      message: getPermissionDeniedMessage(isBrave),
    };
  }

  const permission = await requestNotificationPermission();

  if (!permission) {
    const afterPermission = getNativeNotificationPermission();
    return {
      ok: false,
      optedIn: false,
      message:
        afterPermission === "denied"
          ? getPermissionDeniedMessage(isBrave)
          : getPermissionNotGrantedMessage(isBrave),
    };
  }

  try {
    await withOneSignal((OneSignal) => OneSignal.User.PushSubscription.optIn());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    const pushServiceFailed =
      message.includes("push service") ||
      message.includes("Registration failed") ||
      message.includes("AbortError");

    if (pushServiceFailed && isBrave) {
      return {
        ok: false,
        optedIn: false,
        message:
          "Brave blocked the push service. Enable “Use Google services for push messaging” at brave://settings/privacy, then refresh and try again.",
      };
    }

    throw error;
  }

  const optedIn = Boolean(oneSignal.User.PushSubscription.optedIn);
  return {
    ok: optedIn,
    optedIn,
    message: optedIn
      ? undefined
      : isBrave
        ? "Could not subscribe. In Brave, enable push messaging at brave://settings/privacy, allow notifications for this site, refresh, and try again."
        : "Could not complete subscription. Try again or check browser settings.",
  };
}

export async function disablePushNotifications() {
  await ensureOneSignalInitialized();
  await withOneSignal((OneSignal) => OneSignal.User.PushSubscription.optOut());
}

export function onPushSubscriptionChange(
  listener: (optedIn: boolean) => void
) {
  const handler = () => {
    listener(Boolean(window.OneSignal?.User.PushSubscription.optedIn));
  };

  void ensureOneSignalInitialized()
    .then(() =>
      withOneSignal(async (OneSignal) => {
        OneSignal.User.PushSubscription.addEventListener("change", handler);
      })
    )
    .catch(() => {
      // Settings UI surfaces initialization errors.
    });

  return () => {
    void withOneSignal(async (OneSignal) => {
      OneSignal.User.PushSubscription.removeEventListener("change", handler);
    }).catch(() => {
      // SDK may not be loaded yet.
    });
  };
}
