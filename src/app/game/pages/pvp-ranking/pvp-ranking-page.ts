import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { PvpRankingTargetPanel } from '../../components/pvp-ranking/target-panel/pvp-ranking-target-panel';
import { VicinityAddressList } from '../../components/vicinity/address-list/vicinity-address-list';
import type {
  VicinityListRow,
  VicinityRowActionKind,
} from '../../../core/types/vicinity.types';
import { PvpRankingActionsState } from '../../features/pvp-ranking/state/pvp-ranking-actions.state';
import { PvpRankingPageState } from '../../features/pvp-ranking/state/pvp-ranking-page.state';

@Component({
  selector: 'app-pvp-ranking-page',
  standalone: true,
  host: {
    class: 'd-contents min-w-0',
  },
  imports: [
    ButtonModule,
    GamePageHeader,
    InputTextModule,
    PaginatorModule,
    PvpRankingTargetPanel,
    ReactiveFormsModule,
    SelectModule,
    VicinityAddressList,
  ],
  providers: [PvpRankingActionsState, PvpRankingPageState],
  templateUrl: './pvp-ranking-page.html',
})
export class PvpRankingPage implements OnInit {
  readonly actions = inject(PvpRankingActionsState);
  readonly state = inject(PvpRankingPageState);

  ngOnInit(): void {
    this.state.loadInitial();
  }

  startAction(row: VicinityListRow, actionKind: VicinityRowActionKind): void {
    this.actions.startAction(
      row,
      actionKind,
      this.state.context(),
      this.state.copy(),
      () => this.state.reloadCurrentContext(),
    );
  }
}
