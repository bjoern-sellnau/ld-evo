/* V15 „CODE-REGEN“ — fallende Zeichen; im Regen leuchtet der Negativraum auf, der Name rastet ein, Stationen werden entschlüsselt. */
setup({ bpm: 128, bars: 20 });
const CW = 30, CH = 38, COLS = Math.ceil(W / CW), ROWSN = Math.ceil(H / CH);
const RAIN = '01ABCDEFGHJKLMNPRSTUVWXYZ<>/{}[]=+*#$%&?';
const COLSPEC = Array.from({ length: COLS }, (_, i) => ({ sp: 6 + hash(i * 3.3) * 14, off: hash(i * 7.1) * 60, len: 8 + Math.floor(hash(i * 2.2) * 22) }));
const S0 = 22.5, LX = W / 2, LY = 820; // Negativraum-Maske im Regen
function inLogo(x, y, k) { if (k <= 0) return false; const u = 22 + (x - LX) / (S0 * k), v = 23 + (y - LY) / (S0 * k); return inNeg(u, v); }
function rain(t, logoK = 0, dim = 1) {
  g.fillStyle = '#010401'; g.fillRect(0, 0, W, H);
  g.save(); g.font = font(30, 700, JM); g.textAlign = 'center';
  for (let c = 0; c < COLS; c++) {
    const cs = COLSPEC[c], head = (t * cs.sp + cs.off) % (ROWSN + cs.len + 10);
    for (let r = 0; r < ROWSN; r++) {
      const d = head - r; const x = c * CW + CW / 2, y = r * CH + CH;
      const lit = inLogo(x, y - CH / 3, logoK);
      if ((d < 0 || d > cs.len) && !lit) continue;
      const ch = RAIN[Math.floor(hash(c * 131 + r * 17 + Math.floor(t * (lit ? 4 : 10) + c)) * RAIN.length)];
      const a = lit ? 0.85 : (1 - d / cs.len) * dim;
      g.fillStyle = lit ? `rgba(255,140,50,${a})` : d < 1 ? `rgba(220,255,225,${a})` : `rgba(60,255,120,${a * 0.85})`;
      g.fillText(ch, x, y);
    }
  }
  g.restore();
}
function sRain(t) {
  rain(t, eIO(seg(t, 2.5, 5.5)));
  text('NEGATIVRAUM ERKANNT', W / 2, 1460, { size: 46, weight: 700, fam: JM, align: 'center', color: '#FF9A4D', alpha: seg(t, 5.6, 6.0), glow: 'rgba(255,140,50,0.6)' });
}
function lockText(str, y, size, p, seed, col = '#DFFFE6') {
  const n = str.length, cw = size * 0.62, x0 = W / 2 - (n * cw) / 2;
  for (let i = 0; i < n; i++) { const ch = str[i]; if (ch === ' ') continue; const at = i / n * 0.7, done = p > at + 0.3; const c2 = done ? ch : RAIN[Math.floor(hash(seed + i + Math.floor(p * 40)) * RAIN.length)]; text(c2, x0 + i * cw + cw / 2, y, { size, weight: 700, fam: JM, align: 'center', color: done ? col : 'rgba(60,255,120,0.7)', glow: done ? 'rgba(80,255,140,0.8)' : undefined, glowSize: 20, alpha: p > at - 0.1 ? 1 : 0 }); }
}
function sName(t) {
  const lt = t - bar(4);
  rain(t, 1, 0.55);
  g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, 1180, W, 420);
  lockText('BJÖRN', 1330, 140, seg(lt, 0.2, 2.2), 11);
  lockText('SELLNAU', 1500, 140, seg(lt, 0.8, 2.8), 23);
}
function sDecrypt(t) {
  const lt = t - bar(8), per = 10 * BAR / KEY.length, i = clamp(Math.floor(lt / per), 0, KEY.length - 1), f = (lt - i * per) / per, s = KEY[i];
  rain(t, 0.6, 0.45);
  g.fillStyle = 'rgba(0,10,2,0.82)'; rr(60, 1080, W - 120, 520, 20); g.fill(); g.strokeStyle = 'rgba(60,255,120,0.6)'; g.lineWidth = 2; g.stroke();
  text(`> decrypt station_${pad2(i + 1)}.dat`, 100, 1150, { size: 32, weight: 600, fam: JM, color: '#7CFF9B' });
  text(scramble(s.d, seg(f, 0.05, 0.4), i * 3, Math.floor(t * 24)), 100, 1240, { size: 44, weight: 700, fam: JM, color: '#FF9A4D' });
  text(scramble(s.t.toUpperCase(), seg(f, 0.1, 0.55), i * 7, Math.floor(t * 24)), 100, 1340, { size: fit(s.t.toUpperCase(), W - 200, 64, 700, JM), weight: 700, fam: JM, color: '#DFFFE6', glow: 'rgba(80,255,140,0.7)', glowSize: 16 });
  const sub = s.k === 'award' ? 'GOLD · BEST OF SWISS WEB 2017 · MOBILE' : s.s.toUpperCase();
  text(scramble(sub, seg(f, 0.25, 0.75), i * 11, Math.floor(t * 24)), 100, 1420, { size: fit(sub, W - 200, 30, 600, JM), weight: 600, fam: JM, color: '#9DFFB4' });
  g.fillStyle = 'rgba(60,255,120,0.25)'; g.fillRect(100, 1500, W - 200, 14); g.fillStyle = '#3CFF78'; g.fillRect(100, 1500, (W - 200) * eIO(clamp(f * 1.4)), 14);
  text(f > 0.7 ? 'ENTSCHLÜSSELT ✔' : 'ENTSCHLÜSSELE …', 100, 1560, { size: 28, weight: 600, fam: JM, color: f > 0.7 ? '#3CFF78' : '#7CFF9B' });
  text(`${pad2(i + 1)} / ${KEY.length}`, W - 100, 1150, { size: 30, weight: 600, fam: JM, align: 'right', color: '#7CFF9B' });
}
function sExit(t) {
  const lt = t - bar(18);
  rain(t, 1, 0.3 * (1 - seg(lt, 0, 2)));
  text('loona-designs.de', W / 2, 1420, { size: 70, weight: 700, fam: JM, align: 'center', color: '#DFFFE6', glow: 'rgba(80,255,140,0.8)', alpha: seg(lt, 0.2, 0.6) });
  text('Das Web. Meine Leidenschaft.', W / 2, 1510, { size: 40, weight: 600, fam: IS, align: 'center', color: '#FF9A4D', alpha: seg(lt, 0.5, 0.9) });
  text('linkedin.com/in/bjoern-sellnau', W / 2, 1580, { size: 32, weight: 600, fam: JM, align: 'center', color: '#7CFF9B', alpha: seg(lt, 0.8, 1.2) });
}
start({
  id: '15', title: 'Code-Regen',
  scenes: [[0, sRain], [4, sName], [8, sDecrypt], [18, sExit]],
  trans: { 8: 'pixel' }, tcol: '#3CFF78', finish: { grain: 0.05, vignette: 0.55 },
  music: { prog: [[52, 55, 59], [52, 55, 59], [48, 52, 55], [50, 53, 57]], roots: [40, 40, 36, 38], sec: (b) => (b < 4 ? 'intro' : b < 8 ? 'main' : b < 18 ? 'drop' : b < 19 ? 'outro' : 'end'), drums: 'house', bass: 'saw8', arp: 'square', arpSteps: 16, arpDrop: 16, arpGain: 0.022, arpGainDrop: 0.028, arpCut: 2200, cut: 900, cutDrop: 1800, booms: [4, 8, 18], risers: [4, 8], introDrums: 'none' },
});
