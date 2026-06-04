import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SUPABASE_ASSET_IMAGE_DIMENSIONS } from '../../../core/config/storage-assets.config';
import { EstateBuildingJob } from '../../../core/domain/estate/player-estate-page-context.model';
import { MansionPageFacade } from '../../../core/services/buildings/mansion-page.facade';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-mansion-page',
  standalone: true,
  imports: [ButtonModule, GameBar, GamePageHeader, LoadingOverlay, NgOptimizedImage],
  providers: [MansionPageFacade],
  templateUrl: './mansion-page.html',
})
export class MansionPage implements OnInit {
  readonly page = inject(MansionPageFacade);
  readonly buildingImageDimensions = SUPABASE_ASSET_IMAGE_DIMENSIONS.buildingCard;

  ngOnInit(): void {
    this.page.loadData();
  }

  activeJobProgress(job: EstateBuildingJob): number {
    if (job.isDue === true) {
      return 100;
    }

    if (
      !job.startedAt
      || !job.completesAt
      || job.secondsUntilCompletion === undefined
    ) {
      return 0;
    }

    const startedAt = new Date(job.startedAt).getTime();
    const completesAt = new Date(job.completesAt).getTime();
    const totalMs = completesAt - startedAt;

    if (!Number.isFinite(totalMs) || totalMs <= 0) {
      return 0;
    }

    const remainingMs = Math.max(job.secondsUntilCompletion, 0) * 1000;
    const progress = ((totalMs - remainingMs) / totalMs) * 100;

    return Math.round(Math.min(Math.max(progress, 0), 100));
  }
}
