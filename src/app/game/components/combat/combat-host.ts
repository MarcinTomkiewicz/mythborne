import { Component, effect, inject, input, output } from '@angular/core';
import { MinigameCompletionEvent, MinigameSourceRef } from '../minigame-host/minigame-host.model';
import { CombatStage } from './combat-stage';
import { CombatHostState } from './combat-host.state';

@Component({
  selector: 'app-combat-host',
  standalone: true,
  imports: [CombatStage],
  providers: [CombatHostState],
  template: `
    <section class="flex-col gap-sm w-100">
      @if (flow.previewErrorMessage(); as message) {
        <p class="warn-text text-md lh-16 m-0">{{ message }}</p>
      } @else {
        @if (flow.actionErrorMessage(); as message) {
          <p class="warn-text text-md lh-16 m-0">{{ message }}</p>
        }
        @if (flow.stage(); as stageView) {
          <app-combat-stage
            [stage]="stageView"
            (action)="handleStageAction($event)"
            (timingStrike)="flow.submitCombatStrike()"
          />
        }
      }
    </section>
  `,
  host: { class: 'd-block w-100' },
})
export class CombatHost {
  readonly flow = inject(CombatHostState);
  readonly sourceRef = input.required<MinigameSourceRef>();
  readonly contextTitle = input.required<string>();
  readonly contextLabel = input('Walka');
  readonly completed = output<MinigameCompletionEvent>();

  constructor() {
    effect(() => {
      this.flow.setContext({
        sourceRef: this.sourceRef(),
        contextTitle: this.contextTitle(),
        contextLabel: this.contextLabel(),
      });
    });

    effect(() => {
      const completion = this.flow.completion();

      if (!completion) {
        return;
      }
      this.completed.emit(completion);
      this.flow.clearCompletion();
    });
  }

  handleStageAction(actionId: string): void {
    if (actionId === 'start-combat') {
      this.flow.startManualCombat();
      return;
    }

    if (actionId === 'auto-resolve') {
      this.flow.autoResolveCombat();
    }
  }
}
