import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { CharacterPointHistoryReadModel } from '../../types/hero.types';
import { Origin } from '../../domain/origin/origin.model';
import { EquipmentSlot } from '../../domain/item/item-equipment.model';
import { CurrentEstateAddressReadModel } from '../../domain/estate/estate-address.model';
import { MansionBuildingJob } from '../../domain/building/building.model';
import { IStat } from '../../interfaces/i-stats/i-stats';
import { Hero } from './hero';
import { ActiveHeroVitalsState } from './active-hero-vitals-state';
import { Origins } from '../origins/origins';
import { StatsService } from '../stats/stats';
import { getErrorMessage } from '../../utils/error-message';
import { CharacterPointHistory } from './character-point-history';
import {
  HeroDashboardRuntimeStats,
  HeroDashboardRuntimeStatsReadModel,
} from './hero-dashboard-runtime-stats';
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
  DashboardBaseStatRow,
  DashboardDerivedStatRow,
  mapDashboardBaseStatRows,
  mapDashboardDerivedDisplay,
  mapDashboardDerivedStatRows,
  mapDashboardHealthDisplay,
} from './dashboard-page.mappers';
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
  private readonly characterPointHistory = inject(CharacterPointHistory);
  private readonly statsService = inject(StatsService);
  private readonly originsService = inject(Origins);
  private readonly activeServer = inject(ActiveServer);
  private readonly heroEquipment = inject(HeroEquipment);
  private readonly currentEquipment = inject(CurrentEquipmentState);
  private readonly estateAddresses = inject(EstateAddresses);
  private readonly buildingsService = inject(BuildingsService);
  private readonly gameReports = inject(GameReports);
  private readonly heroExplorations = inject(HeroExplorations);
  private readonly activeHeroState = inject(ActiveHero);
  private readonly estateAddressLoadToken = new RequestToken();
  private readonly persistentStateLoadToken = new RequestToken();
  private readonly persistentStateContext = signal<{
    heroId: string;
    serverId: string;
  } | null>(null);

  readonly selectedServer = this.activeServer.selectedServer;

  heroName = signal('');
  private readonly heroLevelFallback = signal(1);
  readonly level = computed(() => this.vitals.level() ?? this.heroLevelFallback());
  characterPoints = signal(0);
  totalCharacterPointsEarned = signal(0);
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

  statsList = signal<IStat[]>([]);
  runtimeStats = signal<HeroDashboardRuntimeStatsReadModel | null>(null);
  runtimeStatsError = signal<string | null>(null);
  characterPointHistoryEntries = signal<CharacterPointHistoryReadModel[]>([]);
  characterPointHistoryError = signal<string | null>(null);
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

  statsDisplay = computed(() =>
    this.runtimeStats()?.stats ?? {}
  );

  baseStatRows = computed<DashboardBaseStatRow[]>(() =>
    mapDashboardBaseStatRows(this.statsList(), this.statsDisplay())
  );

  derivedDisplay = computed(() =>
    mapDashboardDerivedDisplay(this.runtimeStats())
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

  loadData() {
    this.statsService.getStats().subscribe(this.statsList.set);

    this.heroService.getHeroData().subscribe((hero) => {
      this.heroName.set(hero.name);
      this.heroLevelFallback.set(hero.level ?? 1);
      this.characterPoints.set(hero.character_points ?? 0);
      this.totalCharacterPointsEarned.set(hero.total_character_points_earned ?? 0);
      this.vitals.load();
      this.loadPersistentStates(hero.id, hero.server_id);

      if (hero.origin_id) {
        this.originsService
          .getOriginWithBonuses(hero.origin_id)
          .subscribe(({ origin }) => {
            this.origin.set(origin);
          });
      }
    });

    this.loadEstateAddress();
    this.loadRuntimeStats();
    this.loadCharacterPointHistory();
    this.loadEquipmentPreview();
  }

  private loadEstateAddress(): void {
    const token = this.estateAddressLoadToken.next();
    const activeHero = this.activeHeroState.state();

    this.isEstateAddressLoaded.set(false);
    this.estateAddressError.set(null);

    this.estateAddresses.getActiveHeroCurrentAddress().subscribe({
      next: (address) => {
        if (
          !this.estateAddressLoadToken.isCurrent(token)
          || !this.isCurrentActiveHeroContext(activeHero?.heroId, activeHero?.serverId)
        ) {
          return;
        }

        this.currentEstateAddress.set(address);
        this.isEstateAddressLoaded.set(true);
      },
      error: (error: unknown) => {
        if (
          !this.estateAddressLoadToken.isCurrent(token)
          || !this.isCurrentActiveHeroContext(activeHero?.heroId, activeHero?.serverId)
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

  private loadCharacterPointHistory(): void {
    this.characterPointHistoryError.set(null);

    this.characterPointHistory
      .getActiveHeroHistory({ limit: 5 })
      .subscribe({
        next: (entries) => this.characterPointHistoryEntries.set(entries),
        error: (error: unknown) => {
          this.characterPointHistoryEntries.set([]);
          this.characterPointHistoryError.set(
            getErrorMessage(error, 'Character Points history could not be loaded.'),
          );
        },
      });
  }

  private loadRuntimeStats(): void {
    this.runtimeStatsError.set(null);

    this.runtimeStatsService.getActiveHeroRuntimeStats().subscribe({
      next: (stats) => this.runtimeStats.set(stats),
      error: (error: unknown) => {
        this.runtimeStats.set(null);
        this.runtimeStatsError.set(
          getErrorMessage(error, 'Dashboard runtime stats could not be loaded.'),
        );
      },
    });
  }

  private loadEquipmentPreview(): void {
    this.equipmentSlotsError.set(null);
    this.currentEquipment.load();

    this.heroEquipment.getEquipmentSlots().subscribe({
      next: (slots) => this.equipmentSlots.set(slots),
      error: (error: unknown) => {
        this.equipmentSlots.set([]);
        this.equipmentSlotsError.set(
          getErrorMessage(error, 'Equipment slots could not be loaded.'),
        );
      },
    });
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
