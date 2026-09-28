import { createHmac, randomBytes } from 'node:crypto';

/**
 * TOTP nach RFC 6238 (HMAC-SHA1, 30 s, 6 Stellen) — kompatibel mit gängigen Authenticator-Apps.
 * Base32 nach RFC 4648 ohne Padding (so erwarten es die Apps im otpauth-URI).
 */
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const i = B32.indexOf(ch);
    if (i < 0) throw new Error('Ungültiges Base32');
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** HOTP (RFC 4226, Abschnitt 5.3): dynamisches Abschneiden des HMAC. */
export function hotp(key: Uint8Array, counter: number, digits = 6): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac('sha1', key).update(msg).digest();
  const o = h[h.length - 1] & 0xf;
  const bin = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(bin % 10 ** digits).padStart(digits, '0');
}

export const STEP = 30;

export const stepAt = (ms: number) => Math.floor(ms / 1000 / STEP);

/**
 * Code prüfen: aktuelles Zeitfenster ±1 (Uhrenabweichung). Liefert das getroffene Fenster oder null.
 * `lastStep`: zuletzt verwendetes Fenster → derselbe Code kann nicht zweimal benutzt werden (Replay).
 */
export function verifyTotp(key: Uint8Array, code: string, now = Date.now(), lastStep = -1): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const cur = stepAt(now);
  for (const s of [cur - 1, cur, cur + 1]) if (s > lastStep && hotp(key, s) === code) return s;
  return null;
}

export function newTotpSecret(): string {
  return base32Encode(randomBytes(20)); // 160 Bit, wie in RFC 4226 empfohlen
}

export function otpauthUri(secret: string, account: string, issuer = 'LD Flow'): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/** Wiederherstellungscodes: 10 × „xxxx-xxxx“ (Kleinbuchstaben/Ziffern ohne Verwechsler). */
export function newRecoveryCodes(n = 10): string[] {
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: n }, () => {
    const b = randomBytes(8);
    const s = [...b].map((x) => abc[x % abc.length]).join('');
    return `${s.slice(0, 4)}-${s.slice(4)}`;
  });
}
