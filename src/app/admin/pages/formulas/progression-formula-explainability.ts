import {
  LEVEL_UP_REWARD_SECTION_METADATA_KEYS,
  LEVEL_UP_REWARD_SECTION_METADATA_NAMESPACE,
  LEVEL_UP_STAT_BONUS_SECTION_METADATA_KEYS,
  LEVEL_UP_STAT_BONUS_SECTION_METADATA_NAMESPACE,
  PROGRESSION_CONFIGURATOR_SECTION_METADATA_KEYS,
  PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PROGRESSION_DIAGNOSTICS_SECTION_METADATA_KEYS,
  PROGRESSION_DIAGNOSTICS_SECTION_METADATA_NAMESPACE,
} from '../../../core/constants/progression-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { STAT_PROGRESSION_TARGET_KEYS } from '../../../core/types/progression.types';
import {
  FormulaTargetAssignmentRow,
} from '../../../core/types/formula-admin-view.types';
import {
  metadataEntry,
  metadataText,
  missingUiMetadataGaps,
  missingUiMetadataLabel,
} from '../../../core/utils/admin-ui-metadata';

export const PROGRESSION_FORMULA_TARGET_KEYS = [
  STAT_PROGRESSION_TARGET_KEYS.cost,
  STAT_PROGRESSION_TARGET_KEYS.cap,
  'hero_experience_to_next_level',
] as const;

export const PROGRESSION_EXPLAINABILITY_METADATA_SECTIONS = [
  {
    namespace: PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
    keys: [
      'xp_current_vs_lifetime',
      'xp_to_next_level_formula',
      'xp_to_character_points',
      'cp_penalty_sink',
      'append_only_ledgers',
      'no_direct_angular_mutations',
    ],
  },
  {
    namespace: LEVEL_UP_REWARD_SECTION_METADATA_NAMESPACE,
    keys: [
      'level_up_reward_matching',
      'level_up_reward_profile_selection',
    ],
  },
  {
    namespace: LEVEL_UP_STAT_BONUS_SECTION_METADATA_NAMESPACE,
    keys: [
      'level_up_stat_bonus_rules',
      'fixed_stat_bonuses',
      'random_stat_pool_bonuses',
      'level_up_stat_bonus_grants',
    ],
  },
] as const;

export interface ProgressionExplainabilityTextRow {
  key: string;
  namespace: string;
  label: string;
  text: string;
}

export class ProgressionFormulaExplainability {
  constructor(private readonly entries: () => UiMetadataEntryReadModel[]) {}

  missingGaps(): string[] {
    return missingUiMetadataGaps(this.entries(), {
      [PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE]:
        PROGRESSION_CONFIGURATOR_SECTION_METADATA_KEYS,
      [PROGRESSION_DIAGNOSTICS_SECTION_METADATA_NAMESPACE]:
        PROGRESSION_DIAGNOSTICS_SECTION_METADATA_KEYS,
      [LEVEL_UP_REWARD_SECTION_METADATA_NAMESPACE]:
        LEVEL_UP_REWARD_SECTION_METADATA_KEYS,
      [LEVEL_UP_STAT_BONUS_SECTION_METADATA_NAMESPACE]:
        LEVEL_UP_STAT_BONUS_SECTION_METADATA_KEYS,
    });
  }

  sectionTitle(key: string): string {
    return metadataEntry(
      this.entries(),
      PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    )?.label ?? missingUiMetadataLabel(
      PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );
  }

  sectionText(key: string): string {
    return metadataText(
      this.entries(),
      PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );
  }

  diagnosticsText(key: string): string {
    return metadataText(
      this.entries(),
      PROGRESSION_DIAGNOSTICS_SECTION_METADATA_NAMESPACE,
      key,
    );
  }

  explanationRows(): ProgressionExplainabilityTextRow[] {
    return PROGRESSION_EXPLAINABILITY_METADATA_SECTIONS.flatMap((section) =>
      section.keys.map((key) => {
        const entry = metadataEntry(this.entries(), section.namespace, key);

        return {
          key,
          namespace: section.namespace,
          label: entry?.label ?? missingUiMetadataLabel(section.namespace, key),
          text: metadataText(this.entries(), section.namespace, key),
        };
      }),
    );
  }
}

export function progressionFormulaRows(
  rows: readonly FormulaTargetAssignmentRow[],
): FormulaTargetAssignmentRow[] {
  const byKey = new Map(rows.map((row) => [row.target.key, row]));

  return PROGRESSION_FORMULA_TARGET_KEYS
    .map((key) => byKey.get(key) ?? null)
    .filter((row): row is FormulaTargetAssignmentRow => row !== null);
}

export function missingProgressionFormulaTargetKeys(
  rows: readonly FormulaTargetAssignmentRow[],
): string[] {
  const available = new Set(rows.map((row) => row.target.key));

  return PROGRESSION_FORMULA_TARGET_KEYS.filter((key) => !available.has(key));
}
