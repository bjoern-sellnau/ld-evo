/* Trailer rendern: Bilder aus dem Canvas (REEL.frame) per Playwright abgreifen und mit ffmpeg zu MP4 zusammensetzen.

   node render.mjs <30|60|90|120|300> <cine|drive|calm|action|trance|hard|euro|rave|demo> <de|en> [Ausgabeordner]
   (30 Sekunden nur für trance, hard, euro, rave und demo)

   Umgebungsvariablen (optional):
     PLAYWRIGHT  Pfad/Name des Playwright-Moduls (Standard: "playwright")
     CHROMIUM    Pfad zum Chromium (Standard: der von Playwright)
     CRF         Qualität libx264 (Standard 22, lange Fassung 23, neue Stimmungen 24), MAXRATE (Standard 4500k, lange Fassung 2200k;
                 neue Stimmungen 3200k bzw. 2000k)

   Die Musik hängt nur von Stimmung und Ablauf ab und wird als WAV zwischengespeichert (<Ausgabe>/.musik/…),
   beide Sprachfassungen teilen sie sich. Lautheit: Verstärkung auf −14 LUFS (gemessen mit ebur128), Begrenzer bei −3 dBFS; die fertige Datei wird nachgemessen und die
   Tonspur bei Bedarf mit tieferem Begrenzer neu kodiert, bis die wahre Spitze unter −1 dBTP liegt. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const [len = '60', mood = 'cine', lang = 'de', outArg] = process.argv.slice(2);
const OUT = path.resolve(outArg ?? path.join(ROOT, '..', 'trailer'));
const NAMES = { cine: 'cinematic', drive: 'treibend', calm: 'ruhig', action: 'action', trance: 'trance', hard: 'hardstyle', euro: 'eurodance', rave: 'rave', demo: 'demoszene' };
const NEW = ['trance', 'hard', 'euro', 'rave', 'demo'];
if (!NAMES[mood] || !['60', '90', '120', '300'].concat(NEW.includes(mood) ? ['30'] : []).includes(len) || !['de', 'en'].includes(lang)) { console.error('Aufruf: node render.mjs <30|60|90|120|300> <cine|drive|calm|action|trance|hard|euro|rave|demo> <de|en> [Ausgabeordner] — 30 nur für die neuen Stimmungen'); process.exit(2); }
const base = `loona-trailer-${len}s-${NAMES[mood]}-${lang}`;
/* Die lange Fassung bekommt eine niedrigere Obergrenze, damit die Datei sicher unter 100 MB bleibt (GitHub-Grenze). Die fünf neuen
   Stimmungen haben sehr unruhige Hintergründe (Laser, Pegelsäulen, Plasma): etwas höherer CRF und engere Obergrenze halten die Dateien klein. */
const FPS = 30, CRF = process.env.CRF ?? (NEW.includes(mood) ? '24' : len === '300' ? '23' : '22'), MAXRATE = process.env.MAXRATE ?? (NEW.includes(mood) ? (len === '300' ? '2000k' : '3200k') : len === '300' ? '2200k' : '4500k');
fs.mkdirSync(path.join(OUT, '.musik'), { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, path.normalize(decodeURIComponent(q.url.split('?')[0])).replace(/^(\.\.[/\\])+/, ''));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' }); r.end(d); } });
}).listen(0, '127.0.0.1');
await new Promise((ok) => srv.once('listening', ok));
const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(`http://127.0.0.1:${srv.address().port}/index.html?len=${len}&mood=${mood}&lang=${lang}`);
const info = await page.evaluate(async () => ({ ready: await REEL.ready, DUR: REEL.DUR, bpm: REEL.bpm, scenes: REEL.scenes, key: REEL.planKey }));
if (errs.length) { console.error('Fehler in der Seite:', errs); process.exit(1); }
const N = Math.round(info.DUR * FPS);
console.log(`${base}: ${info.DUR} s, ${N} Bilder, ${info.bpm} BPM, ${info.ready}`);

/* ---- Musik (einmal je Stimmung + Länge) ---- */
/* Dateiname mit der Kennung des Ablaufs: ändert sich der Ablauf, entsteht die Musik neu; lange Stücke kommen in Scheiben */
const wav = path.join(OUT, '.musik', `musik-${NAMES[mood]}-${len}s-${info.key}.wav`);
if (!fs.existsSync(wav)) {
  const t0 = Date.now(), total = await page.evaluate(() => REEL.musicStore()), STEP = 8 * 1024 * 1024, parts = [];
  for (let a = 0; a < total; a += STEP) parts.push(Buffer.from(await page.evaluate(([x, y]) => REEL.musicSlice(x, y), [a, Math.min(total, a + STEP)]), 'base64'));
  fs.writeFileSync(wav, Buffer.concat(parts));
  console.log(`  Musik gerendert (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
/* Lautheit: erst messen, dann mit Begrenzer noch einmal messen und die Verstärkung nachziehen (Ziel −14 LUFS) */
/* Ansprechzeit 5 ms: bei 1 ms regelt der Begrenzer so hart, dass AAC die Kanten mit Überschwingern (bis über 0 dBTP) wiedergibt */
const LIMITER = 'alimiter=limit=0.7:level=false:attack=5:release=60';
const lufs = (af) => { const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', wav, '-af', `${af}ebur128`, '-f', 'null', '-'], { encoding: 'utf8' }).stderr; return parseFloat((e.match(/I:\s+(-?[\d.]+) LUFS/g) ?? []).pop()?.match(/-?[\d.]+/)?.[0] ?? '-16'); };
const g1 = -14 - lufs('');
const gain = (g1 + (-14 - lufs(`volume=${g1.toFixed(2)}dB,${LIMITER},`))).toFixed(2);

/* ---- Bilder → ffmpeg ---- */
const mp4 = path.join(OUT, `${base}.mp4`);
const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
  '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-maxrate', MAXRATE, '-bufsize', `${parseInt(MAXRATE, 10) * 2}k`, '-profile:v', 'high', '-g', String(FPS * 2),
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-af', `volume=${gain}dB,${LIMITER}`, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
  '-t', String(info.DUR), '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((ok, no) => ff.on('close', (c) => (c === 0 ? ok() : no(new Error(`ffmpeg ${c}`)))));
const t0 = Date.now(), BATCH = 6;
for (let i = 0; i < N; i += BATCH) {
  const ts = []; for (let k = i; k < Math.min(N, i + BATCH); k++) ts.push(k / FPS);
  const frames = await page.evaluate(async (ts) => { const out = []; for (const t of ts) out.push(await REEL.frame(t)); return out; }, ts);
  for (const f of frames) if (!ff.stdin.write(Buffer.from(f, 'base64'))) await new Promise((ok) => ff.stdin.once('drain', ok));
  if (i % 600 === 0 && i) console.log(`  ${base}: ${i}/${N} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
ff.stdin.end();
await done;

/* ---- Spitzenkontrolle ---- */
/* AAC kann an sehr dichten Stellen (Wirbel + Riser + Einschlag) über den Begrenzer hinausschwingen. Liegt die wahre Spitze der fertigen
   Datei (True Peak, ebur128) über −1 dBTP, wird nur die Tonspur mit tieferem Begrenzer neu kodiert — das Bild bleibt (-c:v copy). */
const peakOf = (f) => { const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', f, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; return parseFloat((e.match(/Peak:\s+(-?[\d.]+) dBFS/g) ?? []).pop()?.match(/-?[\d.]+/)?.[0] ?? '0'); };
for (let n = 0, lim = 0.7; n < 3; n++) {
  const pk = peakOf(mp4); if (pk <= -1) break;
  lim *= 10 ** (-(pk + 1.3) / 20);
  const L = `alimiter=limit=${lim.toFixed(3)}:level=false:attack=5:release=60`, h1 = -14 - lufs(''), h = (h1 + (-14 - lufs(`volume=${h1.toFixed(2)}dB,${L},`))).toFixed(2), tmp = `${mp4}.ton.mp4`;
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', mp4, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', `volume=${h}dB,${L}`, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-t', String(info.DUR), '-movflags', '+faststart', tmp], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('Tonspur nachziehen fehlgeschlagen'); process.exit(1); }
  fs.renameSync(tmp, mp4); console.log(`  ${base}: Spitze ${pk} dBTP → Tonspur mit Begrenzer ${lim.toFixed(3)} neu kodiert`);
}

/* ---- Titelbild: die Anspruch-Szene; die 30-Sekunden-Fassung hat keine, dort der Schluss mit Lockup und Claim ---- */
const sc = info.scenes.find((s) => s.id === 'claim') ?? info.scenes[info.scenes.length - 1];
const cover = await page.evaluate(async (t) => { await REEL.frame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.9).slice(23); }, sc.t0 + sc.D * (sc.id === 'claim' ? 0.8 : 0.7));
fs.writeFileSync(path.join(OUT, `${base}-cover.jpg`), Buffer.from(cover, 'base64'));
if (errs.length) console.error('Fehler in der Seite:', errs);
await browser.close(); srv.close();
console.log(`${base}: fertig in ${((Date.now() - t0) / 1000).toFixed(0)} s, ${(fs.statSync(mp4).size / 1e6).toFixed(1)} MB`);
