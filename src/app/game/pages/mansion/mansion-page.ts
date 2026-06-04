import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SUPABASE_ASSET_IMAGE_DIMENSIONS } from '../../../core/config/storage-assets.config';
import { MansionPageFacade } from '../../../core/services/buildings/mansion-page.facade';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-mansion-page',
  standalone: true,
  imports: [ButtonModule, LoadingOverlay, NgOptimizedImage],
  providers: [MansionPageFacade],
  templateUrl: './mansion-page.html',
})
export class MansionPage implements OnInit {
  readonly page = inject(MansionPageFacade);
  readonly buildingImageDimensions = SUPABASE_ASSET_IMAGE_DIMENSIONS.buildingCard;

  ngOnInit(): void {
    this.page.loadData();
  }
}
