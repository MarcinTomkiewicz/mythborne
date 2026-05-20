import { BulkMoveArmoryItemsToShelfResult } from '../domain/item/armory-actions.model';
import { ToastSeverity } from '../types/toast.types';

export function armoryBulkMoveToastMessage(
  result: BulkMoveArmoryItemsToShelfResult,
) {
  if (!result.success || result.failedCount > 0) {
    const movedDetail = result.movedCount > 0
      ? `You moved ${itemCount(result.movedCount)} to ${result.targetShelfName}. `
      : '';
    const skippedDetail = result.skippedCount > 0
      ? `${itemCount(result.skippedCount, true)} were already there or skipped. `
      : '';
    const failedDetail =
      `${itemCount(result.failedCount || 1, true)} could not be moved.`;
    const journalSummary = bulkMoveJournalSummary(result);

    return bulkMoveToastMessage(
      result.movedCount > 0 ? 'warn' : 'error',
      result.movedCount > 0
        ? 'Bulk move partially applied'
        : 'Bulk move failed',
      `${movedDetail}${skippedDetail}${failedDetail}`
        + (journalSummary ? ` ${journalSummary}` : ''),
    );
  }

  if (result.movedCount === 0 && result.skippedCount > 0) {
    return bulkMoveToastMessage(
      'warn',
      'No items moved',
      `The selected items were already in ${result.targetShelfName} or were skipped.`,
    );
  }

  if (result.skippedCount > 0 || result.movedCount < result.selectedCount) {
    const skippedCount =
      result.skippedCount || Math.max(result.selectedCount - result.movedCount, 0);

    return bulkMoveToastMessage(
      'warn',
      'Bulk move partially applied',
      `You moved ${itemCount(result.movedCount)} to ${result.targetShelfName}. `
        + `${itemCount(skippedCount, true)} were already there or skipped.`,
    );
  }

  return bulkMoveToastMessage(
    'success',
    'Items moved',
    `You moved ${itemCount(result.movedCount)} to ${result.targetShelfName}.`,
  );
}

function bulkMoveToastMessage(
  severity: ToastSeverity,
  summary: string,
  detail: string,
) {
  return { severity, summary, detail };
}

function bulkMoveJournalSummary(
  result: BulkMoveArmoryItemsToShelfResult,
): string {
  const notableActions = result.resultJournal
    .filter((entry) =>
      entry.status === 'failed'
      || entry.actionKey === 'already_on_target_shelf'
      || entry.actionKey === 'duplicate_input_skipped',
    )
    .map((entry) => entry.message ?? entry.actionKey)
    .filter((value): value is string => Boolean(value));
  const uniqueActions = [...new Set(notableActions)];

  return uniqueActions.length ? `Details: ${uniqueActions.join(', ')}.` : '';
}

function itemCount(count: number, capitalize = false): string {
  const label = count === 1 ? 'item' : 'items';
  const text = `${count} ${label}`;

  return capitalize ? `${text[0].toUpperCase()}${text.slice(1)}` : text;
}
