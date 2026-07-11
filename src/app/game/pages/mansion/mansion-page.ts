import { Component, OnInit, inject } from '@angular/core';
import { MansionActiveJobState } from '../../../core/services/buildings/mansion-active-job.state';
import { MansionPageFacade } from '../../../core/services/buildings/mansion-page.facade';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { MansionActiveJobSection } from './mansion-active-job-section';
import { MansionBuildingList } from './mansion-building-list';

@Component({
  selector: 'app-mansion-page',
  standalone: true,
  imports: [GamePageHeader, LoadingOverlay, MansionActiveJobSection, MansionBuildingList],
  providers: [MansionActiveJobState, MansionPageFacade],
  templateUrl: './mansion-page.html',
})
export class MansionPage implements OnInit {
  readonly page = inject(MansionPageFacade);
  ngOnInit(): void {
    this.page.loadData();
  }
}
