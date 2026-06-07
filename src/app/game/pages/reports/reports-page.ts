import { Component, OnInit, inject } from '@angular/core';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ReportFiltersPanel } from './report-filters-panel';
import { ReportListSection } from './report-list-section';
import { ReportPreviewPanel } from './report-preview-panel';
import { ReportsPageState } from './reports-page.state';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    GamePageHeader,
    LoadingOverlay,
    ReportFiltersPanel,
    ReportListSection,
    ReportPreviewPanel,
  ],
  providers: [ReportsPageState],
  templateUrl: './reports-page.html',
  host: { class: 'd-block w-100 min-w-0' },
})
export class ReportsPage implements OnInit {
  readonly page = inject(ReportsPageState);

  ngOnInit(): void {
    this.page.loadData();
  }
}
