# Video security and signed-playback migration

## Current phase: YouTube Unlisted

`media/{mediaId}` contains course-facing metadata and never contains a YouTube Video ID. `mediaSources/{mediaId}` contains the normalized 11-character ID and can only be read by an active, authorized user under Firestore Security Rules. The client performs a one-time source read only after a lesson is opened; it does not put the ID in routes, titles, analytics, logs, or browser storage.

YouTube Unlisted is not private or DRM. Anyone who obtains the ID can share it or watch outside YMM, and an authorized technical user can recover it from DevTools, network traffic, or the iframe. The moving watermark is a deterrence and tracing aid only; it cannot prevent screen recording.

Each metadata document selects `youtube`, `cloudflare_stream`, `mux`, or `unset`. The player shell consumes a `VideoPlaybackSession`, while a resolver and provider adapter handle playback. Course and lesson URLs, progress, and `mediaId` therefore remain stable during a per-video migration. Old YouTube lessons and new signed-provider lessons can coexist.

Rules authorization reads the active user and media documents, plus enrollment for `enrolled` visibility. A source read therefore costs the requested document plus up to three dependent document lookups. There is no polling or realtime listener. Monitor daily reads, writes, deletes and storage in Firebase Console > Firestore Database > Usage.

## Migration of legacy documents

The migration is idempotent and defaults to dry-run. It never prints source values. It copies to `mediaSources`, reads the new document back, and only then removes legacy source fields:

```sh
FIREBASE_PROJECT_ID=ymm-academy npm run migrate:media-sources
FIREBASE_PROJECT_ID=ymm-academy npm run migrate:media-sources -- --apply
```

Run dry-run and review its counts before any production mutation. Application Default Credentials are required; credentials are never written by the script.

## Paid phase: common signed-playback flow

1. Upload an asset to the selected provider and make it private or signed-policy only.
2. Firestore retains the provider and asset/playback identifier, never a signed token.
3. The frontend sends a Firebase ID token to a protected token endpoint.
4. The backend verifies Firebase identity, active status, enrollment or purchase, and published media status.
5. The backend reads the asset identifier, creates a short-lived playback token/URL, and returns a playback session.
6. The frontend refreshes shortly before expiration and never persists the token in Firestore or local storage.
7. The endpoint is rate-limited and emits minimal audit events without tokens or private keys. Keys support rotation and remain in a backend secret store.
8. Enable domain/referrer restrictions where supported, disable public playback and downloads for paid assets, and retain the dynamic watermark.

A signed URL still does not stop screen capture. Provider DRM is a separate product/security layer if later required. Static Firebase Hosting must never contain signing logic or keys.

## Cloudflare Stream option

For paid assets enable `requireSignedURLs`. Only a backend may call the Stream token API or sign with a Stream signing key. Configure short expiration, keep the API token/private signing key out of frontend code and Firestore, and leave downloadable playback disabled unless the product explicitly permits downloads. IP or country rules can be evaluated later when their operational tradeoffs are understood. A Cloudflare adapter would convert the backend playback session into the supported Stream player/HLS input; it does not change the player shell.

A Cloudflare Worker is a natural token-endpoint option when Stream is selected, but it requires its own authentication, Firebase-token verification, entitlement check, rate limits, secret storage, logging policy, and billing review.

## Mux option

Use a signed playback policy. The backend signs a JWT using the Mux signing key with the correct playback ID in `sub`, appropriate `aud`, short `exp`, and signing-key identifier in `kid`. The private key stays only in backend secret storage. Evaluate playback restriction/referrer validation, refresh the session before expiry, and implement a Mux adapter that consumes the returned signed session without changing course UI or schema.

## Backend choices and decision gate

- Firebase/Google Cloud serverless backend integrates naturally with Firebase tokens but normally requires accepting billing/Blaze before deployment.
- Cloudflare Worker pairs well with Cloudflare Stream, subject to plan, quota, and security review.
- A dedicated backend offers provider neutrality and operational control but adds hosting and maintenance.
- Use a Mux-supported server runtime/library in any of the above; signing must remain server-side.

No token backend, provider SDK, paid account, asset, secret, Cloud Function, Cloud Run service, Worker, Stream resource, Mux resource, or Storage bucket is implemented in the current phase. Provider selection and billing require a separate explicit decision.
