# Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Strict PII Isolation**: `/users/{userId}` contains `email`, `phone`, and `city`. Only the verified owner (`request.auth.uid == userId && request.auth.token.email_verified == true`) or a verified admin may read or delete it. No blanket `isSignedIn()` reads exist.
2. **Master Gate Ownership**: A `/users/{userId}/quotes/{quoteId}` document can only be created or read if the parent `/users/{userId}` document exists and belongs to the verified owner.
3. **Immutable Identity & Timestamps**: `uid` and `createdAt` can never be changed after creation; `createdAt` and `updatedAt` must equal `request.time` on creation/updates.
4. **No Self-Assigned Roles**: Users cannot inject `role`, `isAdmin`, or any unlisted fields into `/users/{userId}` or create entries in `/admins/{adminId}`.
5. **Bounded Strings & Path IDs**: All document IDs match `^[a-zA-Z0-9_\-]+$` (<= 128 chars) and every string field enforces explicit `.size()` boundaries synced with `firebase-blueprint.json`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Read** on `/users/user_a` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoof** (`email: 'mohamedmaged3g@gmail.com'`, `email_verified: false`) reading `/users/user_a` -> `PERMISSION_DENIED`.
3. **Cross-User PII Read** (`user_b` calling `get` on `/users/user_a`) -> `PERMISSION_DENIED`.
4. **Shadow Field Injection on Create** (`/users/user_a` with `{ ..., isAdmin: true }`) -> `PERMISSION_DENIED`.
5. **Shadow Field Injection on Update** (`/users/user_a` updating `{ phone: '010', role: 'admin' }`) -> `PERMISSION_DENIED`.
6. **UID Spoofing on Create** (`user_a` writing `/users/user_a` with `uid: 'user_b'`) -> `PERMISSION_DENIED`.
7. **Immutable `createdAt` Tampering** (`user_a` updating `createdAt` on `/users/user_a`) -> `PERMISSION_DENIED`.
8. **Client-Forged Timestamp** (`user_a` creating `/users/user_a` with a backdated timestamp instead of `request.time`) -> `PERMISSION_DENIED`.
9. **Resource Exhaustion / Oversized String** (`user_a` writing a 2000-char `displayName` or 200-char `phone`) -> `PERMISSION_DENIED`.
10. **ID Poisoning** (`user_a` creating `/users/user_a/quotes/bad$id!with/symbols`) -> `PERMISSION_DENIED`.
11. **Orphaned Quote Creation** (`user_c` creating `/users/user_c/quotes/q1` before `/users/user_c` exists) -> `PERMISSION_DENIED`.
12. **Privilege Escalation on `/admins`** (regular user creating `/admins/user_a`) -> `PERMISSION_DENIED`.
