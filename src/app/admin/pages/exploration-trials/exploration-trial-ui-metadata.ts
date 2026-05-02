import {
  TRIAL_CONFIGURATOR_FIELD_METADATA_KEYS,
  TRIAL_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
  TRIAL_CONFIGURATOR_SECTION_METADATA_KEYS,
  TRIAL_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
} from '../../../core/constants/exploration-trial-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  metadataEntry,
  metadataText,
  missingUiMetadataGaps,
  missingUiMetadataLabel,
} from '../../../core/utils/admin-ui-metadata';

export const TRIAL_SECTION_METADATA = {
  pageHeader: 'page_header',
  trialMeaning: 'trial_meaning',
  trialDefinition: 'trial_definition',
  rewardAssignments: 'reward_assignments',
  combatCandidates: 'combat_candidates',
} as const;

export const TRIAL_FIELD_METADATA = {
  trialKey: 'trial_key',
  testedStat: 'tested_stat',
  minigame: 'minigame',
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
} as const;

export class ExplorationTrialUiMetadata {
  readonly section = TRIAL_SECTION_METADATA;
  readonly field = TRIAL_FIELD_METADATA;

  constructor(
    private readonly entries: () => UiMetadataEntryReadModel[],
    private readonly selectedTrialLabel: () => string | null,
  ) {}

  missingGaps(): string[] {
    return missingUiMetadataGaps(this.entries(), {
      [TRIAL_CONFIGURATOR_SECTION_METADATA_NAMESPACE]: TRIAL_CONFIGURATOR_SECTION_METADATA_KEYS,
      [TRIAL_CONFIGURATOR_FIELD_METADATA_NAMESPACE]: TRIAL_CONFIGURATOR_FIELD_METADATA_KEYS,
    });
  }

  selectedTrialScope(prefix: string): string {
    const label = this.selectedTrialLabel();

    return label ? `${prefix}: ${label}` : prefix;
  }

  sectionLegend(key: string): string | null {
    return metadataEntry(
      this.entries(),
      TRIAL_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    )?.uiGroupLabel ?? null;
  }

  sectionTitle(key: string, includeSelectedTrialScope = false): string {
    const entry = metadataEntry(
      this.entries(),
      TRIAL_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );
    const title = entry?.label ?? missingUiMetadataLabel(
      TRIAL_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );

    return includeSelectedTrialScope ? this.selectedTrialScope(title) : title;
  }

  sectionText(key: string): string {
    return metadataText(
      this.entries(),
      TRIAL_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );
  }

  sectionSecondaryText(key: string): string | null {
    return metadataEntry(
      this.entries(),
      TRIAL_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    )?.impactSummary ?? null;
  }

  fieldHelp(key: string): string {
    return metadataText(
      this.entries(),
      TRIAL_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
      key,
    );
  }
}
