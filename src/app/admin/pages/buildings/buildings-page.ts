import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';
import { BuildingFormulaAdminFacade } from '../../../core/services/buildings/building-formula-admin.facade';

@Component({
  selector: 'app-buildings-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, LoadingOverlay],
  providers: [BuildingFormulaAdminFacade, BuildingsPageFacade],
  templateUrl: './buildings-page.html',
})
export class BuildingsPage implements OnInit {
  readonly page = inject(BuildingsPageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}

