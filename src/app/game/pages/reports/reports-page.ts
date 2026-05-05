import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ReportsPageState } from './reports-page.state';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    LoadingOverlay,
    ReactiveFormsModule,
    SelectModule,
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
