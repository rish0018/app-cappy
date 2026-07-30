/**
 * Minimal chainable fake for Supabase's query builder, covering only the
 * methods repositories/*.ts actually call (.from/.select/.eq/.order/
 * .maybeSingle/.single/.upsert). Each chain call is recorded so tests can
 * assert on it; the terminal call (maybeSingle/single/upsert-then-await,
 * or awaiting the chain directly) resolves to the configured result.
 */
import { vi } from "vitest";

export interface FakeResult<T = unknown> {
  data: T;
  error: { message: string } | null;
}

export interface FakeSupabaseQuery {
  select: (...args: unknown[]) => FakeSupabaseQuery;
  eq: (...args: unknown[]) => FakeSupabaseQuery;
  gte: (...args: unknown[]) => FakeSupabaseQuery;
  lte: (...args: unknown[]) => FakeSupabaseQuery;
  order: (...args: unknown[]) => FakeSupabaseQuery;
  maybeSingle: () => Promise<FakeResult>;
  single: () => Promise<FakeResult>;
  upsert: (...args: unknown[]) => FakeSupabaseQuery;
  update: (...args: unknown[]) => FakeSupabaseQuery;
  then: (resolve: (value: FakeResult) => void) => void;
}

function buildQuery(result: FakeResult): FakeSupabaseQuery {
  const query: FakeSupabaseQuery = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    gte: vi.fn(() => query),
    lte: vi.fn(() => query),
    order: vi.fn(() => query),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    single: vi.fn(() => Promise.resolve(result)),
    upsert: vi.fn(() => query),
    update: vi.fn(() => query),
    then: (resolve) => resolve(result),
  };
  return query;
}

/**
 * Builds a fake `supabase.from(table)` chain that always resolves to
 * `result`, regardless of which builder methods are called on it — enough
 * to unit test each repository function's happy/error path without a real
 * network call, since these functions only branch on the final
 * `{ data, error }`, not on the query shape itself.
 */
export function createFakeSupabaseClient(result: FakeResult) {
  const query = buildQuery(result);
  const from = vi.fn(() => query);
  return { from, query };
}

/**
 * Like `createFakeSupabaseClient`, but each successive `.from()` call
 * resolves to the next result in `results` — needed for repository
 * functions (e.g. `unlockAchievement`'s ignoreDuplicates fallback) that
 * make more than one `.from()` call in a single execution.
 */
export function createFakeSupabaseClientSequence(results: FakeResult[]) {
  let call = 0;
  const from = vi.fn(() => {
    const result = results[Math.min(call, results.length - 1)]!;
    call += 1;
    return buildQuery(result);
  });
  return { from };
}
