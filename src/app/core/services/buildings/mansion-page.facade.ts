import { Injectable, computed, inject, signal } from '@angular/core';
import { switchMap } from 'rxjs';
import {
  EstateBuildingDistrictGroup,
  EstateBuildingRow,
  PlayerEstatePageContextV3,
} from '../../domain/estate/player-estate-page-context.model';
import { resolveBuildingImagePath } from '../../domain/building/building-image-paths';
import { toBuildingDurationLabel } from '../../utils/building-display';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { PlayerEstate } from '../estate/player-estate';
import { BuildingJobs } from './building-jobs';

@Injectable()
export class MansionPageFacade {
  private readonly playerEstate = inject(PlayerEstate);
  private readonly activeHero = inject(ActiveHero);
  private readonly buildingJobs = inject(BuildingJobs);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly context = signal<PlayerEstatePageContextV3 | null>(null);
  readonly startingBuildingId = signal<string | null>(null);

  readonly copyJson = computed(() => this.context()?.copyJson ?? null);
  readonly estateRuntimeState = computed(
    () => this.context()?.estateRuntimeState ?? null,
  );
  readonly resources = computed(
    () => this.estateRuntimeState()?.resources_json ?? [],
  );
  readonly buildings = computed(
    () => this.estateRuntimeState()?.buildings_json ?? [],
  );
  readonly buildingDistrictGroups = computed(() =>
    this.groupBuildingsByDistrict(this.buildings()),
  );
  readonly activeJob = computed(
    () => this.estateRuntimeState()?.active_job_json ?? null,
  );
  readonly recentJobs = computed(
    () => this.estateRuntimeState()?.recent_jobs_json ?? [],
  );

  private loadRequestId = 0;
  private actionRequestId = 0;

  loadData(): void {
    const requestId = ++this.loadRequestId;

    this.isLoading.set(true);
    this.error.set(null);

    this.playerEstate.getPageContext().subscribe({
      next: (context) => {
        if (
          requestId !== this.loadRequestId
          || !this.acceptsContext(context)
        ) {
          return;
        }

        this.context.set(context);
        this.error.set(null);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.setError(error);
        this.isLoading.set(false);
      },
    });
  }

  startBuildingUpgrade(building: EstateBuildingRow): void {
    const context = this.context();
    const estate = context?.estateRuntimeState;

    if (
      !context
      || !estate
      || this.activeJob()
      || this.startingBuildingId()
      || building.isAtMaxLevel === true
      || building.isAvailableInEstateDistrict === false
      || (building.upgradePreviewJson?.meetsRequirements ?? building.meetsRequirements) === false
    ) {
      return;
    }

    const requestId = ++this.actionRequestId;
    const contextKey = this.contextKey(context);

    this.startingBuildingId.set(building.buildingId);
    this.actionError.set(null);

    this.activeHero.requireActiveHero().pipe(
      switchMap((activeHero) =>
        this.buildingJobs.startHeroEstateBuildingUpgrade({
          heroId: activeHero.heroId,
          buildingId: building.buildingId,
        }),
      ),
    ).subscribe({
      next: (result) => {
        if (
          requestId !== this.actionRequestId
          || !this.isCurrentContextKey(contextKey)
        ) {
          this.clearStartingBuilding(requestId);
          return;
        }

        if (
          result.estateId !== estate.estate_id
          || result.buildingId !== building.buildingId
        ) {
          this.clearStartingBuilding(requestId);
          this.loadData();
          return;
        }

        this.clearStartingBuilding(requestId);
        this.loadData();
      },
      error: (error: unknown) => {
        if (
          requestId !== this.actionRequestId
          || !this.isCurrentContextKey(contextKey)
        ) {
          this.clearStartingBuilding(requestId);
          return;
        }

        const message = getErrorMessage(error, '');
        this.actionError.set(message || null);
        this.clearStartingBuilding(requestId);
      },
    });
  }

  isStartingUpgrade(building: EstateBuildingRow): boolean {
    return this.startingBuildingId() === building.buildingId;
  }

  formatDuration(seconds: number): string {
    return toBuildingDurationLabel(seconds);
  }

  buildingImageUrl(building: EstateBuildingRow): string | null {
    return resolveBuildingImagePath(building.buildingKey, building.districtCode ?? null);
  }

  trackByBuilding(_: number, building: EstateBuildingRow): string {
    return building.buildingId;
  }

  trackByBuildingDistrictGroup(_: number, group: EstateBuildingDistrictGroup): string {
    return group.districtCode ?? 'buildings';
  }

  toDateTimeLabel(value: string): string {
    return new Date(value).toLocaleString();
  }

  private groupBuildingsByDistrict(
    buildings: readonly EstateBuildingRow[],
  ): EstateBuildingDistrictGroup[] {
    const groups: EstateBuildingDistrictGroup[] = [];

    for (const building of buildings) {
      const districtCode = building.districtCode ?? null;
      let group = groups.find((entry) => entry.districtCode === districtCode);

      if (!group) {
        group = {
          districtCode,
          buildings: [],
        };
        groups.push(group);
      }

      group.buildings.push(building);
    }

    return groups;
  }

  private acceptsContext(context: PlayerEstatePageContextV3): boolean {
    const activeHero = this.activeHero.state();
    const estate = context.estateRuntimeState;

    if (
      !activeHero
      || activeHero.heroId !== context.hero.id
      || activeHero.serverId !== context.hero.server_id
    ) {
      return false;
    }

    return estate === null
      || (
        estate.hero_id === context.hero.id
        && estate.server_id === context.hero.server_id
        && estate.estate_id === context.hero.estate_id
      );
  }

  private contextKey(context: PlayerEstatePageContextV3 | null): string | null {
    const estate = context?.estateRuntimeState;

    return context && estate
      ? `${context.hero.server_id}:${context.hero.id}:${estate.estate_id}`
      : null;
  }

  private isCurrentContextKey(contextKey: string | null): boolean {
    const context = this.context();
    const activeHero = this.activeHero.state();

    return !!context
      && !!activeHero
      && this.contextKey(context) === contextKey
      && activeHero.heroId === context.hero.id
      && activeHero.serverId === context.hero.server_id;
  }

  private setError(error: unknown): void {
    const message = getErrorMessage(error, '');

    this.error.set(message || null);
  }

  private clearStartingBuilding(requestId: number): void {
    if (requestId === this.actionRequestId) {
      this.startingBuildingId.set(null);
    }
  }
}
