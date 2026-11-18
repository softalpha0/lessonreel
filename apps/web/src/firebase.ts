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
  uid: string | null;
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

  let uid: string | null = null;
  try {
    const cred = await signInAnonymously(getAuth(app));
    uid = cred.user.uid;
  } catch {
    // Offline on first load: auth retries later; on-device features still work.
    uid = null;
  }

  services = { app, ai, db, uid };
  return services;
}
