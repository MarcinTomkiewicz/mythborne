import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MinigameHost } from '../../components/minigame-host/minigame-host';
import {
  MINIGAME_KEY,
  MINIGAME_SOURCE_ENTITY_TYPE,
  MinigameCompletionEvent,
  MinigameSourceRef,
} from '../../components/minigame-host/minigame-host.model';
import { trimToNull } from '../../../core/utils/normalize-text';

@Component({
  selector: 'app-combat-page',
  standalone: true,
  imports: [
    ButtonModule,
    MinigameHost,
    RouterLink,
  ],
  templateUrl: './combat-page.html',
  host: { class: 'd-contents min-w-0' },
})
export class CombatPage {
  private readonly route = inject(ActivatedRoute);
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

  acceptCompletion(event: MinigameCompletionEvent): void {
    this.completion.set(event);
  }
}
