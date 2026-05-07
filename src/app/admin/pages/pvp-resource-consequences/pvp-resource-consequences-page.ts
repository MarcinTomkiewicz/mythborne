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
import { ResourceTypeReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { FormulaAdminData } from '../../../core/domain/formula/formula.model';
import {
  EMPTY_FORMULA_ADMIN_DATA,
  FormulaTargetAssignmentRow,
} from '../../../core/types/formula-admin-view.types';
import {
  PVP_ELIGIBLE_RESOURCE_KEYS,
  PvpResourceConsequencesAdmin,
  PvpResourceConsequencesAdminData,
  PVP_RESOURCE_CONSEQUENCE_FORMULA_TARGET_KEYS,
} from '../../../core/services/pvp/pvp-resource-consequences-admin';
import { getErrorMessage } from '../../../core/utils/error-message';
import {
  formulaTargetContextPreview,
  missingFormulaTargetKeys,
  toFormulaTargetAssignmentRows,
} from '../../../core/utils/formula-target-assignment-rows';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PVP_RESOURCE_CONSEQUENCES_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

interface EligibleResourceView {
  key: typeof PVP_ELIGIBLE_RESOURCE_KEYS[number];
  resourceType: ResourceTypeReadModel | null;
  label: string;
  description: string | null;
}

const FORBIDDEN_BOUNDARY_LABELS = [
  'Character Points',
  'Items',
  'Buildings',
  'Estate ownership',
] as const;

@Component({
  selector: 'app-pvp-resource-consequences-page',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks, LoadingOverlay],
  templateUrl: './pvp-resource-consequences-page.html',
})
export class PvpResourceConsequencesPage implements OnInit {
  private readonly resourceConsequences = inject(PvpResourceConsequencesAdmin);
  private readonly destroyRef = inject(DestroyRef);

  readonly links = PVP_RESOURCE_CONSEQUENCES_PAGE_LINKS;
  readonly data = signal<FormulaAdminData>(EMPTY_FORMULA_ADMIN_DATA);
  readonly resourceTypes = signal<ResourceTypeReadModel[]>([]);
  readonly metadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly forbiddenBoundaryLabels = FORBIDDEN_BOUNDARY_LABELS;
  readonly formulaRows = computed(() =>
    toFormulaTargetAssignmentRows(
      this.data(),
      PVP_RESOURCE_CONSEQUENCE_FORMULA_TARGET_KEYS,
    ),
  );
  readonly missingFormulaTargetKeys = computed(() =>
    missingFormulaTargetKeys(
      this.formulaRows(),
      PVP_RESOURCE_CONSEQUENCE_FORMULA_TARGET_KEYS,
    ),
  );
  readonly eligibleResources = computed(() => this.toEligibleResourceViews());
  readonly missingEligibleResourceKeys = computed(() =>
    this.eligibleResources()
      .filter((resource) => resource.resourceType === null)
      .map((resource) => resource.key),
  );
  readonly boundaryMetadataRows = computed(() =>
    this.metadataEntries().filter(isForbiddenBoundaryMetadata),
  );
  readonly configurationGapCount = computed(() =>
    this.missingFormulaTargetKeys().length
      + this.missingEligibleResourceKeys().length
      + (this.boundaryMetadataRows().length ? 0 : 1),
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

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.resourceConsequences.getData()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => this.applyData(data),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(
              error,
              'Failed to load PvP resource consequence data.',
            ),
          ),
      });
  }

  private applyData(data: PvpResourceConsequencesAdminData): void {
    this.data.set(data.formulas);
    this.resourceTypes.set(data.resourceTypes);
    this.metadataEntries.set(
      data.metadataEntries.filter((entry) => entry.isActive),
    );
  }

  private toEligibleResourceViews(): EligibleResourceView[] {
    const resourceByKey = new Map(
      this.resourceTypes().map((resource) => [resource.key, resource]),
    );

    return PVP_ELIGIBLE_RESOURCE_KEYS.map((key) => {
      const resourceType = resourceByKey.get(key) ?? null;

      return {
        key,
        resourceType,
        label: resourceType?.label ?? key,
        description: resourceType?.adminDescription
          ?? resourceType?.description
          ?? resourceType?.helperText
          ?? null,
      };
    });
  }
}

function isForbiddenBoundaryMetadata(
  entry: UiMetadataEntryReadModel,
): boolean {
  return matchesMetadataKeyOrGroup(entry, [
    'forbidden_consequences',
    'pvp_forbidden_consequences',
    'ordinary_pvp_forbidden_consequences',
    'resource_consequence_boundaries',
    'pvp_resource_boundaries',
  ]);
}

function matchesMetadataKeyOrGroup(
  entry: UiMetadataEntryReadModel,
  expectedKeys: readonly string[],
): boolean {
  return expectedKeys.includes(entry.key)
    || (entry.uiGroupKey !== null && expectedKeys.includes(entry.uiGroupKey));
}
