import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { PVP_ACTIVE_ACTION_COPY } from '../../../core/configs/pvp-active-action-ui.config';
import { CombatReportHandoffCard } from '../../components/combat/combat-report-handoff-card';
import { PvpActiveActionPanel } from '../../components/pvp-active-action-panel/pvp-active-action-panel';
import { MinigameHost } from '../../components/minigame-host/minigame-host';
import {
  MINIGAME_KEY,
  MINIGAME_SOURCE_ENTITY_TYPE,
  MinigameCompletionEvent,
  MinigameSourceRef,
} from '../../components/minigame-host/minigame-host.model';
import { trimToNull } from '../../../core/utils/normalize-text';
import { CombatPvpActionState } from './combat-pvp-action.state';

@Component({
  selector: 'app-combat-page',
  standalone: true,
  imports: [
    ButtonModule,
    CombatReportHandoffCard,
    MinigameHost,
    RouterLink,
    PvpActiveActionPanel,
  ],
  providers: [CombatPvpActionState],
  templateUrl: './combat-page.html',
  host: { class: 'd-contents min-w-0' },
})
export class CombatPage {
  private readonly route = inject(ActivatedRoute);
  readonly pvpAction = inject(CombatPvpActionState);
  private readonly query = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => ({
        sourceEntityType: trimToNull(params.get('sourceEntityType')),
        sourceEntityId: trimToNull(params.get('sourceEntityId')),
      })),
    ),
    { initialValue: { sourceEntityType: null, sourceEntityId: null } },
  );

  readonly minigameKey = MINIGAME_KEY.combat;
  readonly pvpActiveActionCopy = PVP_ACTIVE_ACTION_COPY;
  readonly completion = signal<MinigameCompletionEvent | null>(null);
  readonly sourceRef = computed<MinigameSourceRef | null>(() => {
    const query = this.query();

    return query.sourceEntityType === MINIGAME_SOURCE_ENTITY_TYPE.pvpAction && query.sourceEntityId
      ? {
          sourceEntityType: MINIGAME_SOURCE_ENTITY_TYPE.pvpAction,
          sourceEntityId: query.sourceEntityId,
        }
      : null;
  });
  readonly contextTitle = computed(() =>
    this.sourceRef()?.sourceEntityType === MINIGAME_SOURCE_ENTITY_TYPE.pvpAction
      ? 'Walka PvP'
      : 'Walka',
  );

  constructor() {
    effect(() => {
      this.pvpAction.setSourceRef(this.sourceRef());
    });
  }

  acceptCompletion(event: MinigameCompletionEvent): void {
    this.completion.set(event);
    this.pvpAction.acceptCompletion(event);
  }

  refreshActivePvpOffer(): void {
    this.pvpAction.refresh();
  }
}
