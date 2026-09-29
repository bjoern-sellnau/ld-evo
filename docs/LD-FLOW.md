# LD Flow. — CMS für loona-designs

LD Flow ist das in die Site eingebaute CMS: WYSIWYG-Bearbeitung auf der echten Seite, Entwürfe und Veröffentlichen,
Versionen, Mediathek, frei anlegbare Seiten mit Seitentypen (Templates) sowie Anmeldung mit Rollen.

- Admin: **`/flow`** (eigenes Root-Layout, nie indexiert)
- Entwurfsvorschau: `/flow-preview/<collection>/<id>` (nur angemeldet, sonst 404)
- Medien: `/media/<id>` (mit `?w=640|1280|2400` die verkleinerte WebP-Variante, sonst das Original)
- Frei angelegte Seiten: `/<kennung>`
- Passwort vergessen: `/flow/forgot`, Einmal-Link `/flow/reset?token=…`
- Kontaktformular-Eingang: `POST /api/contact` · Zeitplan-Takt: `POST /flow-cron` (nur mit geheimem Header)
- Besucherzähler: `POST /api/hit` (cookiefrei) · Suchmaschinen: `/sitemap.xml`, `/robots.txt`, Vorschaubilder je Projekt/Artikel

## Architektur

| Schicht | Datei | Aufgabe |
| --- | --- | --- |
| Inhaltsmodell | `src/cms/schema.ts` | Collections, Singletons, Seitentypen, Blöcke, Feldtypen, Validierung, Rich Text (JSON) |
| Speicher | `src/cms/db.ts` | SQLite über das in Node eingebaute `node:sqlite`; Migrationen; Erststart übernimmt `content/*.ts` |
| Anmeldung | `src/cms/auth.ts` | scrypt-Passwörter, Sessions in der DB (nur SHA-256 des Tokens), Rate-Limit, Rollen, Setup-Token |
| Datenzugriff | `src/cms/repo.ts` | Entwurf/Veröffentlichen/Versionen/Medien/Nutzer — **jede Funktion prüft Anmeldung und Rolle selbst** |
| Server Actions | `src/cms/actions.ts` | dünne Hüllen um `repo.ts` + `revalidatePath('/', 'layout')` nach Live-Änderungen |
| Site-Anbindung | `src/cms/content.ts`, `src/site/content/ContentProvider.tsx` | Site-Layout lädt die veröffentlichten Inhalte einmal und gibt sie per Context an die Seiten |
| WYSIWYG | `src/site/cms/editing.tsx`, `PreviewClient.tsx` | `EText`/`ERich` machen Texte in der Vorschau editierbar; ohne Editor rendern sie exakt den bisherigen Text |
| Admin-UI | `src/app/(flow)/…`, `src/cms/ui/*` | Dashboard, Listen, Editor (Formular + Live-Vorschau), Mediathek, Nachrichten, Nutzer, Konto |
| Veröffentlichen/Zeitplan | `src/cms/publish.ts`, `scheduler.ts`, `src/instrumentation.ts` | gemeinsamer Kern `commitPublish()`; Minutentakt veröffentlicht geplante Entwürfe |
| Medien | `src/cms/media.ts`, `src/cms/ui/imageVariants.ts` | Browser rechnet WebP-Varianten, Server prüft sie (Magic Bytes + WebP-Kopf), Site setzt `srcset` |
| Mail/Kontakt | `src/cms/mail.ts`, `src/cms/contact.ts` | optionaler SMTP-Versand; öffentlicher Eingang des Kontaktformulars (Spam-Schutz) |

**Datenfluss beim Bearbeiten:** Formular links ↔ Vorschau-iframe rechts per `postMessage` (nur gleicher Ursprung).
Jede Änderung wird nach 1,2 s als Entwurf gespeichert (⌘S/Strg+S sofort). „Veröffentlichen“ validiert vollständig,
legt die bisherige Live-Fassung als Version ab (max. 30) und erneuert die statisch erzeugte Site.

**Was ist editierbar:** Startseite (Hero-Texte, Rollen, Featured), Über mich (Texte, Werkzeuge, Skills, Zertifikate,
Bilder, Stationen mit Projekten — Rail und Bilder leiten sich daraus ab), Navigation (inkl. eigener Seiten und
externer Links), Impressum & Datenschutz, Projekte & Labs, .Tech-Artikel, Meine Reise (Stationen, Zwischenschritte
mit eigenen Einblick-Bildern) und frei angelegte Seiten. Neue Singletons/Felder ergänzt `backfillSingletons()` auch in
bestehenden Datenbanken (additiv). Im Code bleiben die Struktur der festen Seiten, die mobile Tab-Leiste und die Gestaltung.

**Gleichzeitiges Bearbeiten:** Speichern prüft den bekannten Stand; hat jemand anders dazwischen gespeichert, wird
nicht überschrieben (Banner mit Person/Zeit, „Neu laden“ oder bewusst „Trotzdem speichern“). **Versionen** lassen sich
mit dem aktuellen Stand vergleichen (feldweise, Texte wortweise). **Mediathek:** Suche, „Verwendet in“, Löschschutz,
Varianten für ältere Uploads nachrüsten. **Statistik:** cookiefrei, nur Summen je Tag/Seite und Herkunfts-Domain; ohne
IP, Cookies oder Kennungen; DNT/GPC werden respektiert; eigene Aufrufe pro Browser abschaltbar.

**Planen:** „Planen …“ im Editor prüft vollständig und speichert den Entwurf mit Zeitpunkt; das Dashboard listet
Geplantes. Spätere Entwurfsänderungen gehen mit. Ist der Entwurf zum Zeitpunkt ungültig, bleibt er Entwurf.

## Betrieb

- **Node ≥ 22.13** (für `node:sqlite`; die Warnung „ExperimentalWarning: SQLite“ ist unkritisch, `NODE_NO_WARNINGS=1` blendet sie aus).
- Start als Node-Server: `npm run build && npm start`, oder als Container (`Dockerfile`, `compose.yaml` mit Caddy) —
  Schritt für Schritt in **[DEPLOY.md](DEPLOY.md)**. Ein statischer Export ist mit CMS nicht möglich.
- **Persistentes Verzeichnis** für die Datenbank: standardmäßig `./data/flow.db`, sonst `LDFLOW_DB=/pfad/flow.db`.
  Sie enthält alles inkl. Medien; Sicherung siehe unten. `data/` ist in `.gitignore`.
- **HTTPS** verwenden; Cookies sind in Produktion `Secure`. Nur für Tests ohne TLS: `LDFLOW_INSECURE_COOKIES=1`.
- Hinter einem Reverse-Proxy muss dieser `X-Forwarded-For` setzen (für das Rate-Limit). LD Flow wertet den **letzten**
  Eintrag aus (den der eigene Proxy anhängt) — den App-Port daher nie direkt ins Netz stellen.
- **Überwachung:** `GET /health` (200/503), **Fehler**-Eingang für Admins (Serverfehler gebündelt, optional Mail),
  stündliches Aufräumen abgelaufener Sitzungen, Reset-Links, Sperr-Einträge und verwaister Bildvarianten.

| Variable | Zweck |
| --- | --- |
| `LDFLOW_DB` | Pfad der SQLite-Datei (Standard `./data/flow.db`) |
| `LDFLOW_SETUP_TOKEN` | optional: festes Setup-Token statt der generierten Datei |
| `LDFLOW_INSECURE_COOKIES` | `1` = Cookies ohne `Secure` (nur lokal/Tests) |
| `LDFLOW_PUBLIC_URL` | öffentliche Adresse (Basis für Links in Mails; nie aus dem Host-Header) |
| `LDFLOW_SMTP_URL` | Mailversand: `smtps://nutzer:pass@host:465` oder `smtp://…:587` (STARTTLS erzwungen) |
| `LDFLOW_MAIL_FROM` | Absender, z. B. `LD Flow <flow@loona-designs.de>` |
| `LDFLOW_CONTACT_TO` | optional: Benachrichtigung über neue Kontakt-Nachrichten |
| `LDFLOW_ALERT_TO` | optional: Mail bei neuen Serverfehlern (je Fehler höchstens einmal am Tag, max. 10/Stunde) |
| `LDFLOW_PROXY_HOPS` | Anzahl eigener Proxys vor der App (Standard `1`; `0` = nur `X-Real-IP`) |
| `LDFLOW_TZ` | Zeitzone für Zeitangaben im Dashboard (Standard `Europe/Berlin`) |
| `LDFLOW_SCHEDULER` | `0` = internen Minutentakt aus (externer Cron ruft `POST /flow-cron` mit Header `x-ldflow-cron`) |
| `LDFLOW_CRON_SECRET` | festes Geheimnis für den externen Cron (sonst zufällig je Prozess) |
| `LDFLOW_SCHEDULER_INTERVAL_MS` | Takt in ms (Standard 60000; E2E nutzt 2000) |
| `LDFLOW_SECRET_KEY` | Schlüssel für die verschlüsselten 2FA-Geheimnisse (sonst `flow-secret.key` neben der DB — getrennt sichern!) |

### Sicherung

`npm run backup` sichert die Datenbank im laufenden Betrieb (`VACUUM INTO`, konsistent inkl. WAL), prüft die Kopie
(`integrity_check`, Schema-Version) und behält die neuesten Stände. Schlägt die Prüfung fehl, endet das Skript mit
Fehlercode und die Kopie wird verworfen.

| Variable | Zweck |
| --- | --- |
| `LDFLOW_BACKUP_DIR` | Zielordner (Standard `backups/` neben der DB — besser ein anderes Laufwerk/Volume) |
| `LDFLOW_BACKUP_KEEP` | Anzahl aufbewahrter Stände (Standard 14) |
| `LDFLOW_BACKUP_KEY_DIR` | eigener Ordner für `flow-secret.key` — **nicht** neben den DB-Sicherungen |

Nächtlich per cron (Pfade anpassen; Node ≥ 22.13 im `PATH`):

```cron
15 3 * * * cd /srv/ld-evo && LDFLOW_DB=/srv/data/flow.db LDFLOW_BACKUP_DIR=/mnt/backup/ldflow LDFLOW_BACKUP_KEY_DIR=/root/ldflow-key npm run -s backup >> /var/log/ldflow-backup.log 2>&1
```

Die Sicherungen zusätzlich außer Haus kopieren (z. B. `rclone`/`restic`), den Schlüssel getrennt davon aufbewahren.
**Wiederherstellen:** Server stoppen, Sicherung als `flow.db` ablegen, `flow.db-wal`/`flow.db-shm` löschen, Server starten.
Fehlt `flow-secret.key` (bzw. `LDFLOW_SECRET_KEY`), funktioniert alles außer 2FA — Betroffene richten sie neu ein
(Admin: **Nutzer → 2FA zurücksetzen**).

Ohne Mailversand funktioniert „Passwort vergessen“ weiterhin über Admins: **Nutzer → Reset-Link** erzeugt einen
Einmal-Link (1 h), der auf sicherem Weg weitergegeben wird.

### Einrichtung

1. Server starten → `/flow` leitet zu `/flow/setup`.
2. Setup-Token aus `data/flow-setup-token.txt` (Datei nur für den Server-Betreiber lesbar) bzw. `LDFLOW_SETUP_TOKEN` eingeben.
3. Admin anlegen (Passwort ≥ 10 Zeichen). Die Token-Datei wird danach gelöscht; Setup ist nur ohne Nutzer möglich.

## Sicherheit

- Passwörter: scrypt (N 16384, r 8, p 1), Salt je Passwort, Vergleich in konstanter Zeit; unbekannte E-Mails
  werden gleich lang geprüft (keine Nutzer-Enumeration).
- Sessions: 256-Bit-Zufallstoken im `HttpOnly`/`SameSite=Lax`-Cookie mit Präfix `__Host-` (in Produktion), in der DB
  nur der Hash; 7 Tage gleitend; Logout, Passwortwechsel und Sperren beenden Sessions serverseitig. Unter „Mein Konto“
  stehen alle angemeldeten Geräte; einzeln oder „überall sonst“ abmelden.
- Zwei-Faktor (je Konto, „Mein Konto“): TOTP nach RFC 6238 (Testvektoren als Unit-Test), QR-Code + Schlüssel,
  10 Wiederherstellungscodes (nur Hash, je einmal). Nach dem Passwort ein 5-Minuten-Zwischenschritt (max. 5 Codes),
  erst dann die Sitzung; Codes sind nicht wiederverwendbar. Geheimnisse AES-256-GCM-verschlüsselt, Schlüssel außerhalb
  der DB. Admins können 2FA zurücksetzen (Telefon verloren); ein Passwort-Reset meldet bei aktiver 2FA nicht direkt an.
  Unter „Nutzer“ lässt sich 2FA für alle verpflichtend machen: Konten ohne 2FA kommen dann nur noch an „Mein Konto“.
- Content-Security-Policy: LD Flow und Vorschau mit Nonce je Request und `'strict-dynamic'` (`src/proxy.ts`,
  `src/cms/csp.ts`) — nur Skripte mit Nonce laufen. Die öffentliche Site ist statisch vorgerendert; Nonces würden
  Static/ISR abschalten (Next-Doku), daher dort eine Grundpolicy: nur eigene Skripte (mit `'unsafe-inline'`), kein
  `<object>`, `base-uri`/`form-action` nur eigene Seite.
- Brute-Force: 5 Fehlversuche je E-Mail+IP bzw. 20 je IP → 15 Minuten Sperre.
- Rollen: **Admin** (alles, Nutzerverwaltung, Löschen), **Redaktion** (Inhalte, Medien). Der letzte Admin kann
  sich nicht aussperren.
- CSRF: Server Actions prüfen Origin gegen Host (Next); Mutationen laufen ausschließlich über Actions.
- XSS: Rich Text ist strukturiertes JSON und wird über React gerendert (kein `innerHTML`); Links nur
  `https`, `mailto`, `tel`, relativ oder Anker. Uploads werden an den Magic Bytes erkannt (PNG, JPEG, GIF, WebP,
  AVIF, MP4, WebM — kein SVG) und mit `nosniff` + `sandbox`-CSP ausgeliefert.
- Clickjacking: `frame-ancestors 'self'` für die Site (nötig für die Vorschau), `'none'` für `/flow`.
- Passwort vergessen: Einmal-Link (256 Bit, 1 h, in der DB nur SHA-256); gleiche Antwort und Laufzeit mit oder ohne
  Konto (Mail wird nicht abgewartet); Rate-Limit je IP und E-Mail; danach werden alle Sessions beendet.
- Kontaktformular: nur JSON ≤ 20 KB, Origin-Prüfung, Honeypot, Mindest-Ausfülldauer, 5 Nachrichten je IP in 15 min;
  gespeichert wird ohne IP. Nachrichten erscheinen nur als Text (kein HTML).
- Zeitplan-Route: nur mit geheimem Header (Vergleich über Hashes in konstanter Zeit), sonst 404.

## Neuen Seitentyp anlegen

1. In `src/cms/schema.ts` → `PAGE_TEMPLATES` einen Eintrag mit `id`, `label`, `description` und `fields` ergänzen
   (Feldtypen: `text`, `textarea`, `richtext`, `color`, `select`, `boolean`, `number`, `url`, `media`, `gallery`,
   `strings`, `paragraphs`, `list`, `blocks`, `relations`; `inline: true` = in der Vorschau direkt editierbar).
2. In `src/site/cms/PageRenderer.tsx` die Darstellung ergänzen; Texte mit `<EText path="feld" value={…} />` bzw.
   `<ERich …/>` auszeichnen, damit sie WYSIWYG-editierbar sind.
3. Neue Blocktypen: `BLOCKS` in `schema.ts` + `BlockView` in `PageRenderer.tsx`.

Formular, Validierung, Speichern und Vorschau ergeben sich automatisch aus der Definition.

## Tests

- `npm test` — u. a. `tests/unit/cms.test.ts`: alle Prototyp-Inhalte bestehen das Schema verlustfrei; Link-/Rich-Text-
  Filter; scrypt; Upload-Typprüfung.
- `tests/e2e/flow.e2e.mjs` — kompletter Durchlauf gegen eine frische DB (Anleitung im Dateikopf): Zugriffsschutz,
  Setup-Token, WYSIWYG-Sync, Entwurf vs. live, neue Seite, reservierte Kennungen, Navigation, Widgets, Kontaktformular,
  geplantes Veröffentlichen, Bildvarianten, Passwort-Reset, Logout, Sperre. Braucht **frischen Build und frische DB**.

## Mehrsprachigkeit (Deutsch · Englisch)

- **Adressen:** Deutsch an der Wurzel (`/projekte`), Englisch unter `/en` mit englischen Abschnittsnamen
  (`/en/projects`, `/en/about`, `/en/journey`, `/en/imprint`; `labs`/`tech` gleich). Einzelseiten behalten ihren
  Kurznamen. Die eine Routentabelle ist `src/site/i18n/locale.ts` — Links, Navigation, hreflang, Sitemap und der
  Sprachumschalter (Footer, mobiles Menü, Einstellungen) lesen daraus. Pfade werden immer **deutsch** gespeichert
  (z. B. Menüpunkt `/ueber-mich`); die Site übersetzt sie beim Anzeigen.
- **Inhalte:** Jedes Dokument gibt es je Sprache (Tabelle `docs`, Spalte `locale`). Deutsch ist das Original und trägt
  die Struktur (Anlegen, Reihenfolge, Löschen in allen Sprachen); Englisch hat eigenen Entwurf, eigene Live-Fassung,
  Versionen und Zeitplan. Im Editor oben **Deutsch · Original / English**; die Liste zeigt je Eintrag den Stand
  („— fehlt“, „Entwurf“, „Live“, „veraltet“ = Deutsch wurde nach der englischen Veröffentlichung geändert).
  „Aus Deutsch übernehmen“ setzt den englischen Entwurf auf den deutschen Stand (Bilder/Struktur; Texte übersetzen).
- **Rückfall:** Ohne veröffentlichte englische Fassung zeigt `/en` die deutsche — mit `lang="de"` ausgezeichnet und
  `noindex`; die deutsche Seite verweist dann nicht per hreflang auf Englisch, die Sitemap lässt sie aus.
- **Startinhalte:** `content/en/*.ts` ist ein Übersetzungsentwurf (gleiche Struktur/IDs, Test „Englische
  Startinhalte“). Er wird einmalig je Datenbank als ENTWURF angelegt — live erst nach Prüfung. Ausnahme: die
  Menü-Beschriftungen (Navigation) sind UI-Texte und sofort live.
- **UI-Texte** (Buttons, Hinweise, Beschriftungen): `src/site/i18n/dict.ts`, beide Sprachen Pflicht (TypeScript prüft).
  LD Flow selbst bleibt deutsch.

## Offene Punkte

- Mehrere Server-Instanzen: SQLite ist für eine Instanz gedacht; für horizontales Skalieren den Speicher in
  `db.ts`/`repo.ts` auf Postgres umstellen (Schnittstelle bleibt).
- Datenschutzerklärung: den cookiefreien Besucherzähler (Umfang siehe oben) und ggf. das Kontaktformular dort
  erwähnen — die Texte pflegst du in LD Flow unter „Impressum & Datenschutz“.
- Optional später: experimentelles SRI (`experimental.sri`) könnte der Site eine
  strengere Policy ohne `'unsafe-inline'` erlauben — erst prüfen, wenn es stabil ist.
- Englische Übersetzung prüfen: Die Startinhalte liegen als Entwurf in LD Flow (Übersetzungsentwurf, siehe
  „Mehrsprachigkeit“). Auffällig: Die deutsche Datenschutzerklärung hat eine Überschrift „Sicherheitsmaßnahmen“ über
  einem Absatz zur Aktualisierung der Erklärung — im Original prüfen.
- Bildvarianten entstehen im Browser beim Upload; ältere Uploads (vor dieser Funktion) haben keine und werden im
  Original ausgeliefert.
