import { Component, computed, inject, signal } from '@angular/core';
import { PvpActiveActionPanel } from '../../components/pvp-active-action-panel/pvp-active-action-panel';
import { MinigameHost } from '../../components/minigame-host/minigame-host';
import {
  MINIGAME_KEY,
  MinigameCompletionEvent,
} from '../../components/minigame-host/minigame-host.model';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ReportDetailPreviewCard } from '../../components/report-detail-preview-card/report-detail-preview-card';
import { PvpCombatActionState } from './pvp-combat-action.state';

@Component({
  selector: 'app-combat-page',
  standalone: true,
  imports: [
    LoadingOverlay,
    MinigameHost,
    PvpActiveActionPanel,
    ReportDetailPreviewCard,
  ],
  providers: [PvpCombatActionState],
  templateUrl: './combat-page.html',
  host: { class: 'd-contents min-w-0' },
})
export class CombatPage {
  readonly pvpAction = inject(PvpCombatActionState);

  readonly minigameKey = MINIGAME_KEY.combat;
  readonly completion = signal<MinigameCompletionEvent | null>(null);
  readonly currentCompletion = computed(() => {
    const completion = this.completion();
    const source = this.pvpAction.combatSourceRef();

    return completion && source && completion.sourceEntityId === source.sourceEntityId
      ? completion
      : null;
  });

  acceptCompletion(event: MinigameCompletionEvent): void {
    this.completion.set(event);
    console.info('[PvPReportHandoff]', {
      sourceComponent: 'CombatPage',
      selectedRenderBranch: 'completion.accepted',
      activeOfferId: event.sourceEntityId,
      pvpActionId: event.sourceEntityId,
      pvpAttackResultId: event.resultId ?? null,
      combatResultId: null,
      gameReportId: event.reportId ?? null,
      reportId: event.reportId ?? null,
      publicToken: null,
      selectedCta: event.reportId ? 'directReport' : null,
      selectedPath: event.reportId ? `/game/reports/${event.reportId}` : null,
      detailReportExists: null,
      pvpResultExists: null,
    });
    this.pvpAction.refresh();
  }

  refreshActivePvpOffer(): void {
    this.pvpAction.refresh();
  }

}
