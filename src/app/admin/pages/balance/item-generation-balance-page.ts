import { Component, OnInit, inject } from '@angular/core';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';
import { ItemGenerationFormulaBalanceFacade } from '../../../core/services/items/item-generation-formula-balance.facade';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { BucketProfileBalanceSection } from '../../components/balance/bucket-profile-balance-section';
import { FormulaAssignmentBalanceSection } from '../../components/balance/formula-assignment-balance-section';
import { FormulaLibraryBalanceSection } from '../../components/balance/formula-library-balance-section';
import { QualityBalanceSection } from '../../components/balance/quality-balance-section';
import { BALANCE_PAGE_LINKS } from '../../admin-navigation.config';

@Component({
  selector: 'app-item-generation-balance-page',
  standalone: true,
  imports: [
    LoadingOverlay,
    AdminTagLinks,
    QualityBalanceSection,
    BucketProfileBalanceSection,
    FormulaAssignmentBalanceSection,
    FormulaLibraryBalanceSection,
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
