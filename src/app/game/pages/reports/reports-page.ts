import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ReportsPageState } from './reports-page.state';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CheckboxModule,
    GamePageHeader,
    LoadingOverlay,
    PaginatorModule,
    ReactiveFormsModule,
  ],
  providers: [ReportsPageState],
  templateUrl: './reports-page.html',
})
export class ReportsPage implements OnInit {
  readonly page = inject(ReportsPageState);

  ngOnInit(): void {
    this.page.loadData();
  }
}
