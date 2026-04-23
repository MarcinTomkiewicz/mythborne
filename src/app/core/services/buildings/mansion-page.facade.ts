import { Injectable, computed, inject, signal } from '@angular/core';
import {
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
  readonly buildings = signal<MansionBuilding[]>([]);
  readonly visibleBuildings = computed(() =>
    this.buildings().filter((building) => building.isOwned || building.isUnlocked)
  );

  loadData() {
    this.buildingsService.getMansionEstateView().subscribe({
      next: (view) => {
        this.currentAddress.set(view.currentAddress);
        this.currentDistrictCode.set(view.currentDistrictCode);
        this.currentDistrictName.set(view.currentDistrictName);
        this.buildings.set(view.buildings);
        this.error.set(null);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
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

  toBonusValue(value: number, type: 'flat' | 'percent'): string {
    return toBuildingBonusValue(value, type);
  }

  toRequirementLabel(requirement: BuildingRequirementPreview): string {
    if (requirement.type === 'hero_level') {
      return 'Hero level';
    }

    if (requirement.type === 'hero_rank') {
      return 'Hero rank';
    }

    return requirement.statLabel ?? requirement.statKey ?? 'Stat';
  }

  toRequirementValue(requirement: BuildingRequirementPreview): string {
    if (requirement.appliesFromLevel <= 1) {
      return `${requirement.minValue}`;
    }

    return `${requirement.minValue} from level ${requirement.appliesFromLevel}`;
  }

  toDurationLabel(minutes: number | null): string {
    return toBuildingDurationLabel(minutes);
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

