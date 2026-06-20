import {
  CurrentEquipmentLoadout,
  EquipmentOperationJournal,
} from '../domain/item/item-equipment.model';
import {
  PlayerArmoryPageContextReadModel,
  PlayerArmoryReadModel,
} from '../domain/item/player-armory-page-context.model';
import { mapArmoryEquipmentSlotsFromLoadout } from './armory-page-equipment-slots.mapper';
import { mapArmoryMutationReadModel } from './player-armory-page-context.mapper';

export function armoryContextWithReadModel(
  context: PlayerArmoryPageContextReadModel,
  readModel: PlayerArmoryReadModel,
): PlayerArmoryPageContextReadModel {
  return {
    ...context,
    readModel,
  };
}

export function armoryContextWithEquipmentLoadout(
  context: PlayerArmoryPageContextReadModel,
  loadout: CurrentEquipmentLoadout,
): PlayerArmoryPageContextReadModel {
  return {
    ...context,
    equipmentSlots: mapArmoryEquipmentSlotsFromLoadout(
      context.equipmentSlots,
      loadout,
      context.readModel.visibleItems,
    ),
  };
}

export function armoryContextWithEquipmentJournal(
  context: PlayerArmoryPageContextReadModel,
  journal: EquipmentOperationJournal,
): { context: PlayerArmoryPageContextReadModel; appliedReadModel: boolean } {
  const contextWithLoadout = journal.finalEquipment
    ? armoryContextWithEquipmentLoadout(context, journal.finalEquipment)
    : context;

  if (!journal.visibleArmoryItemsJson || !journal.armoryStateJson) {
    return { context: contextWithLoadout, appliedReadModel: false };
  }

  return {
    context: armoryContextWithReadModel(
      contextWithLoadout,
      mapArmoryMutationReadModel(
        contextWithLoadout.readModel,
        journal.visibleArmoryItemsJson,
        journal.armoryStateJson,
      ),
    ),
    appliedReadModel: true,
  };
}
