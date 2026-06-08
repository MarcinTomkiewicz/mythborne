import { Component, computed, inject } from '@angular/core';
import {
  ExplorationResultNarrativeSnapshotV1,
  ExplorationRichTextTone,
} from '../../../core/domain/exploration/exploration-result-copy.model';
import { RichText } from '../../../shared/rich-text/rich-text';
import { ExplorationStepState } from '../../pages/exploration/exploration-step.state';
import { explorationStepResultNarrativeSnapshot } from '../../pages/exploration/exploration-step-result-ui';

@Component({
  selector: 'app-exploration-step-handoff-card',
  standalone: true,
  imports: [
    RichText,
  ],
  templateUrl: './exploration-step-handoff-card.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationStepHandoffCard {
  private readonly step = inject(ExplorationStepState);

  readonly resultNarrative = computed(() =>
    explorationStepResultNarrativeSnapshot(this.step.currentStepResult()),
  );
  readonly rewardRichText = computed(() => {
    const narrative = this.resultNarrative();
    const rewardRichText = narrative?.rewardRichText ?? null;

    return narrative?.resultKind === 'trial_resolved_success' && rewardRichText?.length
      ? rewardRichText
      : null;
  });

  isTitleTone(
    narrative: ExplorationResultNarrativeSnapshotV1,
    tone: ExplorationRichTextTone,
  ): boolean {
    return narrative.titleTone === tone;
  }
}
