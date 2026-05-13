import { Injectable, computed, inject, signal } from '@angular/core';
import { CharacterPointHistoryReadModel } from '../../types/hero.types';
import { Origin } from '../../domain/origin/origin.model';
import { EquipmentSlot } from '../../domain/item/item-equipment.model';
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
import {
  DashboardBaseStatRow,
  DashboardDerivedStatRow,
  mapDashboardBaseStatRows,
  mapDashboardDerivedDisplay,
  mapDashboardEquipmentPreviewRows,
  mapDashboardDerivedStatRows,
  mapDashboardHealthDisplay,
} from './dashboard-page.mappers';
import { EquipmentPreviewSlotRow } from '../../domain/equipment/equipment-preview.model';

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

  readonly selectedServer = this.activeServer.selectedServer;

  heroName = signal('');
  private readonly heroLevelFallback = signal(1);
  readonly level = computed(() => this.vitals.level() ?? this.heroLevelFallback());
  characterPoints = signal(0);
  totalCharacterPointsEarned = signal(0);
  estateAddress = signal<string | null>(null);
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
  readonly isEquipmentLoading = this.currentEquipment.isLoading;
  readonly equipmentStatus = this.currentEquipment.status;
  readonly equipmentError = computed(() =>
    this.equipmentSlotsError() ?? this.currentEquipment.error()
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
    mapDashboardEquipmentPreviewRows(
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
    this.heroService.getHeroEstateAddress().subscribe({
      next: (address) => this.estateAddress.set(address),
      error: () => this.estateAddress.set(null),
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
}
