import { Component, computed, inject, signal } from '@angular/core';
import { PvpActiveActionPanel } from '../../components/pvp-active-action-panel/pvp-active-action-panel';
import { MinigameHost } from '../../components/minigame-host/minigame-host';
import {
  MINIGAME_KEY,
  MinigameCompletionEvent,
} from '../../components/minigame-host/minigame-host.model';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { ReportDetailPreviewCard } from '../../components/report-detail-preview-card/report-detail-preview-card';
import { PvpSandboxTools } from '../../components/pvp-sandbox-tools/pvp-sandbox-tools';
import { PvpCombatActionState } from './pvp-combat-action.state';
import { PvpSandboxToolState } from '../../features/pvp/state/pvp-sandbox-tool.state';

@Component({
  selector: 'app-combat-page',
  standalone: true,
  imports: [
    LoadingOverlay,
    MinigameHost,
    PvpActiveActionPanel,
    PvpSandboxTools,
    ReportDetailPreviewCard,
  ],
  providers: [PvpCombatActionState, PvpSandboxToolState],
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
    if (!event.reportId) {
      return;
    }

    this.completion.set(event);
    this.pvpAction.refresh();
  }

  refreshActivePvpOffer(): void {
    this.pvpAction.refresh();
  }

}
