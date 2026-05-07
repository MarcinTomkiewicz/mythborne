import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE,
  PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PVP_REPORT_SECTION_METADATA_NAMESPACE,
  PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
  PVP_REWARD_SECTION_METADATA_NAMESPACE,
  PVP_RUNTIME_SECTION_METADATA_NAMESPACE,
  PVP_SPY_SECTION_METADATA_NAMESPACE,
  PVP_TARGETING_SECTION_METADATA_NAMESPACE,
  PvpUiMetadataNamespace,
} from '../../../core/constants/pvp-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { PvpUiMetadata } from '../../../core/services/pvp/pvp-ui-metadata';
import {
  metadataEntry,
  missingUiMetadataLabel,
} from '../../../core/utils/admin-ui-metadata';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PVP_OVERVIEW_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

interface PvpOverviewSectionConfig {
  namespace: PvpUiMetadataNamespace;
  legend: string;
  expected: string;
}

interface PvpOverviewSectionView extends PvpOverviewSectionConfig {
  overview: UiMetadataEntryReadModel | null;
  details: UiMetadataEntryReadModel[];
  missingOverviewLabel: string;
}

const PVP_OVERVIEW_SECTIONS: readonly PvpOverviewSectionConfig[] = [
  {
    namespace: PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
    legend: 'Action kinds',
    expected: 'Attack, spy and future/inactive action-kind metadata.',
  },
  {
    namespace: PVP_TARGETING_SECTION_METADATA_NAMESPACE,
    legend: 'Targeting',
    expected: 'Target eligibility, travel preview and protection boundaries.',
  },
  {
    namespace: PVP_RUNTIME_SECTION_METADATA_NAMESPACE,
    legend: 'Runtime',
    expected: 'Runtime activity, travel and completion lifecycle boundaries.',
  },
  {
    namespace: PVP_SPY_SECTION_METADATA_NAMESPACE,
    legend: 'Spy',
    expected: 'Spy snapshot visibility and owner-safe read boundaries.',
  },
  {
    namespace: PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
    legend: 'Resources',
    expected: 'PvP-owned resource consequence boundaries.',
  },
  {
    namespace: PVP_REWARD_SECTION_METADATA_NAMESPACE,
    legend: 'Rewards',
    expected: 'XP/reward routing boundaries and future prestige context limits.',
  },
  {
    namespace: PVP_REPORT_SECTION_METADATA_NAMESPACE,
    legend: 'Reports',
    expected: 'PvP report readiness and report-content boundaries.',
  },
  {
    namespace: PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE,
    legend: 'Anti-abuse',
    expected: 'Anti-abuse signal and relationship-context boundaries.',
  },
];

@Component({
  selector: 'app-pvp-overview-page',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks, LoadingOverlay],
  templateUrl: './pvp-overview-page.html',
})
export class PvpOverviewPage implements OnInit {
  private readonly pvpMetadata = inject(PvpUiMetadata);

  readonly links = PVP_OVERVIEW_PAGE_LINKS;
  readonly entries = signal<UiMetadataEntryReadModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly sections = computed(() => this.toSectionViews(this.entries()));
  readonly detailCount = computed(() =>
    this.sections().reduce(
      (count, section) => count + section.details.length,
      0,
    ),
  );
  readonly missingOverviewCount = computed(() =>
    this.sections().filter((section) => section.overview === null).length,
  );
  readonly pageHeader = computed(() =>
    metadataEntry(
      this.entries(),
      PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      'overview',
    ),
  );

  ngOnInit(): void {
    this.loadMetadata();
  }

  private loadMetadata(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.pvpMetadata
      .getEntries()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (entries) => this.entries.set(entries),
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load PvP metadata overview.',
          ),
      });
  }

  private toSectionViews(
    entries: readonly UiMetadataEntryReadModel[],
  ): PvpOverviewSectionView[] {
    return PVP_OVERVIEW_SECTIONS.map((section) => {
      const overview = metadataEntry(
        [...entries],
        section.namespace,
        'overview',
      );
      const details = entries
        .filter((entry) =>
          entry.namespace === section.namespace &&
          entry.key !== 'overview' &&
          entry.isActive
        )
        .sort((a, b) => a.sortOrder - b.sortOrder);

      return {
        ...section,
        overview,
        details,
        missingOverviewLabel: missingUiMetadataLabel(
          section.namespace,
          'overview',
        ),
      };
    });
  }
}
