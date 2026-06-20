import type {
  PlayerArmoryPageContextReadModel,
  PlayerArmoryReadModel,
} from '../../domain/item/player-armory-page-context.model';

export interface ArmoryInventoryMutationHandlers {
  currentContextKey: () => string | null;
  applyReadModel: (readModel: PlayerArmoryReadModel) => void;
  reload: () => void;
}

export interface ArmoryEquipmentMutationHandlers {
  currentContextKey: () => string | null;
  applyContext: (context: PlayerArmoryPageContextReadModel) => void;
  reload: () => void;
}
