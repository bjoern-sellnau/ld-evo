# LD Flow. — CMS für loona-designs

LD Flow ist das in die Site eingebaute CMS: WYSIWYG-Bearbeitung auf der echten Seite, Entwürfe und Veröffentlichen,
Versionen, Mediathek, frei anlegbare Seiten mit Seitentypen (Templates) sowie Anmeldung mit Rollen.

- Admin: **`/flow`** (eigenes Root-Layout, nie indexiert)
- Entwurfsvorschau: `/flow-preview/<collection>/<id>` (nur angemeldet, sonst 404)
- Medien: `/media/<id>`
- Frei angelegte Seiten: `/<kennung>`

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
| Admin-UI | `src/app/(flow)/…`, `src/cms/ui/*` | Dashboard, Listen, Editor (Formular + Live-Vorschau), Mediathek, Nutzer, Konto |

**Datenfluss beim Bearbeiten:** Formular links ↔ Vorschau-iframe rechts per `postMessage` (nur gleicher Ursprung).
Jede Änderung wird nach 1,2 s als Entwurf gespeichert (⌘S/Strg+S sofort). „Veröffentlichen“ validiert vollständig,
legt die bisherige Live-Fassung als Version ab (max. 30) und erneuert die statisch erzeugte Site.

**Was ist editierbar:** Startseite (Hero-Texte, Rollen, Featured), Über mich (Texte, Werkzeuge, Skills, Zertifikate,
Bilder), Projekte & Labs, .Tech-Artikel, Meine Reise (Stationen, Zwischenschritte, Bilder) und frei angelegte Seiten.
Im Code bleiben bewusst: Impressum/Datenschutz (Rechtstexte), Stationen der Über-mich-Seite samt Rail, Navigation.

## Betrieb

- **Node ≥ 22.13** (für `node:sqlite`; die Warnung „ExperimentalWarning: SQLite“ ist unkritisch, `NODE_NO_WARNINGS=1` blendet sie aus).
- Start als Node-Server: `npm run build && npm start`. Ein statischer Export ist mit CMS nicht möglich.
- **Persistentes Verzeichnis** für die Datenbank: standardmäßig `./data/flow.db`, sonst `LDFLOW_DB=/pfad/flow.db`.
  Backup = diese eine Datei (bei laufendem Server `sqlite3 flow.db ".backup ziel.db"`). `data/` ist in `.gitignore`.
- **HTTPS** verwenden; Cookies sind in Produktion `Secure`. Nur für Tests ohne TLS: `LDFLOW_INSECURE_COOKIES=1`.
- Hinter einem Reverse-Proxy muss dieser `X-Forwarded-For` setzen (für das Rate-Limit).

| Variable | Zweck |
| --- | --- |
| `LDFLOW_DB` | Pfad der SQLite-Datei (Standard `./data/flow.db`) |
| `LDFLOW_SETUP_TOKEN` | optional: festes Setup-Token statt der generierten Datei |
| `LDFLOW_INSECURE_COOKIES` | `1` = Cookies ohne `Secure` (nur lokal/Tests) |

### Einrichtung

1. Server starten → `/flow` leitet zu `/flow/setup`.
2. Setup-Token aus `data/flow-setup-token.txt` (Datei nur für den Server-Betreiber lesbar) bzw. `LDFLOW_SETUP_TOKEN` eingeben.
3. Admin anlegen (Passwort ≥ 10 Zeichen). Die Token-Datei wird danach gelöscht; Setup ist nur ohne Nutzer möglich.

## Sicherheit

- Passwörter: scrypt (N 16384, r 8, p 1), Salt je Passwort, Vergleich in konstanter Zeit; unbekannte E-Mails
  werden gleich lang geprüft (keine Nutzer-Enumeration).
- Sessions: 256-Bit-Zufallstoken im `HttpOnly`/`SameSite=Lax`-Cookie, in der DB nur der Hash; 7 Tage gleitend;
  Logout, Passwortwechsel und Sperren beenden Sessions serverseitig.
- Brute-Force: 5 Fehlversuche je E-Mail+IP bzw. 20 je IP → 15 Minuten Sperre.
- Rollen: **Admin** (alles, Nutzerverwaltung, Löschen), **Redaktion** (Inhalte, Medien). Der letzte Admin kann
  sich nicht aussperren.
- CSRF: Server Actions prüfen Origin gegen Host (Next); Mutationen laufen ausschließlich über Actions.
- XSS: Rich Text ist strukturiertes JSON und wird über React gerendert (kein `innerHTML`); Links nur
  `https`, `mailto`, `tel`, relativ oder Anker. Uploads werden an den Magic Bytes erkannt (PNG, JPEG, GIF, WebP,
  AVIF, MP4, WebM — kein SVG) und mit `nosniff` + `sandbox`-CSP ausgeliefert.
- Clickjacking: `frame-ancestors 'self'` für die Site (nötig für die Vorschau), `'none'` für `/flow`.

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
  Setup-Token, WYSIWYG-Sync, Entwurf vs. live, neue Seite, reservierte Kennungen, Medien, Logout, Sperre.

## Offene Punkte

- Mehrere Server-Instanzen: SQLite ist für eine Instanz gedacht; für horizontales Skalieren den Speicher in
  `db.ts`/`repo.ts` auf Postgres umstellen (Schnittstelle bleibt).
- Bildgrößen: Uploads werden unverändert ausgeliefert (kein Resizing/`srcset`).
- Zwei-Faktor-Anmeldung und Passwort-zurücksetzen per E-Mail fehlen (Admins setzen Passwörter in „Nutzer“).
- Zwischenschritt-Bilder der Reise (`ld-mini-<jahr>-s<n>-…`) liegen noch in `content/journeyMedia.ts`.
