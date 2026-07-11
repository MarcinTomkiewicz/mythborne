import { Component, inject } from '@angular/core';
import { PvpActiveActionPanel } from '../../components/pvp-active-action-panel/pvp-active-action-panel';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PvpSandboxTools } from '../../components/pvp-sandbox-tools/pvp-sandbox-tools';
import { PvpCombatActionState } from './pvp-combat-action.state';
import { PvpSandboxToolState } from '../../features/pvp/state/pvp-sandbox-tool.state';

@Component({
  selector: 'app-combat-page',
  standalone: true,
  imports: [
    LoadingOverlay,
    PvpActiveActionPanel,
    PvpSandboxTools,
  ],
  providers: [PvpCombatActionState, PvpSandboxToolState],
  templateUrl: './combat-page.html',
  host: { class: 'd-contents min-w-0' },
})
export class CombatPage {
  readonly pvpAction = inject(PvpCombatActionState);

  refreshActivePvpOffer(): void {
    this.pvpAction.refresh();
  }
}
