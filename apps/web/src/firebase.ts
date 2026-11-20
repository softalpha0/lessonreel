import { initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getAI, GoogleAIBackend, type AI } from "firebase/ai";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { appConfig, firebaseConfig, isFirebaseConfigured } from "./config";

declare global {
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

export interface FirebaseServices {
  app: FirebaseApp;
  ai: AI;
  db: Firestore;
  /** Known at once for returning users (saved in the browser); null until a first sign-in. */
  uid: string | null;
  /** Resolves with the uid once signed in (or null if sign-in failed, e.g. offline). */
  signedIn: Promise<string | null>;
}

let services: FirebaseServices | null = null;

/**
 * Order matters: App Check must be initialized before any AI call.
 * Firestore uses a persistent local cache so queue writes made offline survive reloads
 * and sync when the connection returns.
 */
export async function initFirebase(): Promise<FirebaseServices> {
  if (services) return services;
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Copy apps/web/.env.example to .env.local.");
  }

  const app = initializeApp(firebaseConfig);

  if (appConfig.appCheckDebug) {
    globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appConfig.recaptchaSiteKey || "debug-only"),
    isTokenAutoRefreshEnabled: true,
  });

  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });

  const ai = getAI(app, { backend: new GoogleAIBackend() });

  // Don't block start-up on the network (offline it waits ~30 s before failing).
  // A returning browser already has its anonymous user saved locally: use it at once.
  const auth = getAuth(app);
  await auth.authStateReady();
  const known = auth.currentUser?.uid ?? null;
  const signedIn: Promise<string | null> = known
    ? Promise.resolve(known)
    : signInAnonymously(auth).then(
        (cred) => cred.user.uid,
        () => null, // offline first visit: on-device work still runs; the queue waits
      );

  services = { app, ai, db, uid: known, signedIn };
  void signedIn.then((uid) => {
    if (services && uid) services.uid = uid;
  });
  return services;
}
