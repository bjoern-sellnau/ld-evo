# LD Flow + Website als ein Container (Node-Server mit SQLite). Anleitung: docs/DEPLOY.md
#   docker build -t ld-evo .
#   docker run -d -p 127.0.0.1:3000:3000 -v ld-evo-data:/data --name ld-evo ld-evo
# Daten (Datenbank, 2FA-Schlüssel, Setup-Token) liegen im Volume /data — der Container selbst bleibt austauschbar.
# Node 22 LTS: ≥ 22.13 für node:sqlite ohne Flag.

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 NODE_NO_WARNINGS=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Der Build rendert die Seiten mit einer Wegwerf-DB aus den Startinhalten vor; zur Laufzeit erneuert der erste
# Takt nach dem Start alles aus der echten DB (src/app/(flow)/flow-cron/route.ts).
RUN LDFLOW_DB=/tmp/build-db/flow.db npm run build

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 NODE_NO_WARNINGS=1 PORT=3000 LDFLOW_DB=/data/flow.db
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/next.config.ts ./
COPY --from=build /app/public ./public
# Sicherung im laufenden Container: docker compose exec -T app node scripts/backup-db.mjs (docs/DEPLOY.md)
COPY --from=build /app/scripts/backup-db.mjs ./scripts/
# next start schreibt erneuerte Seiten nach .next zurück → muss dem Laufzeit-Nutzer gehören.
COPY --from=build --chown=node:node /app/.next ./.next
RUN mkdir -p /data /backup && chown node:node /data /backup
USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
CMD ["node_modules/.bin/next", "start"]
