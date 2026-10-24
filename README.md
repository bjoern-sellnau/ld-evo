# Intro-Reel „Björn Sellnau“

Eigener Branch nur für das Video — getrennt von der Website (kein Website-Code, keine CI).

| Datei | Format | Größe |
| --- | --- | --- |
| [`bjoern-sellnau-reel.mp4`](bjoern-sellnau-reel.mp4) | 1080×1920, 36 s, 30 fps, H.264 + AAC, −14 LUFS | 26 MB (beste Qualität) |
| [`bjoern-sellnau-reel-1080p-klein.mp4`](bjoern-sellnau-reel-1080p-klein.mp4) | 1080×1920, stärker komprimiert | 6,7 MB |
| [`bjoern-sellnau-reel-720p.mp4`](bjoern-sellnau-reel-720p.mp4) | 720×1280 | 3,4 MB |
| [`bjoern-sellnau-reel-cover.jpg`](bjoern-sellnau-reel-cover.jpg) | Titelbild 1080×1920 | 0,1 MB |

Herunterladen: Datei anklicken → „Download raw file“.

## Ablauf (112 BPM, Schnitte auf dem Beat)

1. Terminal: `whoami` → `bjoern-sellnau`, `cat ~/about.txt`
2. **Björn Sellnau.** — Senior Full-Stack / Software Engineer · Berlin · seit 2007
3. Stack, ein Wort pro Beat: React, Next.js, TypeScript, Node.js, React Native, GraphQL, Stripe, Claude Code
4. 604.238.400 Sekunden im Dienst des Webs (seit 01.09.2007) · 18+ Jahre · 10 Zertifikate
5. Die Reise 2002 → 2026 (ITA-Ausbildung, Flash-Game, Yayci, ld2006, PIXELTEX, OpenBooking, IHK-Ausbilder, Code-b, Materna)
6. Zertifikate (Anthropic, Scaly Academy, Stripe, IHK/AEVO, StrongLoop, Adobe)
7. Labs 2026 — gebaut mit Claude Code (Corefall, Covert Operations, Arena, Death Grid 3D, LD WorkBench, LD Buddy)
8. Die neue loona-designs.de (LD Beyond)
9. Outro: „Das Web. Meine Leidenschaft.“ · loona-designs.de · LinkedIn · GitHub

**Quellen:** loona-designs.de (Startseite, Über mich, Portfolio; Stand 10/2026) und die Inhalte der neuen Website.
**Musik:** im Browser synthetisiert (Web Audio) — keine fremden Rechte. Bilder: eigene Projekt-Screenshots und LD-Logo.
**Schriften:** Space Grotesk, Instrument Sans, JetBrains Mono (SIL Open Font License).

## Quelle neu rendern

`quelle/reel.html` zeichnet jedes Bild deterministisch (`REEL.frame(t)`) und erzeugt die Musik (`REEL.music()`).
Den Ordner `quelle/` über einen lokalen Server öffnen (z. B. `python3 -m http.server`), dann die Bilder per
Playwright abgreifen und mit ffmpeg zu MP4 zusammensetzen (30 fps, libx264, AAC).
