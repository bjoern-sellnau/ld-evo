'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { deleteMediaAction, listMediaAction, mediaAltAction, uploadMediaAction } from '../actions';
import type { MediaRef } from '../schema';
import { makeVariants } from './imageVariants';
import { mediaUrl } from '../media';

export interface MediaItem {
  id: string;
  filename: string;
  mime: string;
  size: number;
  alt: string;
  createdAt: number;
}

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

function Thumb({ src, mime, alt }: { src: string; mime?: string; alt: string }) {
  return (
    <div className="f-thumb">
      {mime?.startsWith('video/') ? (
        <video src={src} muted playsInline aria-label={alt} />
      ) : (
        <img src={mediaUrl(src, 640)} alt={alt} loading="lazy" />
      )}
    </div>
  );
}

/** Upload-Feld (Datei + Alternativtext). Ruft onDone mit dem neuen Medium. */
export function Uploader({ onDone }: { onDone?: (m: { id: string; src: string; alt: string }) => void }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="f-row"
      style={{ alignItems: 'flex-end' }}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const form = e.currentTarget;
        setError(null);
        start(async () => {
          const file = fd.get('file');
          if (file instanceof File) for (const v of await makeVariants(file)) fd.append('variant', v);
          const res = await uploadMediaAction(fd);
          if (!res.ok) setError(res.error);
          else {
            form.reset();
            onDone?.({ id: (res as { id: string }).id, src: (res as { src: string }).src, alt: String(fd.get('alt') ?? '') });
          }
        });
      }}
    >
      <div className="f-field" style={{ margin: 0, flex: '1 1 200px' }}>
        <label htmlFor="up-file">Datei (PNG, JPEG, WebP, AVIF, GIF, MP4, WebM · max. 10 MB)</label>
        <input
          id="up-file"
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,video/mp4,video/webm"
          required
        />
      </div>
      <div className="f-field" style={{ margin: 0, flex: '1 1 200px' }}>
        <label htmlFor="up-alt">Alternativtext</label>
        <input id="up-alt" name="alt" type="text" maxLength={300} placeholder="Was ist zu sehen?" />
      </div>
      <button className="f-btn primary" type="submit" disabled={pending}>
        {pending ? 'Lade hoch …' : 'Hochladen'}
      </button>
      {error && (
        <p className="f-msg error" role="alert" style={{ width: '100%', margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}

function useMedia() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const reload = useCallback(async () => {
    const r = await listMediaAction();
    if (r.ok) setItems((r as { items: MediaItem[] }).items);
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { items, reload };
}

/** Bildfeld im Editor: Vorschau, Auswahl aus der Mediathek oder Upload, Alternativtext. */
export function MediaField({ value, onChange, label }: { value: MediaRef | null; onChange: (v: MediaRef | null) => void; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {value ? (
        <div className="f-row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
          <div style={{ width: 120, flex: 'none' }}>
            <Thumb src={value.src} alt={value.alt} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              className="f-input"
              type="text"
              aria-label={`${label}: Alternativtext`}
              placeholder="Alternativtext"
              value={value.alt}
              maxLength={300}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
            />
            <div className="f-row" style={{ marginTop: 6 }}>
              <button className="f-btn sm" type="button" onClick={() => setOpen(true)}>
                Ändern
              </button>
              <button className="f-btn sm ghost" type="button" onClick={() => onChange(null)}>
                Entfernen
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button className="f-btn sm" type="button" onClick={() => setOpen(true)}>
          Bild wählen …
        </button>
      )}
      {open && (
        <MediaDialog
          onClose={() => setOpen(false)}
          onPick={(m) => {
            onChange(m);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function MediaDialog({ onClose, onPick }: { onClose: () => void; onPick: (m: MediaRef) => void }) {
  const { items, reload } = useMedia();
  const [url, setUrl] = useState('');
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="f-dialog" role="dialog" aria-modal="true" aria-label="Mediathek" onClick={onClose}>
      <div className="f-card" onClick={(e) => e.stopPropagation()}>
        <div className="f-head" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Mediathek</h2>
          <button className="f-btn sm ghost" type="button" onClick={onClose} aria-label="Schließen" autoFocus>
            ✕
          </button>
        </div>
        <Uploader
          onDone={(m) => {
            reload();
            onPick({ src: m.src, alt: m.alt });
          }}
        />
        <div className="f-row" style={{ margin: '14px 0' }}>
          <input
            className="f-input"
            style={{ flex: 1 }}
            type="text"
            aria-label="Oder Bild-URL (https:// oder /pfad aus public/)"
            placeholder="Oder Bild-URL: https://… bzw. /pfad aus public/"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="f-btn sm" type="button" disabled={!url} onClick={() => onPick({ src: url.trim(), alt: '' })}>
            Übernehmen
          </button>
        </div>
        {items === null ? (
          <p className="f-help">Lade …</p>
        ) : items.length === 0 ? (
          <p className="f-help">Noch keine Medien hochgeladen.</p>
        ) : (
          <div className="f-media-grid">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onPick({ src: `/media/${m.id}`, alt: m.alt })}
                style={{ all: 'unset', cursor: 'pointer', display: 'block' }}
                aria-label={`${m.filename} wählen`}
              >
                <Thumb src={`/media/${m.id}`} mime={m.mime} alt={m.alt} />
                <div className="f-help" style={{ marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.filename}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Mediathek-Seite: Upload, Alternativtexte pflegen, löschen, Pfad kopieren. */
export function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const [items, setItems] = useState(initial);
  const [pending, start] = useTransition();
  const reload = async () => {
    const r = await listMediaAction();
    if (r.ok) setItems((r as { items: MediaItem[] }).items);
  };
  return (
    <>
      <div className="f-card" style={{ marginBottom: 18 }}>
        <Uploader onDone={() => start(reload)} />
      </div>
      <div className="f-media-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))' }}>
        {items.map((m) => (
          <div key={m.id} className="f-card" style={{ padding: 10 }}>
            <Thumb src={`/media/${m.id}`} mime={m.mime} alt={m.alt} />
            <div className="f-help" style={{ margin: '8px 0 6px' }}>
              {m.filename} · {kb(m.size)}
            </div>
            <input
              className="f-input"
              type="text"
              defaultValue={m.alt}
              maxLength={300}
              aria-label={`Alternativtext für ${m.filename}`}
              placeholder="Alternativtext"
              onBlur={(e) => e.target.value !== m.alt && start(async () => void (await mediaAltAction(m.id, e.target.value)))}
            />
            <div className="f-row" style={{ marginTop: 8 }}>
              <button className="f-btn sm" type="button" onClick={() => navigator.clipboard?.writeText(`/media/${m.id}`)}>
                Pfad kopieren
              </button>
              <button
                className="f-btn sm danger"
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm(`„${m.filename}“ löschen? Seiten, die das Bild nutzen, zeigen es dann nicht mehr.`)) return;
                  start(async () => {
                    await deleteMediaAction(m.id);
                    await reload();
                  });
                }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
