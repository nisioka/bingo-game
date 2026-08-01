export {};

// The sound module caches a single AudioContext at module scope, so we reset
// the module registry before each test to avoid a context (and its mocks)
// leaking across tests.
type SoundModule = typeof import('./sound');

// Build a fully mocked AudioContext. `sourceFactory` lets a test supply a
// custom buffer-source node (e.g. one whose stop() throws).
const createMockAudioContext = (sourceFactory?: () => any) => {
  const makeSource = () => ({
    buffer: null,
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  });

  const oscNode = {
    type: '',
    frequency: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  };

  const sources: any[] = [];

  const ctx = {
    sampleRate: 44100,
    currentTime: 0,
    state: 'running',
    destination: {},
    resume: jest.fn(),
    createBuffer: jest.fn(() => ({
      getChannelData: jest.fn(() => new Float32Array(1000)),
    })),
    createBufferSource: jest.fn(() => {
      const src = sourceFactory ? sourceFactory() : makeSource();
      sources.push(src);
      return src;
    }),
    createBiquadFilter: jest.fn(() => ({
      type: '',
      frequency: { value: 0 },
      connect: jest.fn(),
    })),
    createGain: jest.fn(() => ({
      gain: {
        value: 0,
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    })),
    createOscillator: jest.fn(() => oscNode),
  };

  return { ctx, sources, oscNode };
};

describe('sound utilities', () => {
  let sound: SoundModule;

  beforeEach(() => {
    jest.resetModules();
    sound = require('./sound');
  });

  afterEach(() => {
    delete (window as any).AudioContext;
    delete (window as any).webkitAudioContext;
  });

  it('does not throw when the Web Audio API is unavailable', () => {
    // jsdom has no AudioContext, so these should all be safe no-ops.
    expect(() => sound.primeAudio()).not.toThrow();
    expect(() => sound.playDrumRoll(1500)).not.toThrow();
    expect(() => sound.stopDrumRoll()).not.toThrow();
  });

  it('schedules sounds when an AudioContext is available', () => {
    const { ctx, oscNode } = createMockAudioContext();
    (window as any).AudioContext = jest.fn(() => ctx);

    sound.playDrumRoll(1500);

    // The drum roll should have created and started buffer sources.
    expect(ctx.createBufferSource).toHaveBeenCalled();
    // The reveal accent should create an oscillator chime.
    expect(ctx.createOscillator).toHaveBeenCalled();
    expect(oscNode.start).toHaveBeenCalled();
  });

  it('stopDrumRoll stops every scheduled node so muting silences playback', () => {
    const { ctx, sources, oscNode } = createMockAudioContext();
    (window as any).AudioContext = jest.fn(() => ctx);

    sound.playDrumRoll(1500);

    // Each source's stop() is called once at scheduling time; stopDrumRoll
    // should call it again to halt playback early.
    const beforeCounts = sources.map((s) => s.stop.mock.calls.length);
    const oscBefore = oscNode.stop.mock.calls.length;

    sound.stopDrumRoll();

    sources.forEach((s, i) => {
      expect(s.stop.mock.calls.length).toBeGreaterThan(beforeCounts[i]);
    });
    expect(oscNode.stop.mock.calls.length).toBeGreaterThan(oscBefore);
  });

  it('stopDrumRoll tolerates nodes that throw when already stopped', () => {
    const { ctx } = createMockAudioContext(() => {
      // stop() succeeds at scheduling time, then throws on the later
      // stopDrumRoll() call to simulate a node that has already finished.
      let called = false;
      return {
        buffer: null,
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(() => {
          if (called) {
            throw new Error('already stopped');
          }
          called = true;
        }),
      };
    });
    (window as any).AudioContext = jest.fn(() => ctx);

    sound.playDrumRoll(1500);
    // Stopping must swallow errors from nodes that are already stopped.
    expect(() => sound.stopDrumRoll()).not.toThrow();
  });
});
