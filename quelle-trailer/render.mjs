/* Trailer rendern: Bilder aus dem Canvas (REEL.frame) per Playwright abgreifen und mit ffmpeg zu MP4 zusammensetzen.

   node render.mjs <30|60|90|120|300> <cine|drive|calm|action|trance|hard|euro|rave|demo|old|b97|b99|b2k|b01|b03|b05|ka|kb> <de|en> [Ausgabeordner]
   (30 Sekunden nicht für cine, drive, calm und action; die Kino-Trailer ka und kb nur 30 bis 120 Sekunden)

   Umgebungsvariablen (optional):
     PLAYWRIGHT  Pfad/Name des Playwright-Moduls (Standard: "playwright")
     CHROMIUM    Pfad zum Chromium (Standard: der von Playwright)
     CRF         Qualität libx264 (Standard 22, lange Fassung 23, neue Stimmungen 24), MAXRATE (Standard 4500k, lange Fassung 2200k;
                 neue Stimmungen 3200k bzw. 2000k)
     GENRE       Genre-Fassung der Kino-Trailer ka/kb: action, thriller, comedy, horror, epos, helden, countdown (Dateiname …-kino-…-<genre>-…)
     NUR_TON=1   nur die Tonspur einer vorhandenen Datei neu abmischen – das Bild bleibt unverändert (-c:v copy)

   Die Musik hängt nur von Stimmung und Ablauf ab und wird als WAV zwischengespeichert (<Ausgabe>/.musik/…),
   beide Sprachfassungen teilen sie sich. Lautheit: Verstärkung auf −14 LUFS (gemessen mit ebur128, mit Begrenzer bis zu viermal nachgezogen), Begrenzer bei −3 dBFS; die fertige
   Datei wird nachgemessen und die Tonspur bei Bedarf neu kodiert (ohne Rauschersatz des AAC-Kodierers, notfalls mit tieferem Begrenzer),
   bis die wahre Spitze unter −1 dBTP liegt. Passt es dann nicht, bricht das Skript mit Fehler ab. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const [len = '60', mood = 'cine', lang = 'de', outArg] = process.argv.slice(2);
const OUT = path.resolve(outArg ?? path.join(ROOT, '..', 'trailer'));
const NAMES = { cine: 'cinematic', drive: 'treibend', calm: 'ruhig', action: 'action', trance: 'trance', hard: 'hardstyle', euro: 'eurodance', rave: 'rave', demo: 'demoszene', old: 'demo90', b97: 'benchmark97', b2k: 'benchmark2000', b99: 'benchmark99', b01: 'benchmark2001', b03: 'benchmark2003', b05: 'benchmark2005', ka: 'kino-ueber-mich', kb: 'kino-ld-beyond' };
const NEW = ['trance', 'hard', 'euro', 'rave', 'demo', 'old', 'b97', 'b2k', 'b99', 'b01', 'b03', 'b05'];
/* Die beiden Kino-Trailer gibt es in 30, 60, 90 und 120 Sekunden */
const KINO = ['ka', 'kb'];
/* Genre-Fassungen der Kino-Trailer über die Umgebungsvariable GENRE (action, thriller, comedy, horror, epos, helden) */
const GENRES = { action: 'action', thriller: 'thriller', comedy: 'komoedie', horror: 'horror', epos: 'epos', helden: 'helden', countdown: 'countdown' };
const genre = process.env.GENRE ?? '';
if (genre && (!GENRES[genre] || !KINO.includes(process.argv[3]))) { console.error('GENRE: action, thriller, comedy, horror, epos, helden oder countdown — nur für die Kino-Trailer ka und kb'); process.exit(1); }
if (!NAMES[mood] || !(KINO.includes(mood) ? ['30', '60', '90', '120'] : ['60', '90', '120', '300'].concat(NEW.includes(mood) ? ['30'] : [])).includes(len) || !['de', 'en'].includes(lang)) { console.error('Aufruf: node render.mjs <30|60|90|120|300> <cine|drive|calm|action|trance|hard|euro|rave|demo|old|b97|b99|b2k|b01|b03|b05> <de|en> [Ausgabeordner] — 30 nicht für cine, drive, calm, action'); process.exit(2); }
const base = `loona-trailer-${len}s-${NAMES[mood]}${genre ? `-${GENRES[genre]}` : ''}-${lang}`;
/* Die lange Fassung bekommt eine niedrigere Obergrenze, damit die Datei sicher unter 100 MB bleibt (GitHub-Grenze). Die fünf neuen
   Stimmungen haben sehr unruhige Hintergründe (Laser, Pegelsäulen, Plasma): etwas höherer CRF und engere Obergrenze halten die Dateien klein. */
const FPS = 30, CRF = process.env.CRF ?? (NEW.includes(mood) ? '24' : len === '300' || KINO.includes(mood) ? '23' : '22'), MAXRATE = process.env.MAXRATE ?? (NEW.includes(mood) ? (len === '300' ? '2000k' : '3200k') : len === '300' ? '2200k' : KINO.includes(mood) ? '3600k' : '4500k');
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
await page.goto(`http://127.0.0.1:${srv.address().port}/index.html?len=${len}&mood=${mood}&lang=${lang}${genre ? `&g=${genre}` : ''}`);
const info = await page.evaluate(async () => ({ ready: await REEL.ready, DUR: REEL.DUR, bpm: REEL.bpm, scenes: REEL.scenes, key: REEL.planKey }));
if (errs.length) { console.error('Fehler in der Seite:', errs); process.exit(1); }
const N = Math.round(info.DUR * FPS);
console.log(`${base}: ${info.DUR} s, ${N} Bilder, ${info.bpm} BPM, ${info.ready}`);

/* ---- Musik (einmal je Stimmung + Länge) ---- */
/* Dateiname mit der Kennung des Ablaufs: ändert sich der Ablauf, entsteht die Musik neu; lange Stücke kommen in Scheiben */
const wav = path.join(OUT, '.musik', `musik-${NAMES[mood]}${genre ? `-${GENRES[genre]}` : ''}-${len}s-${info.key}.wav`);
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
/* Der Begrenzer nimmt gerade den lauten Stellen Pegel, die die Lautheit bestimmen — bei Stücken mit großen Sprüngen (Schreck-Akzente der
   Horror-Fassung) reicht ein Nachziehen nicht. Deshalb bis zu viermal messen und nachziehen, bis −14 LUFS auf 0,15 genau getroffen sind. */
/* (Im Spitzen-Nachlauf weiter unten wird bewusst nur einmal nachgezogen: dort zählt die Spitze, und mehrfaches Nachziehen triebe den
   Pegel wieder in den Begrenzer — die Lautheit darf dann bis 0,8 LU unter dem Ziel bleiben.) */
const gainFor = (lim) => { let gd = -14 - lufs(''); for (let i = 0; i < 4; i++) { const l = lufs(`volume=${gd.toFixed(2)}dB,${lim},`); if (Math.abs(l + 14) < 0.15) break; gd += -14 - l; } return gd.toFixed(2); };
const gain = gainFor(LIMITER);

/* ---- Bilder → ffmpeg ---- */
const mp4 = path.join(OUT, `${base}.mp4`);
const t0 = Date.now();
if (process.env.NUR_TON) {
  /* Nur der Ton: dieselbe Abmischung wie beim vollen Lauf, das Bild der vorhandenen Datei wird übernommen */
  if (!fs.existsSync(mp4)) { console.error(`NUR_TON: ${mp4} fehlt`); process.exit(1); }
  const tmp = `${mp4}.ton.mp4`;
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', mp4, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', `volume=${gain}dB,${LIMITER}`, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-t', String(info.DUR), '-movflags', '+faststart', tmp], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('Tonspur neu abmischen fehlgeschlagen'); process.exit(1); }
  fs.renameSync(tmp, mp4);
} else {
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
    '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-maxrate', MAXRATE, '-bufsize', `${parseInt(MAXRATE, 10) * 2}k`, '-profile:v', 'high', '-g', String(FPS * 2),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-af', `volume=${gain}dB,${LIMITER}`, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
    '-t', String(info.DUR), '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, no) => ff.on('close', (c) => (c === 0 ? ok() : no(new Error(`ffmpeg ${c}`)))));
  const BATCH = 6;
  for (let i = 0; i < N; i += BATCH) {
    const ts = []; for (let k = i; k < Math.min(N, i + BATCH); k++) ts.push(k / FPS);
    const frames = await page.evaluate(async (ts) => { const out = []; for (const t of ts) out.push(await REEL.frame(t)); return out; }, ts);
    for (const f of frames) if (!ff.stdin.write(Buffer.from(f, 'base64'))) await new Promise((ok) => ff.stdin.once('drain', ok));
    if (i % 600 === 0 && i) console.log(`  ${base}: ${i}/${N} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await done;
}

/* ---- Spitzenkontrolle ---- */
/* Der AAC-Kodierer von ffmpeg ersetzt rauschhafte Bänder durch eigenes Rauschen (PNS). An sehr dichten Stellen (Wirbel + Riser + Einschlag)
   schwingt das über den Begrenzer hinaus – gemessen bis +5,7 dB über der Spitze vor dem Kodieren, und ein tieferer Begrenzer hilft dagegen
   nicht verlässlich (die Stelle wandert, der Ausreißer bleibt). Liegt die wahre Spitze der fertigen Datei (True Peak, ebur128) über −1 dBTP,
   wird deshalb nur die Tonspur neu kodiert, das Bild bleibt (-c:v copy): zuerst ohne PNS bei gleichem Begrenzer, erst danach zusätzlich mit
   tieferem Begrenzer. Zum Schluss wird nachgemessen – passt es nach drei Versuchen nicht, bricht das Skript ab, statt eine ungeprüfte Datei
   liegen zu lassen. */
const messen = (f) => { const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', f, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; const z = (re) => parseFloat((e.match(re) ?? []).pop()?.match(/-?[\d.]+/)?.[0] ?? '0'); return [z(/I:\s+(-?[\d.]+) LUFS/g), z(/Peak:\s+(-?[\d.]+) dBFS/g)]; };
for (let n = 0, lim = 0.7; ; n++) {
  const [laut, pk] = messen(mp4);
  if (pk <= -1 && Math.abs(laut + 14) <= 0.8) break;
  if (n === 3 || pk <= -1) { console.error(`${base}: ${laut} LUFS, Spitze ${pk} dBTP – außerhalb der Vorgabe (−14 LUFS ± 0,8, höchstens −1 dBTP)`); process.exit(1); }
  if (n) lim *= 10 ** (-(pk + 1.3) / 20);
  const L = `alimiter=limit=${lim.toFixed(3)}:level=false:attack=5:release=60`, h1 = -14 - lufs(''), h = (h1 + (-14 - lufs(`volume=${h1.toFixed(2)}dB,${L},`))).toFixed(2), tmp = `${mp4}.ton.mp4`;
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', mp4, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', `volume=${h}dB,${L}`, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-aac_pns', '0', '-t', String(info.DUR), '-movflags', '+faststart', tmp], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('Tonspur nachziehen fehlgeschlagen'); process.exit(1); }
  fs.renameSync(tmp, mp4); console.log(`  ${base}: Spitze ${pk} dBTP → Tonspur ohne PNS mit Begrenzer ${lim.toFixed(3)} neu kodiert`);
}

/* ---- Titelbild: die Anspruch-Szene; die 30-Sekunden-Fassung hat keine, dort der Schluss mit Lockup und Claim; Kino-Trailer: der Titel ---- */
const sc = info.scenes.find((s) => s.id === 'claim') ?? (KINO.includes(mood) ? info.scenes.find((s) => s.id === 'title') : null) ?? info.scenes[info.scenes.length - 1];
const cover = await page.evaluate(async (t) => { await REEL.frame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.9).slice(23); }, sc.t0 + sc.D * (sc.id === 'claim' ? 0.8 : 0.7));
fs.writeFileSync(path.join(OUT, `${base}-cover.jpg`), Buffer.from(cover, 'base64'));
if (errs.length) console.error('Fehler in der Seite:', errs);
await browser.close(); srv.close();
console.log(`${base}: fertig in ${((Date.now() - t0) / 1000).toFixed(0)} s, ${(fs.statSync(mp4).size / 1e6).toFixed(1)} MB`);
