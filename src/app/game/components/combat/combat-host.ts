import { Component, effect, inject, input, output } from '@angular/core';
import {
  CombatSurfaceActionId,
  CombatSurfaceDecisionDeadline,
} from '../../../core/domain/combat/combat-display.model';
import { CombatSourcePresentation } from '../../../core/domain/combat/combat-source-presentation.model';
import { MinigameCompletionEvent, MinigameSourceRef } from '../minigame-host/minigame-host.model';
import { CombatHostPreviewLoader } from './combat-host-preview-loader';
import { CombatHostRequestRunner } from './combat-host-request-runner';
import { CombatHostSessionRunner } from './combat-host-session-runner';
import { CombatHostState } from './combat-host.state';
import { CombatHostTimingState } from './combat-host-timing.state';
import { CombatStage } from './combat-stage';

@Component({
  selector: 'app-combat-host',
  standalone: true,
  imports: [CombatStage],
  providers: [
    CombatHostState,
    CombatHostRequestRunner,
    CombatHostPreviewLoader,
    CombatHostSessionRunner,
    CombatHostTimingState,
  ],
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
            (timingStrike)="flow.submitCombatStrike($event)"
          />
        }
        @if (flow.isFinalizingResult()) {
          @if (flow.finalizingResultPanel(); as panel) {
            <section class="mg-card p-md flex-col gap-xs w-100">
              <p class="small-caps color-muted text-xs mb-0">{{ panel.title }}</p>
              <p class="color-text text-md lh-16 mb-0">{{ panel.text }}</p>
            </section>
          }
        }
        @if (flow.finalizeErrorPanel(); as panel) {
          <section class="mg-card p-md flex-col gap-xs w-100">
            <p class="small-caps color-muted text-xs mb-0">{{ panel.title }}</p>
            <p class="warn-text text-md lh-16 mb-0">{{ panel.text }}</p>
          </section>
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
  readonly sourcePresentation = input.required<CombatSourcePresentation>();
  readonly decisionDeadline = input<CombatSurfaceDecisionDeadline | null>(null);
  readonly completed = output<MinigameCompletionEvent>();

  constructor() {
    effect(() => {
      this.flow.setContext({
        sourceRef: this.sourceRef(),
        contextTitle: this.contextTitle(),
        sourcePresentation: this.sourcePresentation(),
      });
    });

    effect(() => {
      this.flow.setDecisionDeadline(this.decisionDeadline());
    });

    effect(() => {
      const completion = this.flow.completion();

      if (!completion) {
        return;
      }

      if (!completion.reportId) {
        this.flow.clearCompletion();
        return;
      }

      this.completed.emit(completion);
      this.flow.clearCompletion();
    });
  }

  handleStageAction(actionId: CombatSurfaceActionId): void {
    if (actionId === 'start-combat') {
      this.flow.startManualCombat();
      return;
    }

    if (actionId === 'auto-resolve') {
      this.flow.autoResolveCombat();
    }
  }
}
