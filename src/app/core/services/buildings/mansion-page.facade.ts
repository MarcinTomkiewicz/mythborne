import { Injectable, computed, inject, signal } from '@angular/core';
import {
  MansionBuildingJob,
  BuildingRequirementPreview,
  BuildingResourceType,
  MansionBuilding,
} from '../../domain/building/building.model';
import { BuildingsService } from './buildings';
import {
  toBuildingBonusLabel,
  toBuildingBonusValue,
  toBuildingDurationLabel,
  toResourceLabel,
} from '../../utils/building-display';
import { getErrorMessage } from '../../utils/error-message';

@Injectable()
export class MansionPageFacade {
  private readonly buildingsService = inject(BuildingsService);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentAddress = signal<string | null>(null);
  readonly currentDistrictCode = signal<string | null>(null);
  readonly currentDistrictName = signal<string | null>(null);
  readonly activeBuildingJob = signal<MansionBuildingJob | null>(null);
  readonly recentBuildingJobs = signal<MansionBuildingJob[]>([]);
  readonly finalizedBuildingJobsCount = signal(0);
  readonly buildings = signal<MansionBuilding[]>([]);
  readonly visibleBuildings = computed(() =>
    this.buildings().filter((building) => building.isOwned || building.isUnlocked)
  );
  private loadRequestId = 0;

  loadData() {
    const requestId = ++this.loadRequestId;

    this.isLoading.set(true);
    this.error.set(null);

    this.buildingsService.getMansionEstateView().subscribe({
      next: (view) => {
        if (requestId !== this.loadRequestId) {
          return;
        }

        this.currentAddress.set(view.currentAddress);
        this.currentDistrictCode.set(view.currentDistrictCode);
        this.currentDistrictName.set(view.currentDistrictName);
        this.activeBuildingJob.set(view.activeBuildingJob);
        this.recentBuildingJobs.set(view.recentBuildingJobs);
        this.finalizedBuildingJobsCount.set(view.finalizedBuildingJobsCount);
        this.buildings.set(view.buildings);
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

  trackByBuilding(_: number, building: MansionBuilding): string {
    return building.id;
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

