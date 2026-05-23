import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { Origin } from '../../domain/origin/origin.model';
import { EquipmentSlot } from '../../domain/item/item-equipment.model';
import { CurrentEstateAddressReadModel } from '../../domain/estate/estate-address.model';
import { MansionBuildingJob } from '../../domain/building/building.model';
import { Hero } from './hero';
import { ActiveHeroVitalsState } from './active-hero-vitals-state';
import { Origins } from '../origins/origins';
import { getErrorMessage } from '../../utils/error-message';
import {
  HeroDashboardRuntimeStatsReadModel,
} from '../../domain/hero/hero-dashboard-runtime-stats.model';
import { HeroDashboardRuntimeStats } from './hero-dashboard-runtime-stats';
import { ActiveServer } from '../server/active-server';
import { HeroEquipment } from '../items/hero-equipment';
import { CurrentEquipmentState } from '../items/current-equipment.state';
import { EstateAddresses } from '../estate/estate-addresses';
import { BuildingsService } from '../buildings/buildings';
import { GameReports } from '../reports/game-reports';
import { HeroExplorations } from '../exploration/hero-explorations';
import { ActiveHero } from './active-hero';
import { RequestToken } from '../../utils/request-token';
import {
  DashboardDerivedStatRow,
  mapDashboardBaseStatRows,
  mapDashboardDerivedStatRows,
  mapDashboardHealthDisplay,
} from './dashboard-page.mappers';
import type { StatCardRow } from '../../types/stat-card.types';
import { mapEquipmentPreviewRows } from '../../domain/equipment/equipment-preview.mapper';
import { mapDashboardPersistentStateRows } from './dashboard-persistent-state.mapper';
import { EquipmentPreviewSlotRow } from '../../domain/equipment/equipment-preview.model';
import {
  HeroDailyActionCounterReadModel,
  HeroPendingCombatEffectStateReadModel,
} from '../../domain/exploration/exploration-runtime.model';

@Injectable()
export class DashboardPageFacade {
  private readonly heroService = inject(Hero);
  private readonly vitals = inject(ActiveHeroVitalsState);
  private readonly runtimeStatsService = inject(HeroDashboardRuntimeStats);
  private readonly originsService = inject(Origins);
  private readonly activeServer = inject(ActiveServer);
  private readonly heroEquipment = inject(HeroEquipment);
  private readonly currentEquipment = inject(CurrentEquipmentState);
  private readonly estateAddresses = inject(EstateAddresses);
  private readonly buildingsService = inject(BuildingsService);
  private readonly gameReports = inject(GameReports);
  private readonly heroExplorations = inject(HeroExplorations);
  private readonly activeHeroState = inject(ActiveHero);
  readonly selectedServer = this.activeServer.selectedServer;

  private readonly dashboardLoadToken = new RequestToken();
  private readonly estateAddressLoadToken = new RequestToken();
  private readonly persistentStateLoadToken = new RequestToken();
  private readonly hasLoadedDashboard = signal(false);
  private readonly loadedContextKey = signal<string | null>(null);
  private readonly persistentStateContext = signal<{
    heroId: string;
    serverId: string;
  } | null>(null);

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
  readonly level = computed(() => this.vitals.level() ?? this.heroLevelFallback());
  characterPoints = signal(0);
  currentEstateAddress = signal<CurrentEstateAddressReadModel | null>(null);
  readonly estateAddress = computed(() =>
    this.currentEstateAddress()?.addressLabel ?? null
  );
  isEstateAddressLoaded = signal(false);
  estateAddressError = signal<string | null>(null);
  readonly heroLevel = this.level;
  readonly experience = this.vitals.currentExperience;
  readonly totalExperienceEarned = this.vitals.totalExperienceEarned;
  readonly experienceToNextLevel = this.vitals.experienceToNextLevel;
  readonly remainingExperience = this.vitals.remainingExperience;
  readonly experiencePercent = this.vitals.experiencePercent;
  readonly isExperienceLoading = this.vitals.isLoading;
  readonly experienceError = this.vitals.error;

  origin = signal<Origin | null>(null);

  runtimeStats = signal<HeroDashboardRuntimeStatsReadModel | null>(null);
  runtimeStatsError = signal<string | null>(null);
  equipmentSlots = signal<EquipmentSlot[]>([]);
  equipmentSlotsError = signal<string | null>(null);
  activeBuildingJob = signal<MansionBuildingJob | null>(null);
  isBuildingJobStateLoaded = signal(false);
  unreadReportCount = signal(0);
  isReportsStateLoaded = signal(false);
  trialCounter = signal<HeroDailyActionCounterReadModel | null>(null);
  isTrialCounterLoaded = signal(false);
  activeCombatEffect = signal<HeroPendingCombatEffectStateReadModel | null>(null);
  isCombatEffectStateLoaded = signal(false);
  persistentStateErrors = signal<string[]>([]);
  isPersistentStateLoading = signal(false);
  isPersistentStateLoaded = signal(false);
  readonly worldStateErrors = computed(() => [
    ...this.persistentStateErrors(),
    this.estateAddressError(),
  ].filter((error): error is string => error !== null));
  readonly isEquipmentLoading = this.currentEquipment.isLoading;
  readonly equipmentStatus = this.currentEquipment.status;
  readonly equipmentError = computed(() =>
    this.equipmentSlotsError() ?? this.currentEquipment.error()
  );
  readonly persistentStateRows = computed(() =>
    mapDashboardPersistentStateRows({
      activeBuildingJob: this.activeBuildingJob(),
      isBuildingJobStateLoaded: this.isBuildingJobStateLoaded(),
      unreadReportCount: this.unreadReportCount(),
      isReportsStateLoaded: this.isReportsStateLoaded(),
      trialCounter: this.trialCounter(),
      isTrialCounterLoaded: this.isTrialCounterLoaded(),
      activeCombatEffect: this.activeCombatEffect(),
      isCombatEffectStateLoaded: this.isCombatEffectStateLoaded(),
      estateAddress: this.currentEstateAddress(),
      isEstateAddressLoaded: this.isEstateAddressLoaded(),
    })
  );

  baseStatRows = computed<StatCardRow[]>(() =>
    mapDashboardBaseStatRows(this.runtimeStats())
  );

  healthDisplay = computed(() =>
    mapDashboardHealthDisplay({
      currentHealth: this.vitals.currentHealth(),
      maxHealth: this.vitals.maxHealth(),
    })
  );

  derivedStatRows = computed<DashboardDerivedStatRow[]>(() =>
    mapDashboardDerivedStatRows(this.runtimeStats())
  );

  equipmentPreviewRows = computed<EquipmentPreviewSlotRow[]>(() =>
    mapEquipmentPreviewRows(
      this.equipmentSlots(),
      this.currentEquipment.slots(),
    )
  );

  loadData(): void {
    const context = this.currentDashboardContext();
    const token = this.dashboardLoadToken.next();

    this.hasLoadedDashboard.set(true);
    this.loadedContextKey.set(context ? dashboardContextKey(context) : null);
    this.clearDashboardState();

    if (!context) {
      return;
    }

    this.loadEstateAddress(context);
    this.loadRuntimeStats(context, token);
    this.loadEquipmentPreview(context, token);

    this.heroService.getHeroData().subscribe((hero) => {
      if (
        !this.acceptsDashboardResponse(token, context)
        || hero.id !== context.heroId
        || hero.server_id !== context.serverId
      ) {
        return;
      }

      this.heroName.set(hero.name);
      this.heroLevelFallback.set(hero.level ?? 1);
      this.characterPoints.set(hero.character_points ?? 0);
      this.vitals.load();
      this.loadPersistentStates(context.heroId, context.serverId);

      if (hero.origin_id) {
        this.originsService
          .getOriginWithBonuses(hero.origin_id)
          .subscribe(({ origin }) => {
            if (!this.acceptsDashboardResponse(token, context)) {
              return;
            }

            this.origin.set(origin);
          });
      }
    });
  }

  private loadEstateAddress(context: DashboardContext): void {
    const token = this.estateAddressLoadToken.next();

    this.isEstateAddressLoaded.set(false);
    this.estateAddressError.set(null);

    this.estateAddresses.getActiveHeroCurrentAddress().subscribe({
      next: (address) => {
        if (
          !this.estateAddressLoadToken.isCurrent(token)
          || !this.isCurrentDashboardContext(context)
        ) {
          return;
        }

        this.currentEstateAddress.set(address);
        this.isEstateAddressLoaded.set(true);
      },
      error: (error: unknown) => {
        if (
          !this.estateAddressLoadToken.isCurrent(token)
          || !this.isCurrentDashboardContext(context)
        ) {
          return;
        }

        this.currentEstateAddress.set(null);
        this.isEstateAddressLoaded.set(false);
        this.estateAddressError.set(
          getErrorMessage(error, 'Estate context could not be loaded.'),
        );
      },
    });
  }

  private loadRuntimeStats(context: DashboardContext, token: number): void {
    this.runtimeStatsError.set(null);

    this.runtimeStatsService.getActiveHeroRuntimeStats().subscribe({
      next: (stats) => {
        if (
          !this.acceptsDashboardResponse(token, context)
          || stats.heroId !== context.heroId
        ) {
          return;
        }

        this.runtimeStats.set(stats);
      },
      error: (error: unknown) => {
        if (!this.acceptsDashboardResponse(token, context)) {
          return;
        }

        this.runtimeStats.set(null);
        this.runtimeStatsError.set(
          getErrorMessage(error, 'Dashboard runtime stats could not be loaded.'),
        );
      },
    });
  }

  private loadEquipmentPreview(context: DashboardContext, token: number): void {
    this.equipmentSlotsError.set(null);
    this.currentEquipment.load();

    this.heroEquipment.getEquipmentSlots().subscribe({
      next: (slots) => {
        if (!this.acceptsDashboardResponse(token, context)) {
          return;
        }

        this.equipmentSlots.set(slots);
      },
      error: (error: unknown) => {
        if (!this.acceptsDashboardResponse(token, context)) {
          return;
        }

        this.equipmentSlots.set([]);
        this.equipmentSlotsError.set(
          getErrorMessage(error, 'Equipment slots could not be loaded.'),
        );
      },
    });
  }

  private clearDashboardState(): void {
    this.heroName.set('');
    this.heroLevelFallback.set(1);
    this.characterPoints.set(0);
    this.origin.set(null);
    this.runtimeStats.set(null);
    this.runtimeStatsError.set(null);
    this.currentEstateAddress.set(null);
    this.isEstateAddressLoaded.set(false);
    this.estateAddressError.set(null);
    this.equipmentSlots.set([]);
    this.equipmentSlotsError.set(null);
    this.currentEquipment.clear();
    this.activeBuildingJob.set(null);
    this.isBuildingJobStateLoaded.set(false);
    this.unreadReportCount.set(0);
    this.isReportsStateLoaded.set(false);
    this.trialCounter.set(null);
    this.isTrialCounterLoaded.set(false);
    this.activeCombatEffect.set(null);
    this.isCombatEffectStateLoaded.set(false);
    this.persistentStateErrors.set([]);
    this.isPersistentStateLoaded.set(false);
    this.isPersistentStateLoading.set(false);
    this.persistentStateContext.set(null);
  }

  private loadPersistentStates(heroId: string, serverId: string): void {
    const token = this.persistentStateLoadToken.next();

    this.persistentStateContext.set({ heroId, serverId });
    this.activeBuildingJob.set(null);
    this.isBuildingJobStateLoaded.set(false);
    this.unreadReportCount.set(0);
    this.isReportsStateLoaded.set(false);
    this.trialCounter.set(null);
    this.isTrialCounterLoaded.set(false);
    this.activeCombatEffect.set(null);
    this.isCombatEffectStateLoaded.set(false);
    this.persistentStateErrors.set([]);
    this.isPersistentStateLoaded.set(false);
    this.isPersistentStateLoading.set(true);

    forkJoin({
      estateView: this.buildingsService.getMansionEstateView().pipe(
        map((view) => ({ view, isLoaded: true, error: null })),
        catchError((error: unknown) => of({
          view: null,
          isLoaded: false,
          error: getErrorMessage(error, 'Estate persistent state could not be loaded.'),
        })),
      ),
      unreadReports: this.gameReports.getActiveHeroUnreadCount().pipe(
        map((count) => ({ count, isLoaded: true, error: null })),
        catchError((error: unknown) => of({
          count: 0,
          isLoaded: false,
          error: getErrorMessage(error, 'Report attention state could not be loaded.'),
        })),
      ),
      trialCounter: this.heroExplorations.getHeroTrialCounter({ heroId, serverId }).pipe(
        map((counter) => ({ counter, isLoaded: true, error: null })),
        catchError((error: unknown) => of({
          counter: null,
          isLoaded: false,
          error: getErrorMessage(error, 'Trial counter could not be loaded.'),
        })),
      ),
      combatEffects: this.heroExplorations.getHeroPendingCombatEffectState(heroId).pipe(
        map((effects) => ({ effects, isLoaded: true, error: null })),
        catchError((error: unknown) => of({
          effects: [],
          isLoaded: false,
          error: getErrorMessage(error, 'Active state could not be loaded.'),
        })),
      ),
    }).subscribe(({ estateView, unreadReports, trialCounter, combatEffects }) => {
      if (
        !this.persistentStateLoadToken.isCurrent(token)
        || !this.isCurrentPersistentStateContext(heroId, serverId)
      ) {
        return;
      }

      if (
        estateView.view
        && (
          estateView.view.heroId !== heroId
          || estateView.view.serverId !== serverId
        )
      ) {
        this.activeBuildingJob.set(null);
        this.persistentStateErrors.set([
          'Estate persistent state returned a stale hero/server result.',
        ]);
        this.unreadReportCount.set(unreadReports.count);
        this.trialCounter.set(validTrialCounter(trialCounter.counter, heroId, serverId));
        this.activeCombatEffect.set(validCombatEffect(combatEffects.effects, heroId, serverId));
        this.isBuildingJobStateLoaded.set(false);
        this.isReportsStateLoaded.set(unreadReports.isLoaded);
        this.isTrialCounterLoaded.set(trialCounter.isLoaded);
        this.isCombatEffectStateLoaded.set(combatEffects.isLoaded);
        this.isPersistentStateLoaded.set(true);
        this.isPersistentStateLoading.set(false);
        return;
      }

      this.activeBuildingJob.set(estateView.view?.activeBuildingJob ?? null);
      this.isBuildingJobStateLoaded.set(estateView.isLoaded);
      this.unreadReportCount.set(unreadReports.count);
      this.isReportsStateLoaded.set(unreadReports.isLoaded);
      this.trialCounter.set(validTrialCounter(trialCounter.counter, heroId, serverId));
      this.isTrialCounterLoaded.set(trialCounter.isLoaded);
      this.activeCombatEffect.set(validCombatEffect(combatEffects.effects, heroId, serverId));
      this.isCombatEffectStateLoaded.set(combatEffects.isLoaded);
      this.persistentStateErrors.set([
        estateView.error,
        unreadReports.error,
        trialCounter.error,
        combatEffects.error,
      ].filter((error): error is string => error !== null));
      this.isPersistentStateLoaded.set(true);
      this.isPersistentStateLoading.set(false);
    });
  }

  private isCurrentPersistentStateContext(heroId: string, serverId: string): boolean {
    const context = this.persistentStateContext();

    return context?.heroId === heroId
      && context.serverId === serverId
      && this.isCurrentActiveHeroContext(heroId, serverId)
      && this.selectedServer()?.id === serverId;
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

function validTrialCounter(
  counter: HeroDailyActionCounterReadModel | null,
  heroId: string,
  serverId: string,
): HeroDailyActionCounterReadModel | null {
  return counter?.heroId === heroId && counter.serverId === serverId
    ? counter
    : null;
}

function validCombatEffect(
  effects: HeroPendingCombatEffectStateReadModel[],
  heroId: string,
  serverId: string,
): HeroPendingCombatEffectStateReadModel | null {
  return effects.find((effect) =>
    effect.heroId === heroId
    && effect.serverId === serverId
    && effect.isActive
  ) ?? null;
}
