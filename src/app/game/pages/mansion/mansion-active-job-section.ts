import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SUPABASE_ASSET_IMAGE_DIMENSIONS } from '../../../core/config/storage-assets.config';
import { MansionPageFacade } from '../../../core/services/buildings/mansion-page.facade';
import { toDateTimeLabel } from '../../../core/utils/date-display';
import { GameBar } from '../../../shared/game-bar/game-bar';

@Component({
  selector: 'app-mansion-active-job-section',
  standalone: true,
  imports: [GameBar, NgOptimizedImage],
  templateUrl: './mansion-active-job-section.html',
})
export class MansionActiveJobSection {
  readonly page = inject(MansionPageFacade);
  readonly imageDimensions = SUPABASE_ASSET_IMAGE_DIMENSIONS.buildingCard;
  readonly toDateTimeLabel = toDateTimeLabel;
}
