import { map, type OperatorFunction } from 'rxjs';
import { trimToNull } from './normalize-text';

export function firstRpcRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no row.`);
  }

  return row;
}

export function requireSingleRpcRow<T>(rows: readonly T[], source: string): T {
  if (rows.length !== 1) {
    throw new Error(`${source}:row_count:${rows.length}`);
  }

  return rows[0];
}

export function optionalSingleRpcRow<T>(rows: readonly T[], source: string): T | null {
  if (rows.length > 1) {
    throw new Error(`${source}:row_count:${rows.length}`);
  }

  return rows[0] ?? null;
}

export function mapRequiredRpcResultRow<TRow, TResult>(
  source: string,
  mapper: (row: TRow) => TResult,
): OperatorFunction<readonly TRow[], TResult> {
  return map((rows) => mapper(requireSingleRpcRow(rows, source)));
}

export function mapOptionalRpcResultRow<TRow, TResult>(
  source: string,
  mapper: (row: TRow) => TResult,
): OperatorFunction<readonly TRow[], TResult | null> {
  return map((rows) => {
    const row = optionalSingleRpcRow(rows, source);

    return row === null ? null : mapper(row);
  });
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
