// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// react-scripts' jsdom test environment does not expose structuredClone,
// which fake-indexeddb relies on. Polyfill it before loading fake-indexeddb.
// The game state we persist is JSON-serializable, so this is sufficient.
if (typeof structuredClone === 'undefined') {
  // eslint-disable-next-line no-global-assign
  (global as any).structuredClone = (value: unknown) =>
    JSON.parse(JSON.stringify(value));
}

// Provide a fake IndexedDB implementation so store logic that persists to
// IndexedDB can run in the jsdom test environment.
import 'fake-indexeddb/auto';
