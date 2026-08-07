import { vi } from 'vitest'

// Shared fakes for API-route tests. Routes are exercised as plain
// functions: the Supabase entry points (server/admin clients) get
// vi.mock'd per test file, and these helpers build the objects those
// mocks return.
//
// The query chain is a thenable whose builder methods all return the chain
// itself, so any `.select().eq().single()` / `.gte().lte().eq()` shape a
// route writes resolves to the result queued for that table. Successive
// `from(table)` calls on the same table consume successive queue entries
// (last entry repeats), which covers routes that hit one table twice
// (e.g. deleting then re-inserting rows).

const CHAIN_METHODS = ['select', 'eq', 'neq', 'gte', 'lte', 'lt', 'in', 'is', 'not', 'update', 'upsert', 'insert', 'delete', 'order', 'limit'] as const

export interface QueryChain {
  select: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  neq: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  lte: ReturnType<typeof vi.fn>
  lt: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  is: ReturnType<typeof vi.fn>
  not: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  upsert: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
  then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => Promise<unknown>
}

function makeChain(result: unknown): QueryChain {
  const chain = {} as QueryChain
  for (const m of CHAIN_METHODS) chain[m] = vi.fn(() => chain)
  chain.single = vi.fn(() => Promise.resolve(result))
  chain.maybeSingle = vi.fn(() => Promise.resolve(result))
  chain.then = (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected)
  return chain
}

export interface SupabaseMock {
  client: {
    auth: { getUser: ReturnType<typeof vi.fn> }
    from: ReturnType<typeof vi.fn>
  }
  // Every chain handed out, in call order, for asserting builder arguments.
  chainFor: (table: string, nth?: number) => QueryChain
}

export function makeSupabaseMock(opts: {
  user?: { id: string } | null
  // Per-table results. An array queues results for successive from() calls;
  // a single value answers every call.
  tables?: Record<string, unknown>
}): SupabaseMock {
  const issued: { table: string; chain: QueryChain }[] = []
  const counts: Record<string, number> = {}

  const from = vi.fn((table: string) => {
    const spec = opts.tables?.[table]
    const queue = Array.isArray(spec) ? spec : [spec ?? {}]
    const idx = Math.min(counts[table] ?? 0, queue.length - 1)
    counts[table] = (counts[table] ?? 0) + 1
    const chain = makeChain(queue[idx])
    issued.push({ table, chain })
    return chain
  })

  return {
    client: {
      auth: { getUser: vi.fn(async () => ({ data: { user: opts.user ?? null } })) },
      from,
    },
    chainFor: (table, nth = 0) => {
      const match = issued.filter(c => c.table === table)[nth]
      if (!match) throw new Error(`no from('${table}') call #${nth} was made`)
      return match.chain
    },
  }
}

export function postJson(body: unknown): Request {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}
