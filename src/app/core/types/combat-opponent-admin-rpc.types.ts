import {
  CombatOpponentAttackSourceDraft,
  CombatOpponentDefinitionDraft,
  CombatOpponentEquipmentEntryDraft,
  CombatOpponentFamilyDraft,
  CombatOpponentStatValueDraft,
} from '../domain/combat/combat-opponent.model';

export type UpsertCombatOpponentFamilyInput = CombatOpponentFamilyDraft;
export type UpsertCombatOpponentDefinitionInput = CombatOpponentDefinitionDraft;
export type UpsertCombatOpponentStatValueInput = CombatOpponentStatValueDraft;
export type UpsertCombatOpponentAttackSourceInput = CombatOpponentAttackSourceDraft;
export type UpsertCombatOpponentEquipmentEntryInput = CombatOpponentEquipmentEntryDraft;
