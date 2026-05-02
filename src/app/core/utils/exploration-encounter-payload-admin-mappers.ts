import {
  EncounterEffectPayloadAdminView,
  EncounterEffectPayloadReadModel,
  EncounterResourcePayloadAdminView,
  EncounterResourcePayloadReadModel,
  ExplorationEncounterAdminData,
  ExplorationEffectDefinitionAdminView,
  ExplorationEffectDefinitionReadModel,
} from '../domain/exploration/exploration-encounter-admin.model';
import { REWARD_AMOUNT_MODE } from '../constants/reward-runtime-keys.const';
import { Row } from '../types/supabase.types';
import {
  resourceTypeDescription,
  resourceTypeDisplayLabel,
} from './resource-type-options';

export function mapEncounterResourcePayload(
  row: Row<'encounter_resource_payloads'>,
): EncounterResourcePayloadReadModel {
  return {
    id: row.id,
    encounterDefinitionId: row.encounter_definition_id,
    resourceType: row.resource_type,
    amountMode: row.amount_mode,
    minAmount: row.min_amount,
    maxAmount: row.max_amount,
    formulaId: row.formula_id,
    chancePercent: row.chance_percent,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapExplorationEffectDefinition(
  row: Row<'exploration_effect_definitions'>,
): ExplorationEffectDefinitionReadModel {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    effectKind: row.effect_kind,
    bonusTemplateId: row.bonus_template_id,
    defaultValue: row.default_value,
    defaultDurationSteps: row.default_duration_steps,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEncounterEffectPayload(
  row: Row<'encounter_effect_payloads'>,
): EncounterEffectPayloadReadModel {
  return {
    id: row.id,
    encounterDefinitionId: row.encounter_definition_id,
    effectDefinitionId: row.effect_definition_id,
    chancePercent: row.chance_percent,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toEncounterResourcePayloadAdminViews(
  data: ExplorationEncounterAdminData,
  encounterId: string,
): EncounterResourcePayloadAdminView[] {
  return data.resourcePayloads
    .filter((entry) => entry.encounterDefinitionId === encounterId)
    .map((payload) => {
      const formula = payload.formulaId
        ? data.formulas.find((entry) => entry.id === payload.formulaId)
        : null;

      return {
        payload,
        resourceTypeLabel: resourceTypeDisplayLabel(data.resourceTypes, payload.resourceType),
        resourceTypeDescription: resourceTypeDescription(data.resourceTypes, payload.resourceType),
        formulaLabel: formula ? `${formula.label} (${formula.key})` : 'No formula',
        amountLabel: resourceAmountLabel(payload),
      };
    });
}

export function toExplorationEffectDefinitionAdminViews(
  data: ExplorationEncounterAdminData,
  effectKind: string | null = null,
): ExplorationEffectDefinitionAdminView[] {
  return data.effectDefinitions
    .filter((entry) => !effectKind || entry.effectKind === effectKind)
    .map((effect) => {
      const template = effect.bonusTemplateId
        ? data.bonusTemplates.find((entry) => entry.id === effect.bonusTemplateId)
        : null;

      return {
        effect,
        bonusTemplateLabel: template
          ? `${template.label} (${template.key})`
          : effect.bonusTemplateId ?? 'No bonus template',
        defaultBehaviorLabel: defaultEffectBehaviorLabel(effect),
      };
    });
}

export function toEncounterEffectPayloadAdminViews(
  data: ExplorationEncounterAdminData,
  encounterId: string,
): EncounterEffectPayloadAdminView[] {
  return data.effectPayloads
    .filter((entry) => entry.encounterDefinitionId === encounterId)
    .map((payload) => {
      const effect = data.effectDefinitions.find(
        (entry) => entry.id === payload.effectDefinitionId,
      );

      return {
        payload,
        effectLabel: effect ? `${effect.label} (${effect.key})` : payload.effectDefinitionId,
        effectDescription: effect?.description ?? null,
        effectKind: effect?.effectKind ?? null,
      };
    });
}

function resourceAmountLabel(payload: EncounterResourcePayloadReadModel): string {
  if (payload.amountMode === REWARD_AMOUNT_MODE.formula) {
    return 'Formula-backed amount';
  }

  if (payload.minAmount !== null && payload.maxAmount !== null) {
    return payload.minAmount === payload.maxAmount
      ? `${payload.minAmount}`
      : `${payload.minAmount}-${payload.maxAmount}`;
  }

  return 'Amount not configured';
}

function defaultEffectBehaviorLabel(effect: ExplorationEffectDefinitionReadModel): string {
  const value = effect.defaultValue === null ? 'no default value' : `value ${effect.defaultValue}`;
  const duration =
    effect.defaultDurationSteps === null
      ? 'runtime duration'
      : `${effect.defaultDurationSteps} step(s)`;

  return `${value}, ${duration}`;
}
