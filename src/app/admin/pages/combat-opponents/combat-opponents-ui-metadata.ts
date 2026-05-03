import {
  COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_KEYS,
  COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
} from '../../../core/constants/combat-opponent-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  metadataEntry,
  metadataText,
  missingUiMetadataGaps,
  missingUiMetadataLabel,
} from '../../../core/utils/admin-ui-metadata';

export const COMBAT_OPPONENT_SECTION_METADATA = {
  pageHeader: 'page_header',
  overview: 'overview',
  families: 'families',
  opponentDefinitions: 'opponent_definitions',
  baselineStats: 'baseline_stats',
  naturalAttacks: 'natural_attacks',
  equipment: 'equipment',
  manualEquipment: 'manual_equipment',
  generatedEquipment: 'generated_equipment',
  scaling: 'scaling',
  usageCandidates: 'usage_candidates',
  emptyState: 'empty_state',
  advanced: 'advanced',
} as const;

export class CombatOpponentsUiMetadata {
  readonly section = COMBAT_OPPONENT_SECTION_METADATA;

  constructor(
    private readonly entries: () => UiMetadataEntryReadModel[],
    private readonly selectedOpponentLabel: () => string | null,
  ) {}

  missingGaps(): string[] {
    return missingUiMetadataGaps(this.entries(), {
      [COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_NAMESPACE]:
        COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_KEYS,
    });
  }

  sectionLegend(key: string): string | null {
    return metadataEntry(
      this.entries(),
      COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    )?.uiGroupLabel ?? null;
  }

  sectionTitle(key: string, includeSelectedOpponentScope = false): string {
    const entry = metadataEntry(
      this.entries(),
      COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );
    const title = entry?.label ?? missingUiMetadataLabel(
      COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );

    return includeSelectedOpponentScope
      ? this.selectedOpponentScope(title)
      : title;
  }

  sectionText(key: string): string {
    return metadataText(
      this.entries(),
      COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    );
  }

  sectionSecondaryText(key: string): string | null {
    return metadataEntry(
      this.entries(),
      COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      key,
    )?.impactSummary ?? null;
  }

  private selectedOpponentScope(prefix: string): string {
    const label = this.selectedOpponentLabel();

    return label ? `${prefix}: ${label}` : prefix;
  }
}
