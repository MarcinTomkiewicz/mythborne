import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';
import { ItemGenerationFormulaBalanceFacade } from '../../../core/services/items/item-generation-formula-balance.facade';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';

@Component({
  selector: 'app-item-generation-balance-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, LoadingOverlay],
  providers: [ItemGenerationFormulaBalanceFacade, ItemGenerationBalancePageFacade],
  templateUrl: './item-generation-balance-page.html',
})
export class ItemGenerationBalancePage implements OnInit {
  readonly page = inject(ItemGenerationBalancePageFacade);

  ngOnInit(): void {
    this.page.loadData();
  }
}
