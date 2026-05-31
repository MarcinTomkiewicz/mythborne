import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  commonMaxAllocatedValue,
  currentBaseStatValues,
  initialDraftValues,
  mapAttributePageStatRows,
  resolveAttributePageContext,
  totalDraftCostForModel,
} from '../../domain/progression/attribute-allocation-model.helpers';
import { isUsableAttributeAllocationPreviewManifest } from '../../domain/progression/attribute-allocation-preview-manifest.mapper';
import { mapAttributeAllocationPreviewRows } from '../../domain/progression/attribute-allocation-preview.interpreter';
import {
  AttributeAllocationModel,
  AttributeAllocationPreviewManifest,
  AttributeAllocationPreviewRow,
} from '../../domain/progression/attribute-allocation-preview-manifest.model';
import {
  AttributePageLoadDiagnostic,
  AttributePageStatRow,
} from '../../interfaces/progression/attribute-allocation-page.interface';
import { getErrorMessage } from '../../utils/error-message';
import { RequestToken } from '../../utils/request-token';
import {
  mapSaveStatAllocationResult,
  toSaveStatAllocationRpcArgs,
} from '../../utils/stat-allocation-rpc';
import { SaveStatAllocationRpcRow } from '../../types/stat-allocation-rpc.types';
import { ActiveHero } from '../hero/active-hero';
import { PlayerPageContext } from '../hero/player-page-context';
import { ActiveServer } from '../server/active-server';
import { Backend } from '../backend/backend';
import { ToastService } from '../ui/toast';

const ATTRIBUTES_PAGE_BLOCKER_TEXT =
  'Nie można teraz otworzyć ekranu atrybutów. Spróbuj ponownie później.';

@Injectable()
export class AttributeAllocationPageFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly activeHero = inject(ActiveHero);
  private readonly activeServer = inject(ActiveServer);
  private readonly backend = inject(Backend);
  private readonly playerPageContext = inject(PlayerPageContext);
  private readonly toast = inject(ToastService);
  private readonly loadToken = new RequestToken();

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly isPageReady = signal(false);
  readonly pageBlocker = signal<string | null>(null);
  readonly allocationUnavailableReason = signal<string | null>(null);
  readonly loadDiagnostic = signal<AttributePageLoadDiagnostic | null>(null);
  readonly heroName = signal('');
  readonly heroLevel = signal(1);
  readonly availableCharacterPoints = signal(0);
  readonly previewManifest = signal<AttributeAllocationPreviewManifest | null>(null);
  readonly allocationModel = signal<AttributeAllocationModel | null>(null);
  readonly draftValues = signal<Record<string, number>>({});

  readonly tooltipFallback = 'Opis tej statystyki nie jest jeszcze skonfigurowany.';

  readonly statRows = computed<AttributePageStatRow[]>(() => {
    return mapAttributePageStatRows(
      this.allocationModel(),
      this.draftValues(),
      this.availableCharacterPoints(),
    );
  });

  readonly hasPendingChanges = computed(() =>
    this.statRows().some((row) => row.pendingLevels > 0),
  );
  readonly commonStatCap = computed(() => commonMaxAllocatedValue(this.statRows()));

  readonly totalDraftCost = computed(() => {
    const model = this.allocationModel();
    return model ? totalDraftCostForModel(model, this.draftValues()) : null;
  });

  readonly remainingCharacterPoints = computed(() => {
    const total = this.totalDraftCost();
    return total === null ? null : this.availableCharacterPoints() - total;
  });

  readonly saveBlockerMessage = computed(() => {
    const model = this.allocationModel();
    const remaining = this.remainingCharacterPoints();

    if (!model) {
      return null;
    }

    if (!this.hasPendingChanges()) {
      return model.initialDraftSummary.saveBlockerMessage ?? 'Brak niezapisanych zmian statystyk.';
    }

    if (this.totalDraftCost() === null) {
      return 'Nie można teraz wyliczyć kosztu planu rozwoju.';
    }

    if (remaining !== null && remaining < 0) {
      return model.saveEligibility.blockerMessage
        ?? model.initialDraftSummary.saveBlockerMessage
        ?? 'Za mało punktów postaci.';
    }

    return model.saveEligibility.blockerMessage
      ?? model.initialDraftSummary.saveBlockerMessage;
  });

  readonly canSaveDraft = computed(() =>
    this.hasPendingChanges()
    && this.totalDraftCost() !== null
    && (this.remainingCharacterPoints() ?? -1) >= 0,
  );

  readonly derivedStatRows = computed<AttributeAllocationPreviewRow[]>(() => {
    const manifest = this.previewManifest();
    return isUsableAttributeAllocationPreviewManifest(manifest)
      ? mapAttributeAllocationPreviewRows(
          manifest,
          currentBaseStatValues(this.allocationModel()),
          this.draftValues(),
        )
      : [];
  });

  readonly derivedPreviewBadge = computed(() =>
    this.derivedStatRows().length > 0 ? 'Podgląd zmian' : 'Tylko aktualny podgląd',
  );

  readonly derivedPreviewDescription = computed(() =>
    this.derivedStatRows().length > 0
      ? 'Aktualne wartości i niezapisane zmiany są pokazane tam, gdzie podgląd jest dostępny.'
      : 'Aktualne wartości statystyk pochodnych nie są jeszcze dostępne dla tego bohatera.',
  );

  incrementStat(statKey: string): void {
    const row = this.statRows().find((entry) => entry.statKey === statKey);
    if (row?.canIncrease) {
      this.draftValues.update((stats) => ({ ...stats, [statKey]: row.draftValue + 1 }));
    }
  }

  decrementStat(statKey: string): void {
    const row = this.statRows().find((entry) => entry.statKey === statKey);
    if (row?.canDecrease) {
      this.draftValues.update((stats) => ({ ...stats, [statKey]: row.draftValue - 1 }));
    }
  }

  resetDraft(): void {
    const model = this.allocationModel();
    if (!model) {
      return;
    }

    this.draftValues.set(initialDraftValues(model));
    this.toast.show('info', 'Plan zresetowany', 'Niezapisane zmiany statystyk zostały odrzucone.');
  }

  saveDraft(): void {
    const activeHero = this.activeHero.state();
    const remaining = this.remainingCharacterPoints();

    if (!activeHero?.heroId || !this.canSaveDraft() || remaining === null) {
      this.toast.show(
        'error',
        'Zapis zablokowany',
        this.saveBlockerMessage() ?? 'Nie można teraz zapisać rozwoju statystyk.',
      );
      return;
    }

    this.isSaving.set(true);
    this.backend
      .rpc<SaveStatAllocationRpcRow[]>(
        RPC.save_stat_allocation,
        toSaveStatAllocationRpcArgs({
          heroId: activeHero.heroId,
          stats: { ...this.draftValues() },
          previousCharacterPoints: this.availableCharacterPoints(),
          nextCharacterPoints: remaining,
        }),
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (rows) => {
          const row = Array.isArray(rows) ? rows[0] : null;

          if (!row) {
          this.toast.show('error', 'Zapis nieudany', 'Nie udało się zapisać rozwoju statystyk.');
            return;
          }

          mapSaveStatAllocationResult(row);
          this.toast.show('success', 'Statystyki zapisane', 'Rozwój statystyk został zapisany.');
          this.loadData();
        },
        error: (error: unknown) => {
          this.toast.show(
            'error',
            'Zapis nieudany',
            getErrorMessage(error, 'Nie udało się zapisać rozwoju statystyk.'),
          );
        },
      });
  }

  loadData(): void {
    const contextResult = this.currentContext();
    const context = contextResult.context;
    const token = this.loadToken.next();

    this.isLoading.set(true);
    this.isPageReady.set(false);
    this.pageBlocker.set(null);
    this.allocationUnavailableReason.set(null);
    this.loadDiagnostic.set(null);
    this.clearPageState();

    if (!context) {
      this.isLoading.set(false);
      this.reportLoadDiagnostic({
        phase: 'context',
        activeHeroHeroId: contextResult.activeHeroHeroId,
        activeHeroServerId: contextResult.activeHeroServerId,
        selectedServerId: contextResult.selectedServerId,
        reasons: contextResult.reasons,
      });
      this.pageBlocker.set(ATTRIBUTES_PAGE_BLOCKER_TEXT);
      return;
    }

    this.playerPageContext.getAttributesPageContext(context.heroId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (pageContext) => {
          if (
            !this.loadToken.isCurrent(token)
            || pageContext.heroId !== context.heroId
            || pageContext.serverId !== context.serverId
          ) {
            this.reportLoadDiagnostic({
              phase: 'stale_response',
              requestHeroId: context.heroId,
              requestServerId: context.serverId,
              returnedHeroId: pageContext.heroId,
              returnedServerId: pageContext.serverId,
            });
            return;
          }

          this.heroName.set(pageContext.heroName);
          this.heroLevel.set(pageContext.heroLevel);
          this.availableCharacterPoints.set(pageContext.availableCharacterPoints);
          this.previewManifest.set(pageContext.previewManifest);
          this.allocationModel.set(pageContext.allocationModel);
          this.draftValues.set(initialDraftValues(pageContext.allocationModel));
          this.loadDiagnostic.set(null);
          this.isPageReady.set(true);
        },
        error: (error: unknown) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          const internalError = getErrorMessage(error, ATTRIBUTES_PAGE_BLOCKER_TEXT);
          this.allocationUnavailableReason.set(internalError);
          this.reportLoadDiagnostic({
            phase: 'rpc_or_mapper_error',
            requestHeroId: context.heroId,
            requestServerId: context.serverId,
            internalError,
          });
          this.pageBlocker.set(ATTRIBUTES_PAGE_BLOCKER_TEXT);
        },
      });
  }

  private currentContext() {
    return resolveAttributePageContext(
      this.activeHero.state(),
      this.activeServer.selectedServer(),
    );
  }

  private reportLoadDiagnostic(diagnostic: AttributePageLoadDiagnostic): void {
    this.loadDiagnostic.set(diagnostic);
  }

  private clearPageState(): void {
    this.heroName.set('');
    this.heroLevel.set(1);
    this.availableCharacterPoints.set(0);
    this.previewManifest.set(null);
    this.allocationModel.set(null);
    this.draftValues.set({});
  }

}
