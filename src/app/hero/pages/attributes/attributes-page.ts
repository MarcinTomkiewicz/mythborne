import { Component, OnInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AttributeAllocationPageFacade } from '../../../core/services/progression/attribute-allocation-page.facade';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-hero-attributes-page',
  standalone: true,
  imports: [ButtonModule, TooltipModule, LoadingOverlay],
  providers: [AttributeAllocationPageFacade],
  templateUrl: './attributes-page.html',
})
export class HeroAttributesPage implements OnInit {
  readonly page = inject(AttributeAllocationPageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}
