import {
  ArmoryItemSummary,
  ArmoryShelfReadModel,
  CurrentEquipmentLoadout,
  EquipmentOperationAction,
  EquipmentOperationJournal,
  EquipmentOperationJournalEntry,
  EquipmentSlot,
  EquippedItemSummary,
  HeroArmoryReadModel,
} from '../domain/item/item-equipment.model';
import { Json } from '../types/database.types';
import {
  EquipmentOperationRpcRow,
  GetHeroArmoryItemsRpcRow,
  GetHeroArmoryVisibilityStateRpcRow,
  GetHeroEquipmentRuntimeSlotsRpcRow,
} from '../types/item-equipment-rpc.types';
import {
  booleanValue,
  jsonRecord,
  JsonRecord,
  mapJsonArray,
  numberValue,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  text,
} from './json-read';
import { Row } from '../types/supabase.types';

export function mapEquipmentSlot(row: Row<'equipment_slot_definitions'>): EquipmentSlot {
  return {
    slotKey: row.key,
    label: row.label,
    sortOrder: row.sort_order,
    equipmentArea: row.equipment_area,
    equipmentSlotGroup: row.equipment_area,
  };
}

export function mapEquippedItemSummary(
  row: GetHeroEquipmentRuntimeSlotsRpcRow,
): EquippedItemSummary {
  return {
    itemId: row.item_id,
    heroId: row.hero_id,
    ownerHeroId: null,
    itemName: row.item_name,
    lifecycleStatus: row.item_status_key as EquippedItemSummary['lifecycleStatus'],
    generationBaseId: row.generation_base_id,
    generationQualityKey: row.generation_quality_key,
    prefixAffixId: row.prefix_affix_id,
    suffixAffixId: row.suffix_affix_id,
    slotKey: row.slot_key,
    slotLabel: row.slot_label,
    slotSortOrder: row.slot_sort_order,
    equipmentArea: row.equipment_area,
    equipmentSlotGroup: row.equipment_slot_group,
    equippedAt: row.equipped_at,
    baseKey: row.base_key,
    baseName: row.base_name,
    baseTypeKey: row.base_type_key,
    handUsage: row.hand_usage,
    qualityLabel: row.quality_label,
    qualityMultiplier: row.quality_multiplier,
    prefixKey: row.prefix_key,
    prefixName: row.prefix_name,
    suffixKey: row.suffix_key,
    suffixName: row.suffix_name,
    isRuntimeUsable: row.is_runtime_usable,
  };
}

export function mapCurrentEquipmentLoadout(
  heroId: string,
  rows: readonly GetHeroEquipmentRuntimeSlotsRpcRow[],
): CurrentEquipmentLoadout {
  return {
    heroId,
    slots: [...rows]
      .filter((row) => row.has_item)
      .sort((left, right) => left.slot_sort_order - right.slot_sort_order)
      .map(mapEquippedItemSummary),
  };
}

export function mapHeroArmoryReadModel(
  heroId: string,
  visibility: GetHeroArmoryVisibilityStateRpcRow,
  itemRows: readonly GetHeroArmoryItemsRpcRow[],
): HeroArmoryReadModel {
  const itemsByShelf = new Map<number, ArmoryItemSummary[]>();

  for (const item of itemRows) {
    const summary = armoryRpcItemSummary(item);
    const currentItems = itemsByShelf.get(summary.shelfPosition) ?? [];

    itemsByShelf.set(summary.shelfPosition, [...currentItems, summary]);
  }

  const shelves = [
    armoryShelfFromJson(heroId, visibility.unsorted_json, 0, true),
    ...mapJsonArray(visibility.shelves_json, (entry) => entry)
      .sort((left, right) =>
        armoryShelfPosition(left, 0) - armoryShelfPosition(right, 0),
      )
      .map((entry) =>
        armoryShelfFromJson(heroId, entry, armoryShelfPosition(entry, 0), false),
      ),
  ].map((shelf) => ({
    ...shelf,
    visibleItems: sortArmoryItems(itemsByShelf.get(shelf.position) ?? []),
  }));
  const visibleItems = sortArmoryItems(itemRows.map(armoryRpcItemSummary));

  return {
    heroId,
    shelves,
    visibleItems,
    visibility: {
      visibleItemCount: visibility.visible_item_count,
      totalOwnedItemCount: visibility.total_owned_item_count,
      hiddenItemCount: visibility.hidden_item_count,
      visibilityLimit: visibility.visibility_limit,
      visibilityLimitSource: visibility.visibility_limit_source,
      sourceConfigJson: visibility.source_config_json,
      visibleStatuses: visibility.visible_statuses,
      unsortedJson: visibility.unsorted_json,
      shelvesJson: visibility.shelves_json,
    },
  };
}

function armoryRpcItemSummary(
  row: GetHeroArmoryItemsRpcRow,
): ArmoryItemSummary {
  return {
    itemId: row.item_id,
    ownerHeroId: row.hero_id,
    serverId: row.server_id,
    name: row.item_name,
    description: null,
    lifecycleStatus: row.item_status,
    generationBaseId: row.generation_base_id,
    generationQualityKey: row.generation_quality_key,
    prefixAffixId: row.prefix_affix_id,
    suffixAffixId: row.suffix_affix_id,
    armoryShelfPosition: row.armory_shelf_position,
    drachmaValue: row.drachma_value,
    shelfPosition: row.armory_shelf_position,
    shelfName: row.shelf_name,
    requirementPreview: null,
  };
}

function armoryShelfFromJson(
  heroId: string,
  value: Json,
  fallbackPosition: number,
  isUnsortedDropArea: boolean,
): ArmoryShelfReadModel {
  const record = jsonRecord(value);
  const rawPosition = armoryShelfPosition(record, fallbackPosition);
  const position = isUnsortedDropArea ? 0 : rawPosition;
  const name = optionalText(read(record, 'name', 'label', 'shelfName', 'shelf_name'))
    ?? (isUnsortedDropArea ? 'Unsorted' : `Shelf ${position}`);

  return {
    shelfId: optionalText(read(record, 'shelfId', 'shelf_id', 'id')),
    heroId,
    position,
    name,
    updatedAt: optionalText(read(record, 'updatedAt', 'updated_at')),
    isPersisted: optionalBoolean(read(record, 'isPersisted', 'is_persisted', 'exists'))
      ?? !isUnsortedDropArea,
    isUnsortedDropArea,
    visibleItems: [],
  };
}

function armoryShelfPosition(
  record: JsonRecord | null,
  fallbackPosition: number,
): number {
  return optionalNumber(read(record, 'shelfPosition', 'shelf_position', 'position'))
    ?? fallbackPosition;
}

function sortArmoryItems(items: readonly ArmoryItemSummary[]): ArmoryItemSummary[] {
  return [...items].sort((left, right) => left.shelfPosition - right.shelfPosition
    || left.name.localeCompare(right.name)
    || left.itemId.localeCompare(right.itemId));
}

export function mapEquipmentOperationJournal(
  row: EquipmentOperationRpcRow,
): EquipmentOperationJournal {
  const entries = operationJournalEntries(row);
  const diagnostics = read(jsonRecord(operationJournalValue(row)), 'diagnostics', 'diagnosticsJson');

  return {
    requestId: row.request_id,
    success: row.success,
    equipped: entriesFor(entries, 'equipped'),
    shifted: entriesFor(entries, 'shifted'),
    unequipped: entriesFor(entries, 'unequipped'),
    failed: entriesFor(entries, 'failed'),
    skipped: entriesFor(entries, 'skipped'),
    finalEquipment: finalEquipmentFromJson(row.final_equipment_json),
    diagnostics: diagnostics === undefined ? null : diagnostics,
  };
}

function operationJournalValue(row: EquipmentOperationRpcRow): Json {
  if ('result_journal_json' in row) {
    return row.result_journal_json;
  }

  return row.journal_json;
}

function operationJournalEntries(
  row: EquipmentOperationRpcRow,
): EquipmentOperationJournalEntry[] {
  const value = operationJournalValue(row);

  if (Array.isArray(value)) {
    return flattenJournalArray(value);
  }

  const record = jsonRecord(value);
  if (!record) {
    return [];
  }

  return ([
    'equipped',
    'shifted',
    'unequipped',
    'failed',
    'skipped',
  ] as const).flatMap((action) => entriesForGroupedRecord(record, action));
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
  return mapJsonArray(read(journal, action), (entry) => [
    mapOperationEntry(entry, action),
    ...nestedJournalEntries(entry),
  ]).flat();
}

function flattenJournalArray(value: readonly Json[]): EquipmentOperationJournalEntry[] {
  return value.flatMap((entry) => {
    const record = jsonRecord(entry);

    return record
      ? [
          mapOperationEntry(record, 'skipped'),
          ...nestedJournalEntries(record),
        ]
      : [];
  });
}

function nestedJournalEntries(entry: JsonRecord): EquipmentOperationJournalEntry[] {
  const nested = read(entry, 'journal', 'journalJson', 'journal_json');

  if (!Array.isArray(nested)) {
    return [];
  }

  return flattenJournalArray(nested);
}

function mapOperationEntry(
  entry: JsonRecord,
  fallbackAction: EquipmentOperationAction,
): EquipmentOperationJournalEntry {
  const details = read(entry, 'detailsJson', 'details_json', 'details', 'rawJson');
  const action = operationAction(
    read(entry, 'action', 'actionKey', 'action_key'),
    fallbackAction,
  );

  return {
    action,
    itemId: optionalText(read(entry, 'itemId', 'item_id')),
    slotKey: optionalText(read(entry, 'slotKey', 'slot_key', 'targetSlotKey', 'target_slot_key')),
    reason: optionalText(read(entry, 'reason', 'reasonKey', 'reason_key')),
    message: optionalText(read(entry, 'message', 'statusMessage', 'status_message')),
    success: optionalBoolean(read(entry, 'success')) ?? action !== 'failed',
    detailsJson: details === undefined ? null : details,
  };
}

function operationAction(
  value: Json | undefined,
  fallback: EquipmentOperationAction,
): EquipmentOperationAction {
  return value === 'equipped' || value === 'shifted' || value === 'unequipped'
    || value === 'failed' || value === 'skipped'
    ? value
    : fallback;
}

function finalEquipmentFromJson(value: Json): CurrentEquipmentLoadout | null {
  const record = jsonRecord(value);
  const rows = mapJsonArray(
    record ? read(record, 'slots', 'equipment', 'finalEquipment') : value,
    mapEquipmentSlotJson,
  );

  return rows.length ? { heroId: rows[0]?.heroId ?? '', slots: rows } : null;
}

function mapEquipmentSlotJson(entry: JsonRecord): EquippedItemSummary {
  return {
    itemId: text(read(entry, 'itemId', 'item_id')),
    heroId: text(read(entry, 'heroId', 'hero_id')),
    ownerHeroId: optionalText(read(entry, 'ownerHeroId', 'owner_hero_id')),
    itemName: text(read(entry, 'itemName', 'item_name', 'name')),
    lifecycleStatus: text(read(entry, 'itemStatus', 'item_status', 'status')) as EquippedItemSummary['lifecycleStatus'],
    generationBaseId: optionalText(read(entry, 'generationBaseId', 'generation_base_id')),
    generationQualityKey: optionalText(read(entry, 'generationQualityKey', 'generation_quality_key')),
    prefixAffixId: optionalText(read(entry, 'prefixAffixId', 'prefix_affix_id')),
    suffixAffixId: optionalText(read(entry, 'suffixAffixId', 'suffix_affix_id')),
    slotKey: text(read(entry, 'slotKey', 'slot_key')),
    slotLabel: text(read(entry, 'slotLabel', 'slot_label')),
    slotSortOrder: numberValue(read(entry, 'slotSortOrder', 'slot_sort_order')),
    equipmentArea: text(read(entry, 'equipmentArea', 'equipment_area')),
    equipmentSlotGroup: text(read(entry, 'equipmentSlotGroup', 'equipment_slot_group')),
    equippedAt: text(read(entry, 'equippedAt', 'equipped_at')),
    baseKey: optionalText(read(entry, 'baseKey', 'base_key')),
    baseName: optionalText(read(entry, 'baseName', 'base_name')),
    baseTypeKey: optionalText(read(entry, 'baseTypeKey', 'base_type_key')),
    handUsage: optionalText(read(entry, 'handUsage', 'hand_usage')),
    qualityLabel: optionalText(read(entry, 'qualityLabel', 'quality_label')),
    qualityMultiplier: optionalNumber(read(entry, 'qualityMultiplier', 'quality_multiplier')),
    prefixKey: optionalText(read(entry, 'prefixKey', 'prefix_key')),
    prefixName: optionalText(read(entry, 'prefixName', 'prefix_name')),
    suffixKey: optionalText(read(entry, 'suffixKey', 'suffix_key')),
    suffixName: optionalText(read(entry, 'suffixName', 'suffix_name')),
    isRuntimeUsable: booleanValue(read(entry, 'isRuntimeUsable', 'is_runtime_usable')),
  };
}
