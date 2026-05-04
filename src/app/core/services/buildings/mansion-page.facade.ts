import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import {
  MansionBuildingJob,
  BuildingRequirementPreview,
  BuildingResourceType,
  MansionBuilding,
  StartBuildingUpgradeResult,
} from '../../domain/building/building.model';
import { BuildingsService } from './buildings';
import {
  toBuildingBonusLabel,
  toBuildingBonusValue,
  toBuildingDurationLabel,
  toResourceLabel,
} from '../../utils/building-display';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { BuildingExplainabilityMetadata } from './building-explainability-metadata';
import { BuildingUiMetadata } from './building-ui-metadata';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';

@Injectable()
export class MansionPageFacade {
  private readonly buildingsService = inject(BuildingsService);
  private readonly activeHero = inject(ActiveHero);
  private readonly explainabilityMetadata = inject(BuildingExplainabilityMetadata);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);
  readonly lastStartedJob = signal<StartBuildingUpgradeResult | null>(null);
  readonly startingBuildingId = signal<string | null>(null);
  readonly startedJobPendingRefresh = signal(false);
  readonly currentAddress = signal<string | null>(null);
  readonly currentDistrictCode = signal<string | null>(null);
  readonly currentDistrictName = signal<string | null>(null);
  readonly activeBuildingJob = signal<MansionBuildingJob | null>(null);
  readonly recentBuildingJobs = signal<MansionBuildingJob[]>([]);
  readonly finalizedBuildingJobsCount = signal(0);
  readonly buildings = signal<MansionBuilding[]>([]);
  readonly uiMetadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly uiMetadata = new BuildingUiMetadata(() => this.uiMetadataEntries());
  readonly visibleBuildings = computed(() =>
    this.buildings().filter((building) => building.isOwned || building.isUnlocked)
  );
  private loadRequestId = 0;
  private actionRequestId = 0;

  loadData() {
    const requestId = ++this.loadRequestId;

    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      view: this.buildingsService.getMansionEstateView(),
      uiMetadataEntries: this.explainabilityMetadata.getRuntimeEntries(),
    }).pipe(
      switchMap((payload) =>
        this.activeHero.loadActiveHero().pipe(
          map(() => payload),
          catchError(() => of(payload)),
        ),
      ),
    ).subscribe({
      next: ({ view, uiMetadataEntries }) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.uiMetadataEntries.set(uiMetadataEntries);
        this.currentAddress.set(view.currentAddress);
        this.currentDistrictCode.set(view.currentDistrictCode);
        this.currentDistrictName.set(view.currentDistrictName);
        this.activeBuildingJob.set(view.activeBuildingJob);
        this.recentBuildingJobs.set(view.recentBuildingJobs);
        this.finalizedBuildingJobsCount.set(view.finalizedBuildingJobsCount);
        this.buildings.set(view.buildings);
        if (view.activeBuildingJob || view.finalizedBuildingJobsCount > 0) {
          this.startedJobPendingRefresh.set(false);
        }
        this.error.set(null);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to load estate buildings.'));
        this.isLoading.set(false);
      },
    });
  }

  startBuildingUpgrade(building: MansionBuilding): void {
    if (!this.canStartBuilding(building)) {
      this.actionError.set(this.disabledBuildReason(building));
      return;
    }
    const requestId = ++this.actionRequestId;
    const context = this.currentActionContext();

    this.startingBuildingId.set(building.id);
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.lastStartedJob.set(null);

    this.buildingsService.startBuildingUpgrade(building.id).pipe(
      switchMap((result) =>
        this.activeHero.loadActiveHero().pipe(map(() => result)),
      ),
    ).subscribe({
      next: (result) => {
        if (!this.isCurrentAction(requestId, context)) {
          this.clearStaleActionRequest(requestId);
          return;
        }

        this.lastStartedJob.set(result);
        this.actionSuccess.set(
          `${building.name} started to level ${result.targetLevel}.`,
        );
        this.startedJobPendingRefresh.set(true);
        this.startingBuildingId.set(null);
        this.loadData();
      },
      error: (error: unknown) => {
        if (!this.isCurrentAction(requestId, context)) {
          this.clearStaleActionRequest(requestId);
          return;
        }

        this.actionError.set(
          getErrorMessage(error, 'Building construction could not be started.'),
        );
        this.startingBuildingId.set(null);
      },
    });
  }

  trackByBuilding(_: number, building: MansionBuilding): string {
    return building.id;
  }

  canStartBuilding(building: MansionBuilding): boolean {
    return (
      building.canUpgrade &&
      this.activeBuildingJob() === null &&
      this.startingBuildingId() === null &&
      !this.startedJobPendingRefresh()
    );
  }

  buildButtonLabel(building: MansionBuilding): string {
    if (this.startingBuildingId() === building.id) {
      return 'Starting...';
    }

    if (this.startedJobPendingRefresh()) {
      return 'Job active';
    }

    if (this.activeBuildingJob()) {
      return 'Job active';
    }

    if (!building.canUpgrade) {
      return 'Unavailable';
    }

    return building.currentLevel > 0 ? 'Upgrade' : 'Build';
  }

  disabledBuildReason(building: MansionBuilding): string {
    if (this.activeBuildingJob()) {
      return 'Another estate building job is already active.';
    }

    if (this.startedJobPendingRefresh()) {
      return 'A building job has just started and estate state is refreshing.';
    }

    if (!building.canUpgrade) {
      return 'This building cannot be upgraded from the current level or district cap.';
    }

    if (this.startingBuildingId()) {
      return 'A building start request is already in progress.';
    }

    return 'Building action is unavailable.';
  }

  private currentActionContext(): {
    heroId: string | null;
    serverId: string | null;
    address: string | null;
  } {
    const state = this.activeHero.state();

    return {
      heroId: state?.heroId ?? null,
      serverId: state?.serverId ?? null,
      address: this.currentAddress(),
    };
  }

  private isCurrentAction(
    requestId: number,
    context: { heroId: string | null; serverId: string | null; address: string | null },
  ): boolean {
    const current = this.currentActionContext();

    return (
      requestId === this.actionRequestId &&
      current.heroId === context.heroId &&
      current.serverId === context.serverId &&
      current.address === context.address
    );
  }

  private clearStaleActionRequest(requestId: number): void {
    if (requestId === this.actionRequestId) {
      this.startingBuildingId.set(null);
    }
  }

  toBonusLabel(target: string): string {
    return toBuildingBonusLabel(target);
  }

  toBonusValue(value: number, type: MansionBuilding['bonuses'][number]['type']): string {
    return toBuildingBonusValue(value, type);
  }

  toRequirementLabel(requirement: BuildingRequirementPreview): string {
    return requirement.label;
  }

  toRequirementValue(requirement: BuildingRequirementPreview): string {
    const value = requirement.valueLabel;

    if (!value) {
      return requirement.appliesFromLevel <= 1
        ? ''
        : `From level ${requirement.appliesFromLevel}`;
    }

    if (requirement.appliesFromLevel <= 1) {
      return value;
    }

    return `${value} from level ${requirement.appliesFromLevel}`;
  }

  toDurationLabel(seconds: number | null): string {
    return toBuildingDurationLabel(seconds);
  }

  toDateTimeLabel(value: string): string {
    return new Date(value).toLocaleString();
  }

  resourceLabel(type: BuildingResourceType): string {
    return toResourceLabel(type);
  }

  handleImageError(event: Event) {
    const element = event.target as HTMLImageElement | null;

    if (element && !element.dataset['fallback']) {
      element.dataset['fallback'] = 'true';
      element.src = '/assets/icons/capitol.svg';
    }
  }
}

