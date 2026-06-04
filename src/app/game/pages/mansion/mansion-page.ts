import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SUPABASE_ASSET_IMAGE_DIMENSIONS } from '../../../core/config/storage-assets.config';
import { MansionActiveJobState } from '../../../core/services/buildings/mansion-active-job.state';
import { MansionPageFacade } from '../../../core/services/buildings/mansion-page.facade';
import { toDateTimeLabel } from '../../../core/utils/date-display';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-mansion-page',
  standalone: true,
  imports: [ButtonModule, GameBar, GamePageHeader, LoadingOverlay, NgOptimizedImage],
  providers: [MansionActiveJobState, MansionPageFacade],
  templateUrl: './mansion-page.html',
})
export class MansionPage implements OnInit {
  readonly page = inject(MansionPageFacade);
  readonly buildingImageDimensions = SUPABASE_ASSET_IMAGE_DIMENSIONS.buildingCard;
  readonly toDateTimeLabel = toDateTimeLabel;

  ngOnInit(): void {
    this.page.loadData();
  }
}
