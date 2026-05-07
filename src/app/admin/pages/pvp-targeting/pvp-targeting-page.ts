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
import { FormulaAdminData } from '../../../core/domain/formula/formula.model';
import {
  EMPTY_FORMULA_ADMIN_DATA,
  FormulaTargetAssignmentRow,
} from '../../../core/types/formula-admin-view.types';
import {
  PvpTargetingAdmin,
  PvpTargetingAdminData,
  PVP_TARGETING_FORMULA_TARGET_KEYS,
} from '../../../core/services/pvp/pvp-targeting-admin';
import { getErrorMessage } from '../../../core/utils/error-message';
import {
  formulaTargetContextPreview,
  missingFormulaTargetKeys,
  toFormulaTargetAssignmentRows,
} from '../../../core/utils/formula-target-assignment-rows';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PVP_TARGETING_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

@Component({
  selector: 'app-pvp-targeting-page',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks, LoadingOverlay],
  templateUrl: './pvp-targeting-page.html',
})
export class PvpTargetingPage implements OnInit {
  private readonly targeting = inject(PvpTargetingAdmin);
  private readonly destroyRef = inject(DestroyRef);

  readonly links = PVP_TARGETING_PAGE_LINKS;
  readonly data = signal<FormulaAdminData>(EMPTY_FORMULA_ADMIN_DATA);
  readonly metadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly formulaRows = computed(() =>
    toFormulaTargetAssignmentRows(
      this.data(),
      PVP_TARGETING_FORMULA_TARGET_KEYS,
    ),
  );
  readonly missingFormulaTargetKeys = computed(() =>
    missingFormulaTargetKeys(
      this.formulaRows(),
      PVP_TARGETING_FORMULA_TARGET_KEYS,
    ),
  );
  readonly protectionMetadataRows = computed(() =>
    this.metadataEntries().filter(isProtectionMetadata),
  );
  readonly incomingAttackMetadataRows = computed(() =>
    this.metadataEntries().filter(isIncomingAttackMetadata),
  );
  readonly configurationGapCount = computed(() =>
    (this.protectionMetadataRows().length ? 0 : 1)
      + (this.incomingAttackMetadataRows().length ? 0 : 1),
  );

  ngOnInit(): void {
    this.loadData();
  }

  formulaStatusClass(row: FormulaTargetAssignmentRow): string {
    return row.status === 'enabled'
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--warn';
  }

  contextPreview(row: FormulaTargetAssignmentRow): string {
    return formulaTargetContextPreview(row);
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.targeting.getData()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => this.applyData(data),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'Failed to load PvP targeting data.'),
          ),
      });
  }

  private applyData(data: PvpTargetingAdminData): void {
    this.data.set(data.formulas);
    this.metadataEntries.set(data.metadataEntries);
  }
}

function isProtectionMetadata(entry: UiMetadataEntryReadModel): boolean {
  return matchesMetadataKeyOrGroup(entry, [
    'target_protection',
    'active_target_protection',
    'target_under_protection',
    'pvp_target_protection',
  ]);
}

function isIncomingAttackMetadata(entry: UiMetadataEntryReadModel): boolean {
  return matchesMetadataKeyOrGroup(entry, [
    'one_incoming_attack',
    'one_incoming_attack_per_target',
    'incoming_attack_rule',
    'blocking_incoming_attack',
  ]);
}

function matchesMetadataKeyOrGroup(
  entry: UiMetadataEntryReadModel,
  expectedKeys: readonly string[],
): boolean {
  return expectedKeys.includes(entry.key)
    || (entry.uiGroupKey !== null && expectedKeys.includes(entry.uiGroupKey));
}
