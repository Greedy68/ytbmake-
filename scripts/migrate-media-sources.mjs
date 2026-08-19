#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import process from 'node:process';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const apply = process.argv.includes('--apply');
if (!projectId) throw new Error('Set FIREBASE_PROJECT_ID explicitly.');
if (projectId !== 'ymm-academy' && !process.argv.includes('--allow-other-project')) throw new Error('Refusing an unexpected project without --allow-other-project.');

const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;
function parseYouTubeId(input) {
  if (typeof input !== 'string') return null;
  const value = input.trim(); if (youtubeIdPattern.test(value)) return value;
  try { const url = new URL(value); if (url.protocol !== 'https:') return null; const host = url.hostname.toLowerCase(); let id = null;
    if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] ?? null;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.startsWith('/embed/') ? url.pathname.split('/')[2] : null;
    return id && youtubeIdPattern.test(id) ? id : null;
  } catch { return null; }
}

initializeApp({ credential: applicationDefault(), projectId }); const db = getFirestore();
const snapshot = await db.collection('media').get(); const candidates = snapshot.docs.filter((item) => ['sourceId', 'sourceUrl', 'sourcePath', 'sourceType'].some((field) => Object.hasOwn(item.data(), field)));
let migratable = 0; let invalid = 0; let alreadyMigrated = 0;
for (const item of candidates) { const data = item.data(); const sourceId = parseYouTubeId(data.sourceId ?? data.sourceUrl ?? data.sourcePath ?? ''); if (!sourceId) { invalid += 1; continue; } const existing = await db.collection('mediaSources').doc(item.id).get(); if (existing.exists && existing.data()?.provider === 'youtube' && existing.data()?.sourceId === sourceId) alreadyMigrated += 1; else migratable += 1; }
console.log(JSON.stringify({ projectId, mode: apply ? 'apply' : 'dry-run', scanned: snapshot.size, legacyCandidates: candidates.length, migratable, alreadyMigrated, invalid }));
if (!apply || migratable === 0) process.exit(0);
const prompt = createInterface({ input: process.stdin, output: process.stdout }); const confirmation = await prompt.question(`Type MIGRATE to update ${migratable} document(s) in ${projectId}: `); prompt.close(); if (confirmation !== 'MIGRATE') throw new Error('Migration cancelled.');

let migrated = 0;
for (const item of candidates) {
  const data = item.data(); const sourceId = parseYouTubeId(data.sourceId ?? data.sourceUrl ?? data.sourcePath ?? ''); if (!sourceId) continue;
  const sourceRef = db.collection('mediaSources').doc(item.id);
  await sourceRef.set({ provider: 'youtube', sourceId, sourceType: 'unlisted', updatedAt: FieldValue.serverTimestamp(), updatedBy: data.createdBy ?? 'migration' }, { merge: true });
  const verified = await sourceRef.get(); if (!verified.exists || verified.data()?.sourceId !== sourceId || verified.data()?.provider !== 'youtube') throw new Error('Source verification failed; legacy fields were preserved.');
  await item.ref.update({ provider: 'youtube', sourceConfigured: true, sourceId: FieldValue.delete(), sourceUrl: FieldValue.delete(), sourcePath: FieldValue.delete(), sourceType: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() });
  migrated += 1;
}
console.log(JSON.stringify({ projectId, migrated, verified: migrated, legacyFieldsRemovedAfterVerification: migrated }));
