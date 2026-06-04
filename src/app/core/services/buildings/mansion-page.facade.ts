import { Injectable, computed, inject, signal } from '@angular/core';
import {
  EstateBuildingJob,
  EstateBuildingRow,
  EstateCopyJson,
  EstateRuntimeState,
  PlayerEstatePageContextV3,
} from '../../domain/estate/player-estate-page-context.model';
import { resolveBuildingImagePath } from '../../domain/building/building-image-paths';
import { toBuildingDurationLabel } from '../../utils/building-display';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { PlayerEstate } from '../estate/player-estate';
import { ToastService } from '../ui/toast';
import { MansionActiveJobState } from './mansion-active-job.state';
import { BuildingJobs } from './building-jobs';

@Injectable()
export class MansionPageFacade {
  private readonly activeJobState = inject(MansionActiveJobState);
  private readonly playerEstate = inject(PlayerEstate);
  private readonly activeHero = inject(ActiveHero);
  private readonly toast = inject(ToastService);
  private readonly buildingJobs = inject(BuildingJobs);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly context = signal<PlayerEstatePageContextV3 | null>(null);
  readonly startingBuildingId = signal<string | null>(null);
  readonly settlingActiveJobId = this.activeJobState.settlingActiveJobId;

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
  readonly activeJob = computed(
    () => this.estateRuntimeState()?.active_job_json ?? null,
  );
  readonly recentJobs = computed(
    () => this.estateRuntimeState()?.recent_jobs_json ?? [],
  );

  private loadRequestId = 0;
  private actionRequestId = 0;

  constructor() {
    this.activeJobState.configure({
      context: this.context.asReadonly(),
      applyContext: (context) => {
        this.context.set(context);
      },
      acceptsContext: (context) => this.acceptsContext(context),
      contextKey: (context) => this.contextKey(context),
      isCurrentContextKey: (contextKey) => this.isCurrentContextKey(contextKey),
    });
  }

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
      || (building.upgradePreviewJson?.meetsResourceCosts ?? building.meetsResourceCosts) === false
      || (building.upgradePreviewJson?.canAffordResourceCosts ?? building.canAffordResourceCosts) === false
      || (building.upgradePreviewJson?.meetsRequirements ?? building.meetsRequirements) === false
    ) {
      return;
    }

    const requestId = ++this.actionRequestId;
    const contextKey = this.contextKey(context);

    this.startingBuildingId.set(building.buildingId);

    this.buildingJobs.startHeroEstateBuildingUpgrade({
      heroId: context.hero.id,
      buildingId: building.buildingId,
    }).subscribe({
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

        if (message) {
          this.toast.show('error', context.copyJson.actions.upgrade, message);
        }

        this.clearStartingBuilding(requestId);
      },
    });
  }

  isStartingUpgrade(building: EstateBuildingRow): boolean {
    return this.startingBuildingId() === building.buildingId;
  }

  activeJobCountdownLabel(job: EstateBuildingJob): string | null {
    return this.activeJobState.activeJobCountdownLabel(job);
  }

  activeJobProgress(job: EstateBuildingJob): number {
    return this.activeJobState.activeJobProgress(job);
  }

  formatDuration(seconds: number): string {
    return toBuildingDurationLabel(seconds);
  }

  buildingImageUrl(building: EstateBuildingRow): string | null {
    return resolveBuildingImagePath(building.buildingKey, building.districtCode ?? null);
  }

  activeJobBuildingImageUrl(job: EstateBuildingJob): string | null {
    const building = this.buildings().find((entry) => entry.buildingId === job.buildingId);

    return building ? this.buildingImageUrl(building) : null;
  }

  buildingSectionHeading(estate: EstateRuntimeState, copy: EstateCopyJson): string {
    return estate.building_groups_json.length === 1
      ? estate.building_groups_json[0].groupTitle
      : copy.sections.buildings;
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
