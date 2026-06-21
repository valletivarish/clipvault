import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'REDACTED_API_KEY',
  authDomain: 'REDACTED_AUTH_DOMAIN',
  projectId: 'REDACTED_PROJECT_ID',
  storageBucket: 'REDACTED_STORAGE_BUCKET',
  messagingSenderId: 'REDACTED_SENDER_ID',
  appId: 'REDACTED_APP_ID',
  measurementId: 'REDACTED_MEASUREMENT_ID',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
