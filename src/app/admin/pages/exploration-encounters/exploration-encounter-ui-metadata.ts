import {
  ENCOUNTER_CONFIGURATOR_FIELD_METADATA_KEYS,
  ENCOUNTER_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
  ENCOUNTER_CONFIGURATOR_SECTION_METADATA_KEYS,
  ENCOUNTER_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
} from '../../../core/constants/exploration-encounter-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  metadataEntry,
  metadataText,
  missingUiMetadataGaps,
  missingUiMetadataLabel,
} from '../../../core/utils/admin-ui-metadata';

export const ENCOUNTER_SECTION_METADATA = {
  pageHeader: 'page_header',
  encounterMeaning: 'encounter_meaning',
  encounterDefinition: 'encounter_definition',
  rewardAssignments: 'reward_assignments',
  combatCandidates: 'combat_candidates',
  kindSpecificPayloads: 'kind_specific_payloads',
  resourcePayloads: 'resource_payloads',
  effectLibrary: 'effect_library',
  effectPayloads: 'effect_payloads',
} as const;

export const ENCOUNTER_FIELD_METADATA = {
  encounterKey: 'encounter_key',
  encounterKind: 'encounter_kind',
  minigame: 'minigame',
  directRewardProfile: 'direct_reward_profile',
  minDifficulty: 'min_difficulty',
  maxDifficulty: 'max_difficulty',
  minDistrict: 'min_district',
  maxDistrict: 'max_district',
  definitionReason: 'definition_reason',
  rewardProfile: 'reward_profile',
  outcomeKind: 'outcome_kind',
  difficultyMatchKind: 'difficulty_match_kind',
  districtMatchKind: 'district_match_kind',
  assignmentHelperText: 'assignment_helper_text',
  assignmentReason: 'assignment_reason',
  candidateKind: 'candidate_kind',
  scalingFormula: 'scaling_formula',
  difficultyMultiplier: 'difficulty_multiplier',
  weight: 'weight',
  candidateReason: 'candidate_reason',
  resourceType: 'resource_type',
  resourceAmountMode: 'resource_amount_mode',
  resourceFormula: 'resource_formula',
  resourceReason: 'resource_reason',
  effectKey: 'effect_key',
  effectKind: 'effect_kind',
  bonusTemplate: 'bonus_template',
  effectDuration: 'effect_duration',
  effectDefinitionReason: 'effect_definition_reason',
  effectPayloadDefinition: 'effect_payload_definition',
  effectPayloadReason: 'effect_payload_reason',
} as const;

export class ExplorationEncounterUiMetadata {
  readonly section = ENCOUNTER_SECTION_METADATA;
  readonly field = ENCOUNTER_FIELD_METADATA;

  constructor(
    private readonly entries: () => UiMetadataEntryReadModel[],
    private readonly selectedEncounterLabel: () => string | null,
  ) {}

  missingGaps(): string[] {
    return missingUiMetadataGaps(this.entries(), {
      [ENCOUNTER_CONFIGURATOR_SECTION_METADATA_NAMESPACE]:
        ENCOUNTER_CONFIGURATOR_SECTION_METADATA_KEYS,
      [ENCOUNTER_CONFIGURATOR_FIELD_METADATA_NAMESPACE]:
        ENCOUNTER_CONFIGURATOR_FIELD_METADATA_KEYS,
    });
  }

  selectedEncounterScope(prefix: string): string {
    const label = this.selectedEncounterLabel();

    return label ? `${prefix}: ${label}` : prefix;
  }

  sectionLegend(key: string): string | null {
    return metadataEntry(
      this.entries(),
      ENCOUNTER_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    )?.uiGroupLabel ?? null;
  }

  sectionTitle(key: string, includeSelectedEncounterScope = false): string {
    const entry = metadataEntry(
      this.entries(),
      ENCOUNTER_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );
    const title = entry?.label ?? missingUiMetadataLabel(
      ENCOUNTER_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );

    return includeSelectedEncounterScope ? this.selectedEncounterScope(title) : title;
  }

  sectionText(key: string): string {
    return metadataText(
      this.entries(),
      ENCOUNTER_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );
  }

  sectionSecondaryText(key: string): string | null {
    return metadataEntry(
      this.entries(),
      ENCOUNTER_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    )?.impactSummary ?? null;
  }

  fieldHelp(key: string): string {
    return metadataText(
      this.entries(),
      ENCOUNTER_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
      key,
    );
  }
}
