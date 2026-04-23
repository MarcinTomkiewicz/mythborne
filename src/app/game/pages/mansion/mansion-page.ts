import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MansionPageFacade } from '../../../core/services/buildings/mansion-page.facade';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-mansion-page',
  standalone: true,
  imports: [ButtonModule, RouterLink, LoadingOverlay],
  providers: [MansionPageFacade],
  templateUrl: './mansion-page.html',
})
export class MansionPage implements OnInit {
  readonly page = inject(MansionPageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}
