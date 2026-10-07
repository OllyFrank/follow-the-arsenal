import { vi } from "vitest";

// supabase-js's query builder is a chainable thenable: every method on it
// (select, upsert, delete, eq, in, not, order...) returns the same object,
// and `await`ing it resolves to { data, error }. This fakes just enough of
// that shape to drive the sync-layer unit tests without a real network call.
export interface MockResult {
  data?: unknown;
  error?: unknown;
}

export function makeChain(result: MockResult) {
  const chain = {
    select: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    in: vi.fn(() => chain),
    not: vi.fn(() => chain),
    order: vi.fn(() => chain),
    then: (resolve: (value: MockResult) => unknown) => Promise.resolve(result).then(resolve),
  };
  return chain;
}
