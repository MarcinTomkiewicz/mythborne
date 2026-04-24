import { Component, OnInit, inject } from '@angular/core';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';
import { ItemGenerationFormulaBalanceFacade } from '../../../core/services/items/item-generation-formula-balance.facade';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { AdminTagLinksComponent } from '../../components/admin-tag-links/admin-tag-links';
import { BucketProfileBalanceSectionComponent } from '../../components/balance/bucket-profile-balance-section';
import { FormulaAssignmentBalanceSectionComponent } from '../../components/balance/formula-assignment-balance-section';
import { FormulaLibraryBalanceSectionComponent } from '../../components/balance/formula-library-balance-section';
import { QualityBalanceSectionComponent } from '../../components/balance/quality-balance-section';
import { BALANCE_PAGE_LINKS } from '../../admin-navigation.config';

@Component({
  selector: 'app-item-generation-balance-page',
  standalone: true,
  imports: [
    LoadingOverlay,
    AdminTagLinksComponent,
    QualityBalanceSectionComponent,
    BucketProfileBalanceSectionComponent,
    FormulaAssignmentBalanceSectionComponent,
    FormulaLibraryBalanceSectionComponent,
  ],
  providers: [ItemGenerationFormulaBalanceFacade, ItemGenerationBalancePageFacade],
  templateUrl: './item-generation-balance-page.html',
})
export class ItemGenerationBalancePage implements OnInit {
  readonly page = inject(ItemGenerationBalancePageFacade);
  readonly links = BALANCE_PAGE_LINKS;

  ngOnInit(): void {
    this.page.loadData();
  }
}
