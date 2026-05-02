import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { COMBAT_BALANCE_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { CombatBalancePageState } from './combat-balance-page.state';

@Component({
  selector: 'app-combat-balance-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    AdminTagLinks,
    LoadingOverlay,
  ],
  providers: [CombatBalancePageState],
  templateUrl: './combat-balance-page.html',
})
export class CombatBalancePage implements OnInit {
  readonly page = inject(CombatBalancePageState);
  readonly links = COMBAT_BALANCE_PAGE_LINKS;

  ngOnInit(): void {
    this.page.load();
  }
}
