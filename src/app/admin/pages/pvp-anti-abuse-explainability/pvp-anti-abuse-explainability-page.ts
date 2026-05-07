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
import {
  AntiAbuseSignalTypeEntry,
  PlayerRelationshipDeclarationTypeEntry,
} from '../../../core/domain/anti-abuse/anti-abuse-dictionary.model';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  PVP_ANTI_ABUSE_SIGNAL_KEYS,
  PVP_RELATIONSHIP_DECLARATION_CONTEXT_KEYS,
  PvpAntiAbuseExplainabilityAdmin,
  PvpAntiAbuseExplainabilityAdminData,
} from '../../../core/services/pvp/pvp-anti-abuse-explainability-admin';
import { getErrorMessage } from '../../../core/utils/error-message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PVP_ANTI_ABUSE_EXPLAINABILITY_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

interface AntiAbuseSignalView {
  key: typeof PVP_ANTI_ABUSE_SIGNAL_KEYS[number];
  entry: AntiAbuseSignalTypeEntry | null;
}

interface RelationshipDeclarationContextView {
  key: typeof PVP_RELATIONSHIP_DECLARATION_CONTEXT_KEYS[number];
  entry: PlayerRelationshipDeclarationTypeEntry | null;
}

@Component({
  selector: 'app-pvp-anti-abuse-explainability-page',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks, LoadingOverlay],
  templateUrl: './pvp-anti-abuse-explainability-page.html',
})
export class PvpAntiAbuseExplainabilityPage implements OnInit {
  private readonly antiAbuse = inject(PvpAntiAbuseExplainabilityAdmin);
  private readonly destroyRef = inject(DestroyRef);

  readonly links = PVP_ANTI_ABUSE_EXPLAINABILITY_PAGE_LINKS;
  readonly data = signal<PvpAntiAbuseExplainabilityAdminData | null>(null);
  readonly metadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly signalViews = computed(() => this.toSignalViews());
  readonly declarationContextViews = computed(() =>
    this.toDeclarationContextViews(),
  );
  readonly missingSignalKeys = computed(() =>
    this.signalViews()
      .filter((view) => view.entry === null)
      .map((view) => view.key),
  );
  readonly missingDeclarationContextKeys = computed(() =>
    this.declarationContextViews()
      .filter((view) => view.entry === null)
      .map((view) => view.key),
  );
  readonly reviewAidMetadataRows = computed(() =>
    this.metadataEntries().filter(isReviewAidMetadata),
  );
  readonly declarationContextMetadataRows = computed(() =>
    this.metadataEntries().filter(isDeclarationContextMetadata),
  );
  readonly configurationGapCount = computed(() =>
    this.missingSignalKeys().length
      + this.missingDeclarationContextKeys().length
      + (this.reviewAidMetadataRows().length ? 0 : 1)
      + (this.declarationContextMetadataRows().length ? 0 : 1),
  );

  ngOnInit(): void {
    this.loadData();
  }

  signalStatusClass(entry: AntiAbuseSignalTypeEntry): string {
    return entry.isActive
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--warn';
  }

  declarationStatusClass(
    entry: PlayerRelationshipDeclarationTypeEntry,
  ): string {
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

    this.antiAbuse.getData()
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
              'Failed to load PvP anti-abuse explainability data.',
            ),
          ),
      });
  }

  private applyData(data: PvpAntiAbuseExplainabilityAdminData): void {
    this.data.set(data);
    this.metadataEntries.set(
      data.metadataEntries.filter((entry) => entry.isActive),
    );
  }

  private toSignalViews(): AntiAbuseSignalView[] {
    const byKey = new Map(
      (this.data()?.dictionaries.signalTypes ?? []).map((entry) => [
        entry.key,
        entry,
      ]),
    );

    return PVP_ANTI_ABUSE_SIGNAL_KEYS.map((key) => ({
      key,
      entry: byKey.get(key) ?? null,
    }));
  }

  private toDeclarationContextViews(): RelationshipDeclarationContextView[] {
    const byKey = new Map(
      (this.data()?.dictionaries.declarationTypes ?? []).map((entry) => [
        entry.key,
        entry,
      ]),
    );

    return PVP_RELATIONSHIP_DECLARATION_CONTEXT_KEYS.map((key) => ({
      key,
      entry: byKey.get(key) ?? null,
    }));
  }
}

function isReviewAidMetadata(entry: UiMetadataEntryReadModel): boolean {
  return matchesMetadataKeyOrGroup(entry, [
    'pvp_anti_abuse_review_aids',
    'pvp_review_aids',
    'same_ip_pvp_attack',
    'pvp_feeding_pattern',
  ]);
}

function isDeclarationContextMetadata(
  entry: UiMetadataEntryReadModel,
): boolean {
  return matchesMetadataKeyOrGroup(entry, [
    'pvp_relationship_context',
    'relationship_declaration_context',
    'mercenary_contract',
    'mercenary_contract_context',
  ]);
}

function matchesMetadataKeyOrGroup(
  entry: UiMetadataEntryReadModel,
  expectedKeys: readonly string[],
): boolean {
  return expectedKeys.includes(entry.key)
    || (entry.uiGroupKey !== null && expectedKeys.includes(entry.uiGroupKey));
}
