// Sound utilities for the bingo game.
// We synthesize all sounds with the Web Audio API so no binary audio
// assets are required.

let audioContext: AudioContext | null = null;

// Track the currently playing drum roll so it can be stopped early.
let activeRoll: { stop: () => void } | null = null;

// Lazily create (and resume) a shared AudioContext.
// Must be triggered from a user gesture the first time to satisfy
// browser autoplay policies.
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  // Resume if the browser suspended it (common before a user gesture).
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {
      /* ignore */
    });
  }

  return audioContext;
};

// Create a short burst of filtered noise that sounds like a snare/drum hit.
// Returns the source node so the caller can stop it early if needed.
const playDrumHit = (
  ctx: AudioContext,
  time: number,
  gainValue: number
): AudioScheduledSourceNode => {
  const duration = 0.08;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    // Exponential decay envelope on white noise.
    const decay = Math.pow(1 - i / bufferSize, 2);
    data[i] = (Math.random() * 2 - 1) * decay;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Band-pass to give it a snare-like tone.
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;

  const gain = ctx.createGain();
  gain.gain.value = gainValue;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(time);
  source.stop(time + duration);

  return source;
};

// A brighter, longer noise burst for the final reveal ("cymbal" + tone).
// Returns the created source nodes so they can be stopped early if needed.
const playCymbal = (
  ctx: AudioContext,
  time: number
): AudioScheduledSourceNode[] => {
  const duration = 0.6;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const decay = Math.pow(1 - i / bufferSize, 1.5);
    data[i] = (Math.random() * 2 - 1) * decay;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 5000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(time);
  source.stop(time + duration);

  // A cheerful chime tone to accent the reveal.
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, time);
  osc.frequency.exponentialRampToValueAtTime(1320, time + 0.15);
  oscGain.gain.setValueAtTime(0.25, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.4);

  return [source, osc];
};

// Play a drum roll that lasts for the given duration (in ms), building
// up in intensity, and finishing with a reveal accent.
export const playDrumRoll = (durationMs: number): void => {
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }

  // Stop any drum roll that might still be playing.
  stopDrumRoll();

  const startTime = ctx.currentTime;
  const durationSec = durationMs / 1000;

  // Track every scheduled node so the roll can be stopped early (e.g. when
  // the user mutes mid-draw).
  const sources: AudioScheduledSourceNode[] = [];

  // Schedule a series of drum hits. The interval shrinks over time so
  // the roll accelerates towards the reveal.
  let t = 0;
  while (t < durationSec) {
    const progress = t / durationSec;
    // Interval goes from ~55ms down to ~28ms as the roll builds up.
    const interval = 0.055 - 0.027 * progress;
    // Volume swells from quiet to loud.
    const gainValue = 0.12 + 0.28 * progress;
    sources.push(playDrumHit(ctx, startTime + t, gainValue));
    t += interval;
  }

  // Final reveal accent.
  sources.push(...playCymbal(ctx, startTime + durationSec));

  activeRoll = {
    stop: () => {
      for (const node of sources) {
        try {
          node.stop();
        } catch {
          /* Node may already be stopped or not yet started. */
        }
      }
    },
  };
};

// Stop the currently playing drum roll (best effort).
export const stopDrumRoll = (): void => {
  if (activeRoll) {
    activeRoll.stop();
    activeRoll = null;
  }
};

// Prime the audio context from a user gesture so later programmatic
// playback is allowed by the browser.
export const primeAudio = (): void => {
  getAudioContext();
};
