import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { Origin } from '../../domain/origin/origin.model';
import {
  HeroDashboardRuntimeStatsReadModel,
} from '../../domain/hero/hero-dashboard-runtime-stats.model';
import { ActiveServer } from '../server/active-server';
import { ActiveHero } from './active-hero';
import { RequestToken } from '../../utils/request-token';
import {
  DashboardDerivedStatRow,
  mapDashboardBaseStatRows,
  mapDashboardDerivedStatRows,
  mapDashboardHealthDisplay,
} from './dashboard-page.mappers';
import type { StatCardRow } from '../../types/stat-card.types';
import { EquipmentPreviewSlotRow } from '../../domain/equipment/equipment-preview.model';
import { DashboardPersistentStateRow } from './dashboard-persistent-state.model';
import { getErrorMessage } from '../../utils/error-message';
import { PlayerPageContext } from './player-page-context';
import { PlayerDashboardShellState } from './player-dashboard-shell-state';

@Injectable()
export class DashboardPageFacade {
  private readonly activeServer = inject(ActiveServer);
  private readonly activeHeroState = inject(ActiveHero);
  private readonly playerPageContext = inject(PlayerPageContext);
  private readonly shellState = inject(PlayerDashboardShellState);
  readonly selectedServer = this.activeServer.selectedServer;

  private readonly dashboardLoadToken = new RequestToken();
  private readonly hasLoadedDashboard = signal(false);
  private readonly loadedContextKey = signal<string | null>(null);
  readonly isPageLoading = signal(false);
  readonly pageError = signal<string | null>(null);
  readonly isPageReady = signal(false);

  private readonly reloadOnContextChange = effect(() => {
    const context = this.currentDashboardContext();
    const contextKey = context ? dashboardContextKey(context) : null;

    if (!this.hasLoadedDashboard()) {
      return;
    }

    untracked(() => {
      if (!context) {
        this.clearDashboardState();
        this.loadedContextKey.set(null);
        return;
      }

      if (this.loadedContextKey() !== contextKey) {
        this.loadData();
      }
    });
  });

  heroName = signal('');
  private readonly heroLevelFallback = signal(1);
  readonly level = computed(() => this.heroLevelFallback());
  characterPoints = signal(0);
  private readonly estateAddressLabel = signal<string | null>(null);
  readonly estateAddress = computed(() => this.estateAddressLabel());
  isEstateAddressLoaded = signal(false);
  estateAddressError = signal<string | null>(null);
  readonly heroLevel = this.level;
  readonly experience = signal(0);
  readonly totalExperienceEarned = signal(0);
  readonly experienceToNextLevel = signal<number | null>(null);
  readonly isExperienceLoading = signal(false);
  readonly experienceError = signal<string | null>(null);

  origin = signal<Origin | null>(null);
  runtimeStats = signal<HeroDashboardRuntimeStatsReadModel | null>(null);
  runtimeStatsError = signal<string | null>(null);
  equipmentPreviewRows = signal<EquipmentPreviewSlotRow[]>([]);
  isEquipmentLoading = signal(false);
  equipmentStatus = signal<'idle' | 'loaded' | 'empty' | 'error'>('idle');
  equipmentError = signal<string | null>(null);
  persistentStateRows = signal<DashboardPersistentStateRow[]>([]);
  persistentStateErrors = signal<string[]>([]);
  isPersistentStateLoading = signal(false);
  isPersistentStateLoaded = signal(false);
  readonly worldStateErrors = computed(() => [
    ...this.persistentStateErrors(),
    this.estateAddressError(),
  ].filter((error): error is string => error !== null));

  baseStatRows = computed<StatCardRow[]>(() =>
    mapDashboardBaseStatRows(this.runtimeStats())
  );

  healthDisplay = computed(() =>
    mapDashboardHealthDisplay(this.runtimeStats())
  );

  derivedStatRows = computed<DashboardDerivedStatRow[]>(() =>
    mapDashboardDerivedStatRows(this.runtimeStats())
  );

  loadData(): void {
    const context = this.currentDashboardContext();
    const token = this.dashboardLoadToken.next();

    this.hasLoadedDashboard.set(true);
    this.loadedContextKey.set(context ? dashboardContextKey(context) : null);
    this.clearDashboardState();

    if (!context) {
      this.pageError.set('Brak aktywnego bohatera dla panelu.');
      return;
    }

    this.isPageLoading.set(true);
    this.pageError.set(null);
    this.isExperienceLoading.set(true);
    this.isEquipmentLoading.set(true);
    this.isPersistentStateLoading.set(true);

    this.playerPageContext.getDashboardPageContext(context.heroId).subscribe({
      next: (pageContext) => {
        if (
          !this.acceptsDashboardResponse(token, context)
          || pageContext.heroId !== context.heroId
          || pageContext.serverId !== context.serverId
        ) {
          return;
        }

        this.heroName.set(pageContext.heroName);
        this.heroLevelFallback.set(pageContext.heroLevel);
        this.characterPoints.set(pageContext.characterPoints);
        this.estateAddressLabel.set(pageContext.estateAddress);
        this.isEstateAddressLoaded.set(true);
        this.origin.set(pageContext.origin);
        this.runtimeStats.set(pageContext.runtimeStats);
        this.shellState.applyDashboardContext(pageContext);
        this.equipmentPreviewRows.set(pageContext.equipmentPreviewRows);
        this.equipmentStatus.set(
          pageContext.equipmentPreviewRows.length > 0 ? 'loaded' : 'empty',
        );
        this.persistentStateRows.set(pageContext.persistentStateRows);
        this.isPersistentStateLoaded.set(true);
        this.experience.set(pageContext.experience.currentExperience);
        this.totalExperienceEarned.set(pageContext.experience.totalExperienceEarned);
        this.experienceToNextLevel.set(pageContext.experience.experienceToNextLevel);
        this.isPageReady.set(true);
        this.isPageLoading.set(false);
        this.isExperienceLoading.set(false);
        this.isEquipmentLoading.set(false);
        this.isPersistentStateLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.acceptsDashboardResponse(token, context)) {
          return;
        }

        const technicalMessage = getErrorMessage(error, 'Dashboard context could not be loaded.');
        const message = 'Nie udało się przygotować panelu bohatera. Spróbuj ponownie później.';
        this.pageError.set(message);
        this.isPageReady.set(false);
        this.runtimeStatsError.set(technicalMessage);
        this.experienceError.set(technicalMessage);
        this.equipmentError.set(technicalMessage);
        this.equipmentStatus.set('error');
        this.persistentStateErrors.set([technicalMessage]);
        this.isPageLoading.set(false);
        this.isExperienceLoading.set(false);
        this.isEquipmentLoading.set(false);
        this.isPersistentStateLoading.set(false);
      },
    });
  }

  private clearDashboardState(): void {
    this.heroName.set('');
    this.isPageReady.set(false);
    this.pageError.set(null);
    this.isPageLoading.set(false);
    this.heroLevelFallback.set(1);
    this.characterPoints.set(0);
    this.estateAddressLabel.set(null);
    this.isEstateAddressLoaded.set(false);
    this.estateAddressError.set(null);
    this.experience.set(0);
    this.totalExperienceEarned.set(0);
    this.experienceToNextLevel.set(null);
    this.isExperienceLoading.set(false);
    this.experienceError.set(null);
    this.origin.set(null);
    this.runtimeStats.set(null);
    this.runtimeStatsError.set(null);
    this.shellState.clear();
    this.equipmentPreviewRows.set([]);
    this.isEquipmentLoading.set(false);
    this.equipmentStatus.set('idle');
    this.equipmentError.set(null);
    this.persistentStateRows.set([]);
    this.persistentStateErrors.set([]);
    this.isPersistentStateLoaded.set(false);
    this.isPersistentStateLoading.set(false);
  }

  private isCurrentActiveHeroContext(
    heroId: string | null | undefined,
    serverId: string | null | undefined,
  ): boolean {
    const activeHero = this.activeHeroState.state();

    return !!heroId
      && !!serverId
      && activeHero?.heroId === heroId
      && activeHero.serverId === serverId;
  }

  private currentDashboardContext(): DashboardContext | null {
    const activeHero = this.activeHeroState.state();
    const selectedServer = this.selectedServer();

    if (
      !activeHero?.heroId
      || !activeHero.serverId
      || !selectedServer
      || selectedServer.id !== activeHero.serverId
    ) {
      return null;
    }

    return {
      heroId: activeHero.heroId,
      serverId: activeHero.serverId,
    };
  }

  private acceptsDashboardResponse(
    token: number,
    context: DashboardContext,
  ): boolean {
    return this.dashboardLoadToken.isCurrent(token)
      && this.loadedContextKey() === dashboardContextKey(context)
      && this.isCurrentDashboardContext(context);
  }

  private isCurrentDashboardContext(context: DashboardContext): boolean {
    return this.isCurrentActiveHeroContext(context.heroId, context.serverId)
      && this.selectedServer()?.id === context.serverId;
  }
}

interface DashboardContext {
  heroId: string;
  serverId: string;
}

function dashboardContextKey(context: DashboardContext): string {
  return `${context.serverId}:${context.heroId}`;
}
