import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  RewardProfileAssignmentReadModel,
  RewardProfileEntrySummaryView,
  RewardProfileReadModel,
} from '../../../core/domain/exploration/exploration-reward.model';
import { FormulaAdminData } from '../../../core/domain/formula/formula.model';
import { REWARD_ENTRY_KIND } from '../../../core/constants/reward-runtime-keys.const';
import {
  EMPTY_FORMULA_ADMIN_DATA,
  FormulaTargetAssignmentRow,
} from '../../../core/types/formula-admin-view.types';
import {
  PVP_REWARD_FORMULA_TARGET_KEYS,
  PVP_REWARD_OUTCOME_KEYS,
  PVP_REWARD_SOURCE_KIND,
  PvpRewardRoutingAdmin,
  PvpRewardRoutingAdminData,
} from '../../../core/services/pvp/pvp-reward-routing-admin';
import { getErrorMessage } from '../../../core/utils/error-message';
import {
  formulaTargetContextPreview,
  missingFormulaTargetKeys,
  toFormulaTargetAssignmentRows,
} from '../../../core/utils/formula-target-assignment-rows';
import { toRewardProfileEntrySummary } from '../../../core/utils/reward-profile-entry-summary';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PVP_REWARD_ROUTING_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

interface PvpRewardOutcomeView {
  key: string;
  label: string;
  description: string | null;
  assignments: RewardProfileAssignmentReadModel[];
}

@Component({
  selector: 'app-pvp-reward-routing-page',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks, LoadingOverlay],
  templateUrl: './pvp-reward-routing-page.html',
})
export class PvpRewardRoutingPage implements OnInit {
  private readonly rewardRouting = inject(PvpRewardRoutingAdmin);
  private readonly destroyRef = inject(DestroyRef);

  readonly links = PVP_REWARD_ROUTING_PAGE_LINKS;
  readonly formulas = signal<FormulaAdminData>(EMPTY_FORMULA_ADMIN_DATA);
  readonly data = signal<PvpRewardRoutingAdminData | null>(null);
  readonly metadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly formulaRows = computed(() =>
    toFormulaTargetAssignmentRows(
      this.formulas(),
      PVP_REWARD_FORMULA_TARGET_KEYS,
    ),
  );
  readonly missingFormulaTargetKeys = computed(() =>
    missingFormulaTargetKeys(
      this.formulaRows(),
      PVP_REWARD_FORMULA_TARGET_KEYS,
    ),
  );
  readonly outcomeViews = computed(() => this.toOutcomeViews());
  readonly missingExpectedOutcomeKeys = computed(() => {
    const existing = new Set(this.outcomeViews().map((outcome) => outcome.key));

    return PVP_REWARD_OUTCOME_KEYS.filter((key) => !existing.has(key));
  });
  readonly activeAssignmentCount = computed(() =>
    this.outcomeViews().reduce(
      (count, outcome) =>
        count + outcome.assignments.filter((assignment) => assignment.isActive).length,
      0,
    ),
  );
  readonly unassignedOutcomeKeys = computed(() =>
    this.outcomeViews()
      .filter((outcome) =>
        !outcome.assignments.some((assignment) => assignment.isActive),
      )
      .map((outcome) => outcome.key),
  );
  readonly cpMetadataRows = computed(() =>
    this.metadataEntries().filter(isCpDerivationMetadata),
  );
  readonly configurationGapCount = computed(() =>
    this.missingFormulaTargetKeys().length
      + this.unassignedOutcomeKeys().length
      + this.missingExpectedOutcomeKeys().length
      + (this.cpMetadataRows().length ? 0 : 1),
  );

  ngOnInit(): void {
    this.loadData();
  }

  formulaStatusClass(row: FormulaTargetAssignmentRow): string {
    return row.status === 'enabled'
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--warn';
  }

  assignmentStatusClass(assignment: RewardProfileAssignmentReadModel): string {
    return assignment.isActive
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--warn';
  }

  contextPreview(row: FormulaTargetAssignmentRow): string {
    return formulaTargetContextPreview(row);
  }

  rewardProfile(assignment: RewardProfileAssignmentReadModel): RewardProfileReadModel | null {
    return this.data()?.profiles.find(
      (profile) => profile.id === assignment.rewardProfileId,
    ) ?? null;
  }

  entrySummaries(
    assignment: RewardProfileAssignmentReadModel,
  ): RewardProfileEntrySummaryView[] {
    const data = this.data();

    if (!data) {
      return [];
    }

    return data.entries
      .filter((entry) =>
        entry.rewardProfileId === assignment.rewardProfileId && entry.isActive,
      )
      .map((entry) =>
        toRewardProfileEntrySummary(
          {
            entryKinds: data.entryKinds,
            amountModes: data.amountModes,
            resourceTypes: data.resourceTypes,
            formulas: data.formulas.formulas,
            effectDefinitions: [],
          },
          entry,
        ),
      );
  }

  hasStandaloneCpEntry(assignment: RewardProfileAssignmentReadModel): boolean {
    return this.data()?.entries.some((entry) =>
      entry.rewardProfileId === assignment.rewardProfileId
        && entry.isActive
        && entry.entryKind === REWARD_ENTRY_KIND.characterPoints,
    ) ?? false;
  }

  metadataCopy(entry: UiMetadataEntryReadModel): string {
    return entry.description
      || entry.helperText
      || entry.impactSummary
      || 'No DB metadata copy.';
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.rewardRouting.getData()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => this.applyData(data),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'Failed to load PvP reward routing data.'),
          ),
      });
  }

  private applyData(data: PvpRewardRoutingAdminData): void {
    this.data.set(data);
    this.formulas.set(data.formulas);
    this.metadataEntries.set(
      data.metadataEntries.filter((entry) => entry.isActive),
    );
  }

  private toOutcomeViews(): PvpRewardOutcomeView[] {
    const data = this.data();

    return (data?.outcomeKinds ?? [])
      .filter((outcome) => outcome.sourceKind === PVP_REWARD_SOURCE_KIND)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((outcome) => ({
        key: outcome.key,
        label: outcome.label,
        description: outcome.description
          ?? outcome.helperText
          ?? outcome.adminDescription
          ?? null,
        assignments: (data?.assignments ?? []).filter((assignment) =>
          assignment.sourceKind === PVP_REWARD_SOURCE_KIND
            && assignment.outcomeKind === outcome.key,
        ),
      }));
  }
}

function isCpDerivationMetadata(entry: UiMetadataEntryReadModel): boolean {
  return matchesMetadataKeyOrGroup(entry, [
    'cp_from_xp',
    'character_points_from_xp',
    'pvp_cp_derivation',
    'xp_to_cp_progression',
  ]);
}

function matchesMetadataKeyOrGroup(
  entry: UiMetadataEntryReadModel,
  expectedKeys: readonly string[],
): boolean {
  return expectedKeys.includes(entry.key)
    || (entry.uiGroupKey !== null && expectedKeys.includes(entry.uiGroupKey));
}
