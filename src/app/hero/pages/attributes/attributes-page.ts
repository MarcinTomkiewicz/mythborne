import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { AttributeAllocationPageFacade } from '../../../core/services/progression/attribute-allocation-page.facade';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-hero-attributes-page',
  standalone: true,
  imports: [ButtonModule, RouterLink, TableModule, TooltipModule, LoadingOverlay],
  providers: [AttributeAllocationPageFacade],
  templateUrl: './attributes-page.html',
})
export class HeroAttributesPage implements OnInit {
  readonly page = inject(AttributeAllocationPageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}
