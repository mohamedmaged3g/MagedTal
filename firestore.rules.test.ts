/**
 * Firestore Security Rules Verification Specification (Dirty Dozen)
 *
 * Documents the 12 adversarial payloads that must return PERMISSION_DENIED
 * against firestore.rules when executed in the Firebase Rules Emulator.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated read on user profile',
    operation: 'get',
    path: 'users/user_a',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified admin email spoof attack',
    operation: 'get',
    path: 'users/user_a',
    auth: {
      uid: 'attacker_1',
      email: 'mohamedmaged3g@gmail.com',
      email_verified: false,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-user PII read attempt',
    operation: 'get',
    path: 'users/user_a',
    auth: {
      uid: 'user_b',
      email: 'b@example.com',
      email_verified: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow field injection (isAdmin) on user create',
    operation: 'create',
    path: 'users/user_a',
    auth: {
      uid: 'user_a',
      email: 'a@example.com',
      email_verified: true,
    },
    payload: {
      uid: 'user_a',
      displayName: 'Ahmed',
      email: 'a@example.com',
      isAdmin: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow field injection (role) on user update',
    operation: 'update',
    path: 'users/user_a',
    auth: {
      uid: 'user_a',
      email: 'a@example.com',
      email_verified: true,
    },
    payload: {
      phone: '01000000000',
      role: 'admin',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'UID spoofing on profile create',
    operation: 'create',
    path: 'users/user_a',
    auth: {
      uid: 'user_a',
      email: 'a@example.com',
      email_verified: true,
    },
    payload: {
      uid: 'user_b',
      displayName: 'Spoof',
      email: 'a@example.com',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Immutable createdAt tampering on update',
    operation: 'update',
    path: 'users/user_a',
    auth: {
      uid: 'user_a',
      email: 'a@example.com',
      email_verified: true,
    },
    payload: {
      createdAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Client-forged non-server timestamp on create',
    operation: 'create',
    path: 'users/user_a',
    auth: {
      uid: 'user_a',
      email: 'a@example.com',
      email_verified: true,
    },
    payload: {
      uid: 'user_a',
      displayName: 'Ahmed',
      email: 'a@example.com',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Oversized displayName resource poisoning',
    operation: 'update',
    path: 'users/user_a',
    auth: {
      uid: 'user_a',
      email: 'a@example.com',
      email_verified: true,
    },
    payload: {
      displayName: 'A'.repeat(2000),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Invalid quote document ID poisoning',
    operation: 'create',
    path: 'users/user_a/quotes/invalid$id!bad',
    auth: {
      uid: 'user_a',
      email: 'a@example.com',
      email_verified: true,
    },
    payload: {
      uid: 'user_a',
      referenceCode: 'MT-1001',
      projectInterest: 'مطبخ',
      profileType: 'aluminum',
      summary: '5m',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Orphaned quote write without existing parent user profile',
    operation: 'create',
    path: 'users/user_orphan/quotes/q1',
    auth: {
      uid: 'user_orphan',
      email: 'orphan@example.com',
      email_verified: true,
    },
    payload: {
      uid: 'user_orphan',
      referenceCode: 'MT-1002',
      projectInterest: 'شبابيك UPVC',
      profileType: 'upvc',
      summary: '8m',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Self-privilege escalation on admins collection',
    operation: 'create',
    path: 'admins/user_a',
    auth: {
      uid: 'user_a',
      email: 'a@example.com',
      email_verified: true,
    },
    payload: {
      uid: 'user_a',
      email: 'a@example.com',
    },
    expected: 'PERMISSION_DENIED',
  },
];
