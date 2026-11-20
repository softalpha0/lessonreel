const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: env.VITE_FIREBASE_APP_ID ?? "",
};

export const appConfig = {
  recaptchaSiteKey: env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY ?? "",
  // Debug tokens are for local development only: a deployed build (pnpm build) always uses
  // the real reCAPTCHA Enterprise check, even if .env.local still says "true" (HACKATHON §3).
  appCheckDebug: env.DEV && env.VITE_APPCHECK_DEBUG === "true",
  cloudTextModel: env.VITE_CLOUD_TEXT_MODEL || "gemini-3.5-flash-lite",
  ttsModel: env.VITE_TTS_MODEL || "gemini-3.8-flash-tts",
  imageModel: env.VITE_IMAGE_MODEL || "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}
