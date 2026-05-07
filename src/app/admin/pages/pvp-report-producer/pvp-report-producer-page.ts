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
import { GameReportTypeEntry } from '../../../core/domain/reports/game-report.model';
import {
  PVP_REPORT_COMBAT_SECTION_SOURCE_TYPE,
  PVP_REPORT_SOURCE_ENTITY_TYPE,
  PVP_REPORT_TYPE_KEY,
  PvpReportProducerAdmin,
  PvpReportProducerAdminData,
} from '../../../core/services/pvp/pvp-report-producer-admin';
import { getErrorMessage } from '../../../core/utils/error-message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PVP_REPORT_PRODUCER_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

@Component({
  selector: 'app-pvp-report-producer-page',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks, LoadingOverlay],
  templateUrl: './pvp-report-producer-page.html',
})
export class PvpReportProducerPage implements OnInit {
  private readonly reportProducer = inject(PvpReportProducerAdmin);
  private readonly destroyRef = inject(DestroyRef);

  readonly links = PVP_REPORT_PRODUCER_PAGE_LINKS;
  readonly data = signal<PvpReportProducerAdminData | null>(null);
  readonly metadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly reportType = computed(() =>
    this.data()?.reportTypes.find((entry) =>
      entry.key === PVP_REPORT_TYPE_KEY,
    ) ?? null,
  );
  readonly reportTypeKey = PVP_REPORT_TYPE_KEY;
  readonly sourceEntityType = PVP_REPORT_SOURCE_ENTITY_TYPE;
  readonly combatSectionSourceType = PVP_REPORT_COMBAT_SECTION_SOURCE_TYPE;
  readonly producerMetadataRows = computed(() =>
    this.metadataEntries().filter(isProducerMetadata),
  );
  readonly combatSectionMetadataRows = computed(() =>
    this.metadataEntries().filter(isCombatSectionMetadata),
  );
  readonly configurationGapCount = computed(() =>
    (this.reportType() ? 0 : 1)
      + (this.producerMetadataRows().length ? 0 : 1)
      + (this.combatSectionMetadataRows().length ? 0 : 1),
  );

  ngOnInit(): void {
    this.loadData();
  }

  reportTypeStatusClass(entry: GameReportTypeEntry): string {
    return entry.isActive
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--warn';
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

    this.reportProducer.getData()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => this.applyData(data),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'Failed to load PvP report producer data.'),
          ),
      });
  }

  private applyData(data: PvpReportProducerAdminData): void {
    this.data.set(data);
    this.metadataEntries.set(
      data.metadataEntries.filter((entry) => entry.isActive),
    );
  }
}

function isProducerMetadata(entry: UiMetadataEntryReadModel): boolean {
  return matchesMetadataKeyOrGroup(entry, [
    'pvp_report_producer',
    'pvp_combat_report',
    'pvp_result_report',
    'pvp_combat',
    'pvp_result',
  ]);
}

function isCombatSectionMetadata(entry: UiMetadataEntryReadModel): boolean {
  return matchesMetadataKeyOrGroup(entry, [
    'pvp_report_combat_section',
    'combat_section',
    'linked_combat_result',
    'combat_attacks',
  ]);
}

function matchesMetadataKeyOrGroup(
  entry: UiMetadataEntryReadModel,
  expectedKeys: readonly string[],
): boolean {
  return expectedKeys.includes(entry.key)
    || (entry.uiGroupKey !== null && expectedKeys.includes(entry.uiGroupKey));
}
