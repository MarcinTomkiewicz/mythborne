import { Component, effect, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { DataRowList } from '../../components/data-row-list/data-row-list';
import { PvpActiveActionPanel } from '../../components/pvp-active-action-panel/pvp-active-action-panel';
import { PvpRankingTargetPanel } from '../../components/pvp-ranking/target-panel/pvp-ranking-target-panel';
import type {
  DataRow,
  DataRowActionKind,
} from '../../../core/types/data-row.types';
import { PVP_ACTIVE_ACTION_COPY } from '../../../core/configs/pvp-active-action-ui.config';
import { PvpActionRunner } from '../../../core/services/pvp/pvp-action-runner';
import { PvpActiveActionNavigationState } from '../../features/pvp/state/pvp-active-action-navigation.state';
import { PvpActiveActionState } from '../../features/pvp/state/pvp-active-action.state';
import { PvpSpyReportState } from '../../features/pvp/state/pvp-spy-report.state';
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
    PvpActiveActionPanel,
    PvpRankingTargetPanel,
    ReactiveFormsModule,
    SelectModule,
    DataRowList,
  ],
  providers: [
    PvpActionRunner,
    PvpActiveActionState,
    PvpActiveActionNavigationState,
    PvpSpyReportState,
    PvpRankingActionsState,
    PvpRankingPageState,
  ],
  templateUrl: './pvp-ranking-page.html',
})
export class PvpRankingPage implements OnInit {
  private readonly pvpActiveActionNavigation = inject(PvpActiveActionNavigationState);

  readonly pvpActiveActionCopy = PVP_ACTIVE_ACTION_COPY;
  readonly activePvpAction = inject(PvpActiveActionState);
  readonly actions = inject(PvpRankingActionsState);
  readonly spyReport = inject(PvpSpyReportState);
  readonly state = inject(PvpRankingPageState);

  constructor() {
    effect(() => {
      const copy = this.state.copy();

      this.activePvpAction.setCopy(this.pvpActiveActionCopy.state);
      this.activePvpAction.setGenericErrorLabel(copy
        ? `${copy.feedback.searchFailed.summary}. ${copy.feedback.searchFailed.detail}`
        : null);
    });

    void this.pvpActiveActionNavigation;
  }

  ngOnInit(): void {
    this.state.loadInitial();
    this.activePvpAction.load();
  }

  startAction(row: DataRow, actionKind: DataRowActionKind): void {
    this.actions.startAction(
      row,
      actionKind,
      this.state.copy(),
      (result) => this.activePvpAction.loadAfterStart(result),
      () => this.state.reloadCurrentContext(),
    );
  }
}
