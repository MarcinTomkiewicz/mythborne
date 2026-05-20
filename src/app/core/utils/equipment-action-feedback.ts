import {
  EquipmentOperationJournal,
  EquipmentOperationJournalEntry,
} from '../domain/item/item-equipment.model';
import { ToastSeverity } from '../types/toast.types';

export function equipmentActionToastMessage(
  journal: EquipmentOperationJournal,
) {
  const failedCount = journal.failed.length;
  const skippedCount = journal.skipped.length;
  const equippedCount = equipmentActionItemCount(journal.equipped);
  const unequippedCount = equipmentActionItemCount(journal.unequipped);
  const visibleActionCount = equippedCount + unequippedCount;

  if (!journal.success || failedCount > 0) {
    return equipmentToastMessage(
      'error',
      'Equipment action failed',
      `${failedCount || 1} failed, ${skippedCount} skipped.`,
    );
  }

  if (skippedCount > 0) {
    return equipmentToastMessage(
      'warn',
      'Equipment action partially applied',
      equipmentActionDetail(equippedCount, unequippedCount, skippedCount),
    );
  }

  if (visibleActionCount === 0) {
    return null;
  }

  return equipmentToastMessage(
    'success',
    equipmentActionSummary(equippedCount, unequippedCount),
    equipmentActionDetail(equippedCount, unequippedCount, 0),
  );
}

function equipmentToastMessage(
  severity: ToastSeverity,
  summary: string,
  detail: string,
) {
  return { severity, summary, detail };
}

function equipmentActionSummary(
  equippedCount: number,
  unequippedCount: number,
): string {
  if (equippedCount > 0 && unequippedCount === 0) {
    return equippedCount === 1 ? 'Item equipped' : `${equippedCount} items equipped`;
  }

  if (unequippedCount > 0 && equippedCount === 0) {
    return unequippedCount === 1
      ? 'Item unequipped'
      : `${unequippedCount} items unequipped`;
  }

  return 'Equipment updated';
}

function equipmentActionDetail(
  equippedCount: number,
  unequippedCount: number,
  skippedCount: number,
): string {
  const parts = [
    equippedCount > 0 ? `${itemCount(equippedCount)} equipped` : '',
    unequippedCount > 0 ? `${itemCount(unequippedCount)} unequipped` : '',
    skippedCount > 0 ? `${skippedCount} skipped` : '',
  ].filter(Boolean);

  return parts.length ? `${parts.join(', ')}.` : `${skippedCount} skipped.`;
}

function itemCount(count: number): string {
  return `${count} item${count === 1 ? '' : 's'}`;
}

function equipmentActionItemCount(
  entries: readonly EquipmentOperationJournalEntry[],
): number {
  return new Set(entries
    .map((entry) => entry.itemId)
    .filter((itemId): itemId is string => itemId !== null))
    .size;
}
