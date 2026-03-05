/* ─── Google Calendar Service ────────────────────────────────────────────
 *  Uses gapi (api.js) + Google Identity Services (gsi/client)
 *  Both scripts are loaded in index.html
 * ─────────────────────────────────────────────────────────────────────── */

declare const gapi: any;
declare const google: any;

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

/** Key stored in localStorage to remember the user authorized Google Calendar */
const LS_KEY = 'maorkout_gcal_authorized';

export interface GCalEvent {
    id: string;
    summary: string;
    start: string;
    end: string;
    isMaorkOut?: boolean;
}

let tokenClient: any = null;
let accessToken: string | null = null;
let gapiReady = false;

/* ── Is Google API configured? ── */
export function isGoogleApiAvailable(): boolean {
    return (
        typeof window !== 'undefined' &&
        !!CLIENT_ID &&
        CLIENT_ID !== 'YOUR_CLIENT_ID.apps.googleusercontent.com'
    );
}

export function isSignedIn(): boolean {
    return !!accessToken;
}

/** Returns true if user previously authorized (stored in localStorage) */
export function hadPreviousAuth(): boolean {
    return localStorage.getItem(LS_KEY) === '1';
}

/* ── Load gapi client (idempotent) ── */
async function ensureGapiReady(): Promise<void> {
    if (gapiReady) return;
    return new Promise((resolve, reject) => {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY] });
                gapiReady = true;
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    });
}

/* ── Build / reuse tokenClient ── */
function ensureTokenClient(callback: (token: string) => void, onError: (e: any) => void) {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp: any) => {
            if (resp.error) { onError(resp.error); return; }
            accessToken = resp.access_token;
            gapi.client.setToken({ access_token: accessToken });
            localStorage.setItem(LS_KEY, '1');
            callback(accessToken!);
        },
    });
}

/* ── Silent auto sign-in (no popup) ── */
export async function autoSignIn(): Promise<boolean> {
    if (!isGoogleApiAvailable()) return false;
    if (!hadPreviousAuth()) return false;
    if (typeof gapi === 'undefined' || typeof google === 'undefined') return false;

    try {
        await ensureGapiReady();
        return new Promise((resolve) => {
            ensureTokenClient(
                () => resolve(true),
                () => resolve(false),
            );
            // prompt: '' means silent — no popup; Google returns a token if still valid
            tokenClient.requestAccessToken({ prompt: '' });
        });
    } catch {
        return false;
    }
}

/* ── Explicit sign-in with consent popup ── */
export async function signInWithGoogle(): Promise<string> {
    if (!isGoogleApiAvailable()) throw new Error('Google API not configured');
    await ensureGapiReady();

    return new Promise((resolve, reject) => {
        ensureTokenClient(resolve, reject);
        tokenClient.requestAccessToken({ prompt: 'consent' });
    });
}

/* ── Sign out ── */
export function signOutGoogle(): void {
    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken);
        accessToken = null;
        gapi.client.setToken(null);
    }
    localStorage.removeItem(LS_KEY);
}

/* ── Fetch events for a date range ── */
export async function fetchEventsForRange(
    startDate: Date,
    endDate: Date,
): Promise<GCalEvent[]> {
    if (!accessToken) return [];
    try {
        const res = await gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100,
        });
        return (res.result.items ?? []).map((ev: any) => ({
            id: ev.id,
            summary: ev.summary ?? '(ללא כותרת)',
            start: ev.start?.dateTime ?? ev.start?.date ?? '',
            end: ev.end?.dateTime ?? ev.end?.date ?? '',
            isMaorkOut: (ev.description ?? '').includes('MaorkOut'),
        }));
    } catch (e) {
        console.error('GCal fetch error', e);
        return [];
    }
}

/* ── Create a Calendar event for a scheduled workout ── */
export async function createCalendarEvent(params: {
    title: string;
    startISO: string;
    durationMin: number;
    description?: string;
}): Promise<string | null> {
    if (!accessToken) return null;
    try {
        const start = new Date(params.startISO);
        const end = new Date(start.getTime() + params.durationMin * 60_000);
        const res = await gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: {
                summary: `🏋️ ${params.title}`,
                description: `${params.description ?? ''}\n\nנוצר ע"י MaorkOut`,
                start: { dateTime: start.toISOString() },
                end: { dateTime: end.toISOString() },
                colorId: '1',
            },
        });
        return res.result.id ?? null;
    } catch (e) {
        console.error('GCal create error', e);
        return null;
    }
}
