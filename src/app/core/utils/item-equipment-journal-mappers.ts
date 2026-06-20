import {
  CurrentEquipmentLoadout,
  EQUIPMENT_OPERATION_ACTIONS,
  EquipmentOperationAction,
  EquipmentOperationJournal,
  EquipmentOperationJournalEntry,
  EquippedItemSummary,
} from '../domain/item/item-equipment.model';
import { Json } from '../types/database.types';
import { EquipmentOperationRpcRow } from '../types/item-equipment-rpc.types';
import {
  booleanValue,
  jsonRecord,
  JsonRecord,
  mapJsonArray,
  numberValue,
  optionalNumber,
  optionalText,
  read,
  requiredArray,
  requiredBoolean,
  requiredText,
} from './json-read';

export function mapEquipmentOperationJournal(
  row: EquipmentOperationRpcRow,
): EquipmentOperationJournal {
  const entries = operationJournalEntries(row);
  const diagnostics = read(jsonRecord(operationJournalValue(row)), 'diagnostics');
  const finalEquipment = finalEquipmentFromJson(row.final_equipment_json);

  return {
    requestId: row.request_id,
    success: row.success,
    equipped: entriesFor(entries, 'equipped'),
    shifted: entriesFor(entries, 'shifted'),
    unequipped: entriesFor(entries, 'unequipped'),
    failed: entriesFor(entries, 'failed'),
    skipped: entriesFor(entries, 'skipped'),
    finalEquipment,
    diagnostics: diagnostics === undefined ? null : diagnostics,
    visibleArmoryItemsJson: 'visible_items_json' in row
      ? row.visible_items_json
      : null,
    armoryStateJson: 'armory_state_json' in row
      ? row.armory_state_json
      : null,
  };
}

function operationJournalValue(row: EquipmentOperationRpcRow): Json {
  return 'result_journal_json' in row
    ? row.result_journal_json
    : row.journal_json;
}

function operationJournalEntries(
  row: EquipmentOperationRpcRow,
): EquipmentOperationJournalEntry[] {
  const record = jsonRecord(operationJournalValue(row));
  if (!record) {
    return [];
  }

  return EQUIPMENT_OPERATION_ACTIONS.flatMap((action) =>
    entriesForGroupedRecord(record, action),
  );
}

function entriesFor(
  entries: readonly EquipmentOperationJournalEntry[],
  action: EquipmentOperationAction,
): EquipmentOperationJournalEntry[] {
  return entries.filter((entry) => entry.action === action);
}

function entriesForGroupedRecord(
  journal: JsonRecord,
  action: EquipmentOperationAction,
): EquipmentOperationJournalEntry[] {
  return mapJsonArray(read(journal, action), (entry) =>
    mapOperationEntry(entry, action),
  );
}

function mapOperationEntry(
  entry: JsonRecord,
  fallbackAction: EquipmentOperationAction,
): EquipmentOperationJournalEntry {
  const details = read(entry, 'detailsJson');

  return {
    action: fallbackAction,
    itemId: optionalText(read(entry, 'itemId')),
    slotKey: optionalText(read(entry, 'targetSlotKey')),
    reason: optionalText(read(entry, 'reasonKey')),
    message: optionalText(read(entry, 'statusMessage')),
    success: booleanValue(read(entry, 'success')),
    detailsJson: details === undefined ? null : details,
  };
}

function finalEquipmentFromJson(value: Json): CurrentEquipmentLoadout | null {
  return Array.isArray(value) ? finalEquipmentFromRuntimeRows(value) : null;
}

function finalEquipmentFromRuntimeRows(value: Json[]): CurrentEquipmentLoadout {
  const rows = requiredArray(value, 'final_equipment_json');
  const firstRow = rows[0];

  if (!firstRow) {
    throw new Error('final_equipment_json runtime rows must include hero_id.');
  }

  return {
    heroId: requiredText(read(firstRow, 'hero_id'), 'final_equipment_json[0].hero_id'),
    slots: rows
      .filter((row) =>
        requiredBoolean(read(row, 'has_item'), 'final_equipment_json.has_item'),
      )
      .map(mapEquipmentRuntimeSlotJson),
  };
}

function mapEquipmentRuntimeSlotJson(entry: JsonRecord): EquippedItemSummary {
  return {
    itemId: requiredText(read(entry, 'item_id'), 'final_equipment_json.item_id'),
    heroId: requiredText(read(entry, 'hero_id'), 'final_equipment_json.hero_id'),
    ownerHeroId: null,
    itemName: requiredText(read(entry, 'item_name'), 'final_equipment_json.item_name'),
    lifecycleStatus: requiredText(
      read(entry, 'item_status_key'),
      'final_equipment_json.item_status_key',
    ) as EquippedItemSummary['lifecycleStatus'],
    generationBaseId: optionalText(read(entry, 'generation_base_id')),
    generationQualityKey: optionalText(read(entry, 'generation_quality_key')),
    prefixAffixId: optionalText(read(entry, 'prefix_affix_id')),
    suffixAffixId: optionalText(read(entry, 'suffix_affix_id')),
    slotKey: requiredText(read(entry, 'slot_key'), 'final_equipment_json.slot_key'),
    slotLabel: requiredText(read(entry, 'slot_label'), 'final_equipment_json.slot_label'),
    slotSortOrder: numberValue(read(entry, 'slot_sort_order')),
    equipmentArea: requiredText(
      read(entry, 'equipment_area'),
      'final_equipment_json.equipment_area',
    ),
    equipmentSlotGroup: requiredText(
      read(entry, 'equipment_slot_group'),
      'final_equipment_json.equipment_slot_group',
    ),
    equippedAt: requiredText(read(entry, 'equipped_at'), 'final_equipment_json.equipped_at'),
    baseKey: optionalText(read(entry, 'base_key')),
    baseName: optionalText(read(entry, 'base_name')),
    baseTypeKey: optionalText(read(entry, 'base_type_key')),
    handUsage: optionalText(read(entry, 'hand_usage')),
    qualityLabel: optionalText(read(entry, 'quality_label')),
    qualityMultiplier: optionalNumber(read(entry, 'quality_multiplier')),
    prefixKey: optionalText(read(entry, 'prefix_key')),
    prefixName: optionalText(read(entry, 'prefix_name')),
    suffixKey: optionalText(read(entry, 'suffix_key')),
    suffixName: optionalText(read(entry, 'suffix_name')),
    isRuntimeUsable: requiredBoolean(
      read(entry, 'is_runtime_usable'),
      'final_equipment_json.is_runtime_usable',
    ),
  };
}
