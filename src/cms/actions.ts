'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  AuthError,
  beginTotpSetup,
  changeOwnPassword,
  completeSecondFactor,
  confirmTotpSetup,
  disableTotp,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  revokeSessions,
  setupFirstAdmin,
  type Role,
} from './auth';
import {
  adminCreateUser,
  adminDeleteUser,
  adminResetLink,
  adminUpdateUser,
  cancelSchedule,
  createDoc,
  createPattern,
  publishedPatterns,
  deleteDoc,
  deleteMedia,
  deleteMessage,
  discardDraft,
  listMedia,
  markMessage,
  moveDoc,
  publishDoc,
  restoreRevision,
  saveDraft,
  schedulePublish,
  unpublishDoc,
  updateMediaAlt,
  uploadMedia,
} from './repo';
import type { Errors } from './schema';

/**
 * LD Flow. — Server Actions. Bewusst dünn: Anmeldung/Rechte prüft der Datenzugriff (repo.ts/auth.ts) bei jedem
 * Aufruf selbst, denn Actions sind per POST direkt erreichbar. Next prüft zusätzlich Origin gegen Host (CSRF).
 */

export type ActionState = { ok?: boolean; error?: string; errors?: Errors; message?: string } | undefined;

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === 'string' ? v : '';
};

async function guard<T>(fn: () => Promise<T>): Promise<T | { ok: false; error: string }> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: e.message };
    throw e;
  }
}

/** Nach Änderungen an Live-Inhalten die ganze Site neu erzeugen (Inhalte hängen am Site-Layout). */
function refreshSite() {
  revalidatePath('/', 'layout');
}

// ---- Anmeldung -------------------------------------------------------------------------------------------------

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const res = await login(str(fd, 'email'), str(fd, 'password'));
  if (!res.ok) return { error: res.error };
  const next = safeNext(str(fd, 'next'));
  if (res.twoFactor) redirect(`/flow/login/2fa?next=${encodeURIComponent(next)}`);
  redirect(next);
}

const safeNext = (n: string) => (n.startsWith('/flow') && !n.startsWith('//') ? n : '/flow');

/** Zweiter Schritt der Anmeldung: Code aus der Authenticator-App oder Wiederherstellungscode. */
export async function secondFactorAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const res = await completeSecondFactor(str(fd, 'code'));
  if (!res.ok) {
    if (res.restart) redirect('/flow/login?expired=1');
    return { error: res.error };
  }
  redirect(safeNext(str(fd, 'next')));
}

export async function logoutAction() {
  await logout();
  redirect('/flow/login');
}

export async function setupAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, 'password') !== str(fd, 'password2')) return { error: 'Die Passwörter stimmen nicht überein.' };
  const res = await setupFirstAdmin({
    token: str(fd, 'token').trim(),
    email: str(fd, 'email'),
    name: str(fd, 'name'),
    password: str(fd, 'password'),
  });
  if (!res.ok) return { error: res.error };
  redirect('/flow');
}

export async function forgotPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const res = await requestPasswordReset(str(fd, 'email'));
  return res.ok ? { ok: true, message: res.message } : { error: res.error };
}

export async function resetPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, 'password') !== str(fd, 'password2')) return { error: 'Die Passwörter stimmen nicht überein.' };
  const res = await resetPassword(str(fd, 'token'), str(fd, 'password'));
  if (!res.ok) return { error: res.error };
  redirect(res.loggedIn ? '/flow' : '/flow/login?reset=1');
}

export async function changePasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, 'next') !== str(fd, 'next2')) return { error: 'Die neuen Passwörter stimmen nicht überein.' };
  const res = await guard(() => changeOwnPassword(str(fd, 'current'), str(fd, 'next')));
  return res.ok ? { ok: true, message: 'Passwort geändert. Andere Sitzungen wurden abgemeldet.' } : { error: res.error };
}

// ---- Inhalte ---------------------------------------------------------------------------------------------------

export async function createDocAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const collection = str(fd, 'collection');
  const res = await guard(() => createDoc(collection, str(fd, 'id'), str(fd, 'template') || undefined, str(fd, 'pattern') || undefined));
  if (!res.ok) return { error: res.error };
  redirect(`/flow/c/${collection}/${(res as { id: string }).id}`);
}

export async function saveDraftAction(collection: string, id: string, data: unknown) {
  return guard(() => saveDraft(collection, id, data));
}

export async function publishAction(collection: string, id: string, data?: unknown) {
  const res = await guard(() => publishDoc(collection, id, data));
  if (res.ok) refreshSite();
  return res;
}

/** Widget als Vorlage speichern; liefert die aktuelle Vorlagen-Liste für die Vorschau zurück. */
export async function savePatternAction(title: string, global: boolean, block: unknown) {
  const res = await guard(() => createPattern(title, block, global));
  if (!res.ok) return res;
  refreshSite();
  return { ok: true as const, patterns: publishedPatterns() };
}

/** Veröffentlichen planen (`at` = Zeitpunkt in ms, vom Browser aus der lokalen Zeit umgerechnet). */
export async function scheduleAction(collection: string, id: string, at: number, data?: unknown) {
  return guard(() => schedulePublish(collection, id, at, data));
}

export async function cancelScheduleAction(collection: string, id: string) {
  return guard(() => cancelSchedule(collection, id));
}

export async function discardDraftAction(collection: string, id: string) {
  return guard(() => discardDraft(collection, id));
}

export async function unpublishAction(collection: string, id: string) {
  const res = await guard(() => unpublishDoc(collection, id));
  if (res.ok) refreshSite();
  return res;
}

export async function deleteDocAction(collection: string, id: string) {
  const res = await guard(() => deleteDoc(collection, id));
  if (res.ok) refreshSite();
  return res;
}

export async function moveDocAction(collection: string, id: string, dir: -1 | 1) {
  const res = await guard(() => moveDoc(collection, id, dir));
  if (res.ok) {
    refreshSite();
    revalidatePath(`/flow/c/${collection}`);
  }
  return res;
}

export async function restoreRevisionAction(collection: string, id: string, rid: number) {
  return guard(() => restoreRevision(collection, id, rid));
}

// ---- Medien ----------------------------------------------------------------------------------------------------

export async function uploadMediaAction(fd: FormData) {
  const file = fd.get('file');
  if (!(file instanceof File)) return { ok: false as const, error: 'Keine Datei.' };
  const variants = fd.getAll('variant').filter((v): v is File => v instanceof File);
  const res = await guard(() => uploadMedia(file, str(fd, 'alt'), variants));
  revalidatePath('/flow/media');
  return res;
}

export async function listMediaAction() {
  return guard(async () => ({ ok: true as const, items: await listMedia() }));
}

export async function mediaAltAction(id: string, alt: string) {
  const res = await guard(() => updateMediaAlt(id, alt));
  revalidatePath('/flow/media');
  return res;
}

export async function deleteMediaAction(id: string) {
  const res = await guard(() => deleteMedia(id));
  revalidatePath('/flow/media');
  return res;
}

// ---- Nutzer ----------------------------------------------------------------------------------------------------

export async function createUserAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const role = (str(fd, 'role') === 'admin' ? 'admin' : 'editor') as Role;
  const res = await guard(() => adminCreateUser({ email: str(fd, 'email'), name: str(fd, 'name'), password: str(fd, 'password'), role }));
  revalidatePath('/flow/users');
  return res.ok ? { ok: true, message: 'Nutzer angelegt.' } : { error: res.error };
}

export async function updateUserAction(
  id: string,
  patch: { role?: Role; disabled?: boolean; password?: string; resetTwoFactor?: boolean },
) {
  const res = await guard(() => adminUpdateUser(id, patch));
  revalidatePath('/flow/users');
  return res;
}

export async function resetLinkAction(id: string) {
  return guard(() => adminResetLink(id));
}

export async function deleteUserAction(id: string) {
  const res = await guard(() => adminDeleteUser(id));
  revalidatePath('/flow/users');
  return res;
}

// ---- Nachrichten -----------------------------------------------------------------------------------------------

export async function markMessageAction(id: string, read: boolean) {
  const res = await guard(() => markMessage(id, read));
  revalidatePath('/flow', 'layout');
  return res;
}

export async function deleteMessageAction(id: string) {
  const res = await guard(() => deleteMessage(id));
  revalidatePath('/flow', 'layout');
  return res;
}

// ---- Konto: Sitzungen & Zwei-Faktor ----------------------------------------------------------------------------

export async function revokeSessionAction(handle: string | null) {
  const res = await guard(() => revokeSessions(handle));
  revalidatePath('/flow/account');
  return res;
}

export async function beginTotpAction() {
  return guard(() => beginTotpSetup());
}

export async function confirmTotpAction(code: string) {
  const res = await guard(() => confirmTotpSetup(code));
  revalidatePath('/flow/account');
  return res;
}

export async function disableTotpAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const res = await guard(() => disableTotp(str(fd, 'password'), str(fd, 'code')));
  if (!res.ok) return { error: res.error };
  revalidatePath('/flow/account');
  return { ok: true, message: 'Zwei-Faktor-Anmeldung ist aus.' };
}
