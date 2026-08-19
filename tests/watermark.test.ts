import { describe, expect, it } from 'vitest';
import { createWatermarkSessionCode, getWatermarkPosition, maskEmail } from '../src/services/watermark';

describe('watermark utilities', () => {
  it('masks email and never returns the full identity', () => {
    const email = 'name@example.com'; const uid = 'full-firebase-uid-private';
    expect(maskEmail(email)).toBe('na***@example.com');
    const code = createWatermarkSessionCode(uid, 'fixed-nonce');
    expect(code).toMatch(/^S-[A-Z0-9]{7}$/); expect(code).not.toContain(uid); expect(code).not.toContain(email);
  });
  it('rotates deterministically through safe positions', () => {
    expect([0, 1, 2, 3, 4].map(getWatermarkPosition)).toEqual(['top-left', 'bottom-right', 'top-right', 'bottom-left', 'top-left']);
  });
});
