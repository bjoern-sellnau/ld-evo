import { describe, expect, it } from 'vitest';
import { base32Decode, base32Encode, hotp, verifyTotp } from '@/cms/totp';

// Testvektoren aus RFC 6238, Anhang B (SHA1, Schlüssel "12345678901234567890", 8 Stellen)
const KEY = Buffer.from('12345678901234567890', 'ascii');
const RFC: [number, string][] = [
  [59, '94287082'],
  [1111111109, '07081804'],
  [1111111111, '14050471'],
  [1234567890, '89005924'],
  [2000000000, '69279037'],
  [20000000000, '65353130'],
];

describe('TOTP (RFC 6238)', () => {
  it('erfüllt die Testvektoren aus RFC 6238 Anhang B', () => {
    for (const [t, code] of RFC) expect(hotp(KEY, Math.floor(t / 30), 8), `T=${t}`).toBe(code);
  });

  it('HOTP-Testvektoren aus RFC 4226 Anhang D', () => {
    expect([0, 1, 2, 9].map((c) => hotp(KEY, c))).toEqual(['755224', '287082', '359152', '520489']);
  });

  it('Base32 hin und zurück (RFC 4648: "foobar" → MZXW6YTBOI)', () => {
    expect(base32Encode(Buffer.from('foobar'))).toBe('MZXW6YTBOI');
    expect(base32Decode('MZXW6YTBOI').toString()).toBe('foobar');
  });

  it('akzeptiert ±1 Zeitfenster, verhindert Wiederverwendung', () => {
    const now = 1234567890 * 1000;
    const step = Math.floor(1234567890 / 30);
    const code = hotp(KEY, step);
    expect(verifyTotp(KEY, code, now)).toBe(step);
    expect(verifyTotp(KEY, hotp(KEY, step - 1), now)).toBe(step - 1);
    expect(verifyTotp(KEY, hotp(KEY, step - 2), now)).toBeNull();
    expect(verifyTotp(KEY, code, now, step)).toBeNull(); // schon benutzt
    expect(verifyTotp(KEY, '12345', now)).toBeNull();
  });
});
