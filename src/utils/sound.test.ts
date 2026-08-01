import { playDrumRoll, stopDrumRoll, primeAudio } from './sound';

describe('sound utilities', () => {
  afterEach(() => {
    // Clean up any AudioContext mock between tests.
    delete (window as any).AudioContext;
    delete (window as any).webkitAudioContext;
  });

  it('does not throw when the Web Audio API is unavailable', () => {
    // jsdom has no AudioContext, so these should all be safe no-ops.
    expect(() => primeAudio()).not.toThrow();
    expect(() => playDrumRoll(1500)).not.toThrow();
    expect(() => stopDrumRoll()).not.toThrow();
  });

  it('schedules sounds when an AudioContext is available', () => {
    const bufferData = new Float32Array(1000);
    const gainNode = {
      gain: {
        value: 0,
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    };
    const filterNode = {
      type: '',
      frequency: { value: 0 },
      connect: jest.fn(),
    };
    const bufferSource = {
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    };
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

    const ctx = {
      sampleRate: 44100,
      currentTime: 0,
      state: 'running',
      destination: {},
      resume: jest.fn(),
      createBuffer: jest.fn(() => ({
        getChannelData: jest.fn(() => bufferData),
      })),
      createBufferSource: jest.fn(() => bufferSource),
      createBiquadFilter: jest.fn(() => filterNode),
      createGain: jest.fn(() => gainNode),
      createOscillator: jest.fn(() => oscNode),
    };

    const AudioContextMock = jest.fn(() => ctx);
    (window as any).AudioContext = AudioContextMock;

    playDrumRoll(1500);

    // The drum roll should have created and started at least one buffer source.
    expect(ctx.createBufferSource).toHaveBeenCalled();
    expect(bufferSource.start).toHaveBeenCalled();
    // The reveal accent should create an oscillator chime.
    expect(ctx.createOscillator).toHaveBeenCalled();
  });
});
