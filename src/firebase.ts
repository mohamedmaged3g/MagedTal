import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import type {
  CustomerProfile,
  ProfileCategory,
  UserQuoteRecord,
} from './types.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

function clampString(value: string, maxLen: number): string {
  const trimmed = value.trim();
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned.slice(0, 128) || `id_${Date.now()}`;
}

export async function signInWithGoogleAccount(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutGoogleAccount(): Promise<void> {
  await signOut(auth);
}

export async function syncUserProfileOnSignIn(
  user: User
): Promise<CustomerProfile> {
  const path = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);
  const safeName = clampString(
    user.displayName || user.email?.split('@')[0] || 'عميل ماجدتال',
    120
  );
  const safeEmail = clampString(user.email || '', 200);
  const safePhoto = clampString(user.photoURL || '', 600);

  let snap;
  try {
    snap = await getDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (!snap.exists()) {
    const newDoc: Record<string, unknown> = {
      uid: user.uid,
      displayName: safeName,
      email: safeEmail,
      ...(safePhoto ? { photoURL: safePhoto } : {}),
      phone: '',
      city: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(ref, newDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
    return {
      uid: user.uid,
      displayName: safeName,
      email: safeEmail,
      photoURL: safePhoto || undefined,
      phone: '',
      city: '',
    };
  }

  const data = snap.data() as Partial<CustomerProfile>;
  const nextDisplayName = clampString(data.displayName || safeName, 120);
  const nextPhoto = clampString(safePhoto || data.photoURL || '', 600);

  try {
    await updateDoc(ref, {
      displayName: nextDisplayName,
      ...(nextPhoto ? { photoURL: nextPhoto } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }

  return {
    uid: user.uid,
    displayName: nextDisplayName,
    email: data.email || safeEmail,
    photoURL: nextPhoto || undefined,
    phone: typeof data.phone === 'string' ? data.phone : '',
    city: typeof data.city === 'string' ? data.city : '',
  };
}

export async function updateCustomerProfile(
  uid: string,
  patch: { displayName?: string; phone?: string; city?: string }
): Promise<void> {
  const path = `users/${uid}`;
  const ref = doc(db, 'users', uid);
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (typeof patch.displayName === 'string' && patch.displayName.trim()) {
    payload.displayName = clampString(patch.displayName, 120);
  }
  if (typeof patch.phone === 'string') {
    payload.phone = clampString(patch.phone, 32);
  }
  if (typeof patch.city === 'string') {
    payload.city = clampString(patch.city, 100);
  }

  try {
    await updateDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveUserQuoteRecord(
  uid: string,
  input: {
    referenceCode: string;
    projectInterest: string;
    profileType: ProfileCategory;
    profileSystem?: string;
    summary: string;
  }
): Promise<void> {
  const quoteId = sanitizeId(`q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const path = `users/${uid}/quotes/${quoteId}`;
  const safeRefCode =
    input.referenceCode
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, '')
      .slice(0, 32) || 'MT-NEW';
  const safeInterest = clampString(
    input.projectInterest || 'طلب مقايسة',
    160
  );
  const safeSummary = clampString(input.summary || 'طلب مقايسة من الموقع', 1000);
  const safeSystem = input.profileSystem
    ? clampString(input.profileSystem, 120)
    : '';

  const payload: Record<string, unknown> = {
    uid,
    referenceCode: safeRefCode.length >= 3 ? safeRefCode : 'MT-NEW',
    projectInterest: safeInterest || 'طلب مقايسة',
    profileType: input.profileType === 'upvc' ? 'upvc' : 'aluminum',
    ...(safeSystem ? { profileSystem: safeSystem } : {}),
    summary: safeSummary || 'طلب مقايسة من الموقع',
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', uid, 'quotes', quoteId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserQuotes(
  uid: string,
  onQuotes: (quotes: UserQuoteRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `users/${uid}/quotes`;
  const q = query(collection(db, 'users', uid, 'quotes'), where('uid', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserQuoteRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data() as {
          uid?: string;
          referenceCode?: string;
          projectInterest?: string;
          profileType?: ProfileCategory;
          profileSystem?: string;
          summary?: string;
          createdAt?: Timestamp;
        };
        const createdAtMs =
          d.createdAt && typeof d.createdAt.toMillis === 'function'
            ? d.createdAt.toMillis()
            : Date.now();
        return {
          id: docSnap.id,
          uid: d.uid || uid,
          referenceCode: d.referenceCode || 'MT-NEW',
          projectInterest: d.projectInterest || 'طلب مقايسة',
          profileType: d.profileType === 'upvc' ? 'upvc' : 'aluminum',
          profileSystem: d.profileSystem,
          summary: d.summary || '',
          createdAtMs,
        };
      });
      list.sort((a, b) => b.createdAtMs - a.createdAtMs);
      onQuotes(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}
