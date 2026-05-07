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
  PVP_PRESTIGE_CONTEXT_FIELD_KEYS,
  PVP_PRESTIGE_CONTEXT_FORMULA_TARGET_KEYS,
  PvpPrestigeContextAdmin,
  PvpPrestigeContextAdminData,
} from '../../../core/services/pvp/pvp-prestige-context-admin';
import { getErrorMessage } from '../../../core/utils/error-message';
import {
  formulaTargetContextPreview,
  missingFormulaTargetKeys,
  toFormulaTargetAssignmentRows,
} from '../../../core/utils/formula-target-assignment-rows';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PVP_PRESTIGE_CONTEXT_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

interface PrestigeContextFieldView {
  key: typeof PVP_PRESTIGE_CONTEXT_FIELD_KEYS[number];
  isAllowedVariable: boolean;
  defaultValue: unknown;
}

@Component({
  selector: 'app-pvp-prestige-context-page',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks, LoadingOverlay],
  templateUrl: './pvp-prestige-context-page.html',
})
export class PvpPrestigeContextPage implements OnInit {
  private readonly prestigeContext = inject(PvpPrestigeContextAdmin);
  private readonly destroyRef = inject(DestroyRef);

  readonly links = PVP_PRESTIGE_CONTEXT_PAGE_LINKS;
  readonly formulas = signal<FormulaAdminData>(EMPTY_FORMULA_ADMIN_DATA);
  readonly metadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly formulaRows = computed(() =>
    toFormulaTargetAssignmentRows(
      this.formulas(),
      PVP_PRESTIGE_CONTEXT_FORMULA_TARGET_KEYS,
    ),
  );
  readonly missingFormulaTargetKeys = computed(() =>
    missingFormulaTargetKeys(
      this.formulaRows(),
      PVP_PRESTIGE_CONTEXT_FORMULA_TARGET_KEYS,
    ),
  );
  readonly prestigeFormulaRow = computed(() => this.formulaRows()[0] ?? null);
  readonly contextFields = computed(() => this.toContextFieldViews());
  readonly missingContextFieldKeys = computed(() =>
    this.contextFields()
      .filter((field) => !field.isAllowedVariable)
      .map((field) => field.key),
  );
  readonly futureContextMetadataRows = computed(() =>
    this.metadataEntries().filter(isFuturePrestigeContextMetadata),
  );
  readonly configurationGapCount = computed(() =>
    this.missingFormulaTargetKeys().length
      + this.missingContextFieldKeys().length
      + (this.futureContextMetadataRows().length ? 0 : 1),
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

  metadataCopy(entry: UiMetadataEntryReadModel): string {
    return entry.description
      || entry.helperText
      || entry.impactSummary
      || 'No DB metadata copy.';
  }

  defaultValueLabel(value: unknown): string {
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return `${value}`;
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.prestigeContext.getData()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => this.applyData(data),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'Failed to load PvP Prestige context data.'),
          ),
      });
  }

  private applyData(data: PvpPrestigeContextAdminData): void {
    this.formulas.set(data.formulas);
    this.metadataEntries.set(
      data.metadataEntries.filter((entry) => entry.isActive),
    );
  }

  private toContextFieldViews(): PrestigeContextFieldView[] {
    const target = this.prestigeFormulaRow()?.target ?? null;
    const allowedVariables = new Set(target?.allowedVariables ?? []);
    const defaultContext = isRecord(target?.defaultTestContext)
      ? target.defaultTestContext
      : {};

    return PVP_PRESTIGE_CONTEXT_FIELD_KEYS.map((key) => ({
      key,
      isAllowedVariable: allowedVariables.has(key),
      defaultValue: defaultContext[key],
    }));
  }
}

function isFuturePrestigeContextMetadata(
  entry: UiMetadataEntryReadModel,
): boolean {
  return matchesMetadataKeyOrGroup(entry, [
    'prestige_context',
    'future_prestige_context',
    'pvp_prestige_context',
    'pvp_prestige_delta_context',
  ]);
}

function matchesMetadataKeyOrGroup(
  entry: UiMetadataEntryReadModel,
  expectedKeys: readonly string[],
): boolean {
  return expectedKeys.includes(entry.key)
    || (entry.uiGroupKey !== null && expectedKeys.includes(entry.uiGroupKey));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
