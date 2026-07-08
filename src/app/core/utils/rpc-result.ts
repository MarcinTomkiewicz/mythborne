import { trimToNull } from './normalize-text';

export function firstRpcRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName}:row_count:0`);
  }

  return row;
}

export function requireSingleRpcRow<T>(rows: readonly T[], source: string): T {
  if (rows.length !== 1) {
    throw new Error(`${source}:row_count:${rows.length}`);
  }

  return rows[0];
}

export function assertSuccessfulRpcRow<T>(rows: readonly T[], rpcName: string): T {
  const row = firstRpcRow(rows, rpcName);
  const record = row as Record<string, unknown>;

  if (record['success'] === false) {
    throw new Error(
      trimToNull(record['message'])
      ?? trimToNull(record['reason'])
      ?? `${rpcName}:success:false`,
    );
  }

  return row;
}
