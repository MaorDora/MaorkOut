export type SoundType = 'bell' | 'beep' | 'double_beep' | 'chime' | 'buzz';

export interface SoundOption {
    id: SoundType;
    label: string;
    emoji: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
    { id: 'bell', label: 'פעמון', emoji: '🔔' },
    { id: 'chime', label: 'פעמוני רוח', emoji: '🎵' },
    { id: 'beep', label: 'ביפ', emoji: '📣' },
    { id: 'double_beep', label: 'ביפ כפול', emoji: '⚡' },
    { id: 'buzz', label: 'רטט', emoji: '📳' },
];

const SOUND_KEY = 'maorkout_sound_enabled';
const TYPE_KEY = 'maorkout_sound_type';
const NOTIFY_SET = 'maorkout_notify_set';
const NOTIFY_EX = 'maorkout_notify_exercise';
const NOTIFY_DONE = 'maorkout_notify_done';

export const getSoundEnabled = () => localStorage.getItem(SOUND_KEY) !== 'false';
export const setSoundEnabled = (on: boolean) => localStorage.setItem(SOUND_KEY, String(on));
export const getSoundType = (): SoundType => (localStorage.getItem(TYPE_KEY) as SoundType) ?? 'bell';
export const setSoundType = (t: SoundType) => localStorage.setItem(TYPE_KEY, t);
export const getNotifySet = () => localStorage.getItem(NOTIFY_SET) !== 'false';
export const setNotifySet = (on: boolean) => localStorage.setItem(NOTIFY_SET, String(on));
export const getNotifyExercise = () => localStorage.getItem(NOTIFY_EX) !== 'false';
export const setNotifyExercise = (on: boolean) => localStorage.setItem(NOTIFY_EX, String(on));
export const getNotifyDone = () => localStorage.getItem(NOTIFY_DONE) !== 'false';
export const setNotifyDone = (on: boolean) => localStorage.setItem(NOTIFY_DONE, String(on));

/* ─── Sound generators ──────────────────────────────────────────────────── */

function makeBell(ctx: AudioContext, offset = 0) {
    [880, 1108, 1318, 1760].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const t = ctx.currentTime + offset;
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(i === 0 ? 0.4 : 0.15 / (i + 1), t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t); osc.stop(t + 1.6);
    });
}

function makeChime(ctx: AudioContext, offset = 0) {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const t = ctx.currentTime + offset + i * 0.18;
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t); osc.stop(t + 1.1);
    });
}

function makeBeep(ctx: AudioContext, offset = 0) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const t = ctx.currentTime + offset;
    osc.type = 'square';
    osc.frequency.value = 1000;
    g.gain.setValueAtTime(0.3, t);
    g.gain.setValueAtTime(0, t + 0.18);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.2);
}

function makeDoubleBeep(ctx: AudioContext, offset = 0) {
    makeBeep(ctx, offset);
    makeBeep(ctx, offset + 0.3);
}

function makeBuzz(ctx: AudioContext, offset = 0) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const t = ctx.currentTime + offset;
    osc.type = 'sawtooth';
    osc.frequency.value = 120;
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.55);
}

const GENERATORS: Record<SoundType, (ctx: AudioContext, offset?: number) => void> = {
    bell: makeBell,
    chime: makeChime,
    beep: makeBeep,
    double_beep: makeDoubleBeep,
    buzz: makeBuzz,
};

/**
 * Plays the chosen sound type (repeats for bell/chime).
 * Returns a stop() function.
 */
export function playSound(type?: SoundType, repeat = true): () => void {
    const t = type ?? getSoundType();
    const ctx = new AudioContext();
    const gen = GENERATORS[t];
    let stopped = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    gen(ctx, 0);
    if (repeat && (t === 'bell' || t === 'chime')) {
        [1.9, 3.8].forEach(delay => {
            const id = setTimeout(() => { if (!stopped) gen(ctx, 0); }, delay * 1000);
            timeouts.push(id);
        });
    }

    return () => {
        stopped = true;
        timeouts.forEach(clearTimeout);
        ctx.close();
    };
}

/** @deprecated use playSound instead */
export const playBell = (repeat = true) => playSound('bell', repeat);
