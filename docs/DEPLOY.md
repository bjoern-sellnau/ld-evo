# Livegang — Website + LD Flow auf einem Server

Die Site und das CMS laufen als **ein Node-Server** mit SQLite-Datenbank. Empfohlen: Docker Compose mit Caddy davor
(HTTPS automatisch). Ohne Docker geht es genauso mit Node + systemd + nginx (unten).

Grundregeln für jede Variante:

- **Immer hinter einem Reverse-Proxy mit HTTPS.** Cookies sind in Produktion `Secure`/`__Host-`; die Brute-Force-Sperre
  liest die Client-IP aus `X-Forwarded-For`, den nur der eigene Proxy setzen darf. Den App-Port nie direkt öffnen.
- **Persistentes Datenverzeichnis** (`LDFLOW_DB`): Datenbank inkl. Medien, `flow-secret.key` (2FA), Setup-Token.
- **Sicherung** einrichten (unten) — und den 2FA-Schlüssel getrennt davon aufbewahren.

## Variante A: Docker Compose + Caddy

Voraussetzung: Server mit Docker, DNS-Eintrag der Domain zeigt auf den Server, Ports 80/443 frei.

```bash
git clone https://github.com/bjoern-sellnau/ld-evo.git && cd ld-evo
echo 'DOMAIN=loona-designs.de' > .env        # weitere Variablen in compose.yaml eintragen (Mail, Alarm)
mkdir -p backup && sudo chown 1000:1000 backup # Container-Nutzer „node“ (UID 1000) schreibt dorthin
docker compose up -d --build
docker compose ps                               # app: healthy, caddy: running
```

**Ersteinrichtung:** `https://<domain>/flow/setup` öffnen. Das Setup-Token steht im Datenvolume:
`docker compose exec app cat /data/flow-setup-token.txt` — damit das erste Admin-Konto anlegen, danach verfällt es.
Im Anschluss unter **Mein Konto** die Zwei-Faktor-Anmeldung einrichten.

**Update:** `git pull && docker compose up -d --build`. Migrationen laufen beim Start automatisch; die beim Build
vorgerenderten Seiten erneuert der Server wenige Sekunden nach dem Start aus der echten Datenbank.

**Sicherung** (Host-crontab, nächtlich; Details und Wiederherstellung: `docs/LD-FLOW.md` → Sicherung):

```cron
15 3 * * * cd /srv/ld-evo && docker compose exec -T app node scripts/backup-db.mjs >> /var/log/ldflow-backup.log 2>&1
```

Die Stände landen in `./backup` auf dem Host — von dort außer Haus kopieren (`restic`, `rclone` …). Den 2FA-Schlüssel
einmalig getrennt sichern (er ändert sich nicht): `docker compose cp app:/data/flow-secret.key ~/ldflow-secret.key`.

## Variante B: Node + systemd + nginx

```bash
# Node ≥ 22.13 (LTS 22), dann:
git clone https://github.com/bjoern-sellnau/ld-evo.git /srv/ld-evo && cd /srv/ld-evo
npm ci && npm run build
sudo mkdir -p /var/lib/ldflow && sudo chown www-data: /var/lib/ldflow
```

`/etc/systemd/system/ldflow.service`:

```ini
[Unit]
Description=loona designs — Website + LD Flow
After=network.target

[Service]
User=www-data
WorkingDirectory=/srv/ld-evo
Environment=NODE_ENV=production PORT=3000 NODE_NO_WARNINGS=1
Environment=LDFLOW_DB=/var/lib/ldflow/flow.db LDFLOW_PUBLIC_URL=https://loona-designs.de
ExecStart=/srv/ld-evo/node_modules/.bin/next start -H 127.0.0.1
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

`www-data` braucht Schreibrechte auf `.next` (`sudo chown -R www-data: /srv/ld-evo/.next`), weil der Server
erneuerte Seiten dorthin zurückschreibt. nginx (TLS z. B. per certbot):

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # hängt die echte IP an → LD Flow liest den letzten Eintrag
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 25m;                                     # Medien-Uploads (10 MB + Varianten)
}
```

## Überwachung

- **`GET /health`** → `200 {"status":"ok"}`, wenn Server und Datenbank antworten, sonst `503`. Für Uptime-Dienste
  (z. B. alle 5 Minuten) und den Docker-`HEALTHCHECK`. Gibt keine Details preis.
- **Fehler-Eingang:** Serverfehler erscheinen gebündelt unter **LD Flow → Fehler** (nur Admins, Pfad ohne Query,
  keine IP). Mit `LDFLOW_ALERT_TO` (+ Mailversand) kommt zusätzlich eine Mail — je Fehler höchstens einmal am Tag.
- **Aufräumen** läuft automatisch stündlich im Server (abgelaufene Sitzungen, Reset-Links, alte Sperr-Einträge,
  verwaiste Bildvarianten, alte Fehler). Inhalte, Nachrichten und Statistik bleiben unberührt.

## Mehrere Proxys hintereinander

Steht vor Caddy/nginx noch ein CDN oder Load-Balancer, der ebenfalls an `X-Forwarded-For` anhängt:
`LDFLOW_PROXY_HOPS=2` (Anzahl der eigenen Proxys). Setzt der Proxy nur `X-Real-IP` (überschreibend):
`LDFLOW_PROXY_HOPS=0`. Bei Cloudflare zusätzlich dessen Hinweise zu gefälschten Headern beachten.
