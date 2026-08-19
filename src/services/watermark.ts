export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'người dùng';
  return `${local.slice(0, 2)}***@${domain}`;
}

export function createWatermarkSessionCode(uid: string, nonce: string = crypto.randomUUID()): string {
  let hash = 2166136261;
  for (const char of `${uid}:${nonce}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `S-${(hash >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(0, 7)}`;
}

export function getWatermarkPosition(index: number): WatermarkPosition {
  return (['top-left', 'bottom-right', 'top-right', 'bottom-left'] as const)[Math.abs(index) % 4];
}
