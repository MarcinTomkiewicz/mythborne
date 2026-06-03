import { trimToNull } from './normalize-text';

export function firstRpcRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no row.`);
  }

  return row;
}

export function assertSuccessfulRpcRow<T>(rows: readonly T[], rpcName: string): T {
  const row = firstRpcRow(rows, rpcName);
  const record = row as Record<string, unknown>;

  if (record['success'] === false) {
    throw new Error(
      trimToNull(record['message'])
      ?? trimToNull(record['reason'])
      ?? `${rpcName} returned an unsuccessful operation.`,
    );
  }

  return row;
}
