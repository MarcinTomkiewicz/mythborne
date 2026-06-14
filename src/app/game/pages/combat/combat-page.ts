import { Component, computed, inject, signal } from '@angular/core';
import { CombatReportHandoffCard } from '../../components/combat/combat-report-handoff-card';
import { PvpActiveActionPanel } from '../../components/pvp-active-action-panel/pvp-active-action-panel';
import { MinigameHost } from '../../components/minigame-host/minigame-host';
import {
  MINIGAME_KEY,
  MinigameCompletionEvent,
} from '../../components/minigame-host/minigame-host.model';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PvpCombatActionState } from './pvp-combat-action.state';

@Component({
  selector: 'app-combat-page',
  standalone: true,
  imports: [
    CombatReportHandoffCard,
    LoadingOverlay,
    MinigameHost,
    PvpActiveActionPanel,
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
    this.pvpAction.refresh();
  }

  refreshActivePvpOffer(): void {
    this.pvpAction.refresh();
  }

}
