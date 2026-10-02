# Loona! Designs — Site V2 Spezifikation (Stand: User-Brief 04.07.2026)

## Navigation (global)
- Menü: **Hallo · Projekte · Über mich · Labs · .Tech · Impressum**
- Toggles in der Nav: **Light/Dark**, **Suche** (Search-Toggle), **Animationen an/aus**
- **Kontakt-Button → öffnet Panel** mit: Formular, GitHub, LinkedIn
- Look: **Liquid Glass** (Apple-Style — stärkere Transluzenz, Licht-Highlights/Refraktion, weiche Tiefe) statt einfachem Blur

## Hero (Startseite „Hallo")
- Ziel: richtig cooler Hero-Bereich
- Claim bleibt: **„Das Web. Meine Leidenschaft."**
- **Stripe-Texteffekt**: Wo Text über der Wave-Animation liegt, wechselt er die Farbe (Overlap-Einfärbung, z. B. zweite Textebene + clip/blend, Kontrast beachtet)
- Titel/Rollen unterbringen (z. B. Rotation/Typing):
  - „Senior Full-Stack / Software Engineer — React, TypeScript, Web & Mobile"
  - „#TeamMaterna — Public Sector | E-Government | Zoll"
  - Rollen: Senior React Engineer · React Native Engineer · Senior Fullstack · IT Ausbilder
- **Repo-Anzahl raus** (unwichtig), **Stack raus** aus Start (gehört auf Über-mich)

## Startseite Struktur
1. Hero
2. Kleine **Featured-Section**
3. **News-Section** — Artikel aus dem Blog (.Tech), pinned/featured

## Über mich
- **Storytelling, Split-Layout**: links Bild **(fixed)**, rechts Content
- Rechts daneben kleine **Sprung-Navigation** (Anchors zu Bereichen); darf Content nicht verdecken → Content bekommt padding-right
- Bereiche: **Intro · Vita · Werkzeuge · Skills · Zertifikate · Stationen (Lebenslauf)**
- Stationen im **LinkedIn-Artikel-Stil**: pro Firma **mehrere Projekte** möglich, je Projekt: kleine Beschreibung + **Techstack als Bento-Grid**
- Beim Bereichswechsel wird das **linke Bild ausgetauscht** (manche Bereiche haben eigene Bilder)
- Ganz unten: **Loona! Designs** — war 1 Jahr Firma, primär Portfolio-Plattform

## Projekte & Labs (gleiches Design)
- Großer **Hero mit Slider** durch Featured-Projekte
- Darunter **Grid mit Filter**
- **Detailseiten** = Case Studies: großer Hero + Storytelling-Bereiche (wie Über-mich)

## .Tech (Blog)
- Übersicht: **Magazin-Grid**
- Detailseiten: schöner Hero, klassischer Blog-Artikel-Aufbau

## Detailseiten-Hintergrund (Projekte/Labs/.Tech)
- Logik wie **iPadOS 27 Apple-Music-Playlist**: Cover auslesen → Farben extrahieren (**Flächenfarbe, kein Verlauf**), **Kontrast prüfen** → Text automatisch weiß/schwarz (Canvas-Pixel-Extraktion + Luminanz)

## Impressum
- Eigene Seite; Inhalte von loona-designs.de/impressum.htm vorhanden (Björn Sellnau, Berlin, info@loona-designs.de, DSGVO-Text)

## Vorhandene echte Daten (recherchiert)
- 18+ Jahre Web Engineer (seit 09/2007 PIXELTEX), Code-b 05/2020–01/2026, Materna seit 05/2026 (Senior Developer, Public Sector/E-Government/Zoll)
- 10 Zertifikate (3× Stripe 12/2024, 2× Anthropic 03/2026, Scaly KI-Spezialist 11/2025, AEVO IHK 03/2019, StrongLoop 08/2015, Adobe CF8 06/2010, ITA 06/2002)
- KI-Projekte 2026: Corefall (spielbar: bjoern-sellnau.github.io/core-fall/), Covert Operations (spielbar: bjoern-sellnau.github.io/Covert-Operations/), CO Arena, Death Grid 3D, LD WorkBench, LD Buddy
- Kontakt: info@loona-designs.de · LinkedIn /in/bjoern-sellnau · GitHub bjoern-sellnau · X @bjoern_sellnau
- Offen: Blog-Artikel für .Tech (Quelle? dev.to leer), Bilder für Über-mich-Split (User liefern lassen), Projekt-Cover für Farb-Extraktion
