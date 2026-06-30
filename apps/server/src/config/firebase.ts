import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { env } from './env';
import { logger } from '../utils/logger';

let firebaseApp: App | null = null;
let firebaseAuth: Auth | null = null;

function initializeFirebase(): void {
  // Skip if already initialized
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    firebaseAuth = getAuth(firebaseApp);
    logger.info('🔥 Firebase Admin SDK already initialized');
    return;
  }

  const serviceAccountKey = env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey || serviceAccountKey.trim() === '') {
    logger.warn(
      '⚠️  FIREBASE_SERVICE_ACCOUNT_KEY not set. Firebase Auth will be unavailable. ' +
      'This is acceptable for local development without authentication.'
    );
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };

    firebaseApp = initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
    });

    firebaseAuth = getAuth(firebaseApp);
    logger.info('🔥 Firebase Admin SDK initialized successfully', {
      projectId: serviceAccount.project_id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Failed to initialize Firebase Admin SDK: ${message}`);
    logger.warn('⚠️  Firebase Auth will be unavailable');
  }
}

// Initialize on module load
initializeFirebase();

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    throw new Error(
      'Firebase Auth is not initialized. ' +
      'Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set in environment variables.'
    );
  }
  return firebaseAuth;
}

export function isFirebaseInitialized(): boolean {
  return firebaseAuth !== null;
}
