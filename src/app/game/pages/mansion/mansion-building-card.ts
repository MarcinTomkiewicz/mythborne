import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SUPABASE_ASSET_IMAGE_DIMENSIONS } from '../../../core/config/storage-assets.config';
import type {
  EstateBuildingRow,
  EstateCopyJson,
} from '../../../core/domain/estate/player-estate-page-context.model';
import { MansionPageFacade } from '../../../core/services/buildings/mansion-page.facade';
import { GameBar } from '../../../shared/game-bar/game-bar';

@Component({
  selector: 'app-mansion-building-card',
  standalone: true,
  imports: [ButtonModule, GameBar, NgOptimizedImage],
  templateUrl: './mansion-building-card.html',
})
export class MansionBuildingCard {
  readonly page = inject(MansionPageFacade);
  readonly building = input.required<EstateBuildingRow>();
  readonly copy = input.required<EstateCopyJson>();
  readonly imageDimensions = SUPABASE_ASSET_IMAGE_DIMENSIONS.buildingCard;
  readonly preview = computed(() => this.building().upgradePreviewJson);
  readonly bonusRows = computed(() => this.preview()?.bonusesJson ?? this.building().bonusesJson);
  readonly costRows = computed(() =>
    this.preview()?.resourceCostsJson ?? this.building().resourceCostsJson,
  );
  readonly requirementRows = computed(() => {
    const building = this.building();
    const rows = this.preview()?.requirementsJson ?? building.requirementsJson;

    return rows.length
      ? rows
      : this.preview()?.failuresJson ?? building.requirementFailuresJson;
  });
  readonly isActiveJob = computed(() =>
    this.page.activeJob()?.buildingId === this.building().buildingId,
  );
  readonly upgradeDisabled = computed(() => {
    const building = this.building();
    const preview = this.preview();

    return this.page.isStartingUpgrade(building)
      || Boolean(this.page.activeJob())
      || building.isAtMaxLevel === true
      || building.isAvailableInEstateDistrict === false
      || (preview?.meetsResourceCosts ?? building.meetsResourceCosts) === false
      || (preview?.canAffordResourceCosts ?? building.canAffordResourceCosts) === false
      || (preview?.meetsRequirements ?? building.meetsRequirements) === false;
  });
}
