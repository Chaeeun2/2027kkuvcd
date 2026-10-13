/*
 * Firebase 웹 설정은 비밀값이 아니라 브라우저에 그대로 실려도 된다.
 * 실제 접근 제어는 Firestore 보안 규칙과 미디어 Worker가 맡는다.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

export const MEDIA_API_URL = (import.meta.env.VITE_MEDIA_API_URL ?? "").replace(
  /\/$/,
  "",
);
