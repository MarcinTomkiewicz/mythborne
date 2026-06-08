import { Component, computed, inject } from '@angular/core';
import {
  ExplorationResultNarrativeSnapshotV1,
} from '../../../core/domain/exploration/exploration-result-copy.model';
import {
  canRenderExplorationEffectSupplement,
  canRenderExplorationRewardSupplement,
  isEncounterCombatResultKind,
  isTrialResultKind,
} from '../../../core/utils/exploration-result-kind';
import { RichText } from '../../../shared/rich-text/rich-text';
import { ResultOutcomeStrip } from '../result-outcome-strip/result-outcome-strip';
import { ExplorationStepState } from '../../pages/exploration/exploration-step.state';
import {
  explorationStepEncounterCombatHandoffNarrativeSnapshot,
  explorationStepResultNarrativeSnapshot,
  explorationStepTrialManifestationNarrativeSnapshot,
} from '../../pages/exploration/exploration-step-result-ui';

@Component({
  selector: 'app-exploration-step-handoff-card',
  standalone: true,
  imports: [
    ResultOutcomeStrip,
    RichText,
  ],
  templateUrl: './exploration-step-handoff-card.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationStepHandoffCard {
  private readonly step = inject(ExplorationStepState);

  readonly currentStepResult = computed(() => this.step.currentStepResult());
  readonly trialManifestationNarrative = computed(() =>
    explorationStepTrialManifestationNarrativeSnapshot(this.currentStepResult()),
  );
  readonly encounterCombatHandoffNarrative = computed(() =>
    explorationStepEncounterCombatHandoffNarrativeSnapshot(this.currentStepResult()),
  );
  readonly resultNarrative = computed(() =>
    explorationStepResultNarrativeSnapshot(this.currentStepResult()),
  );
  readonly missingResultNarrative = computed(() =>
    Boolean(this.currentStepResult() && !this.resultNarrative()),
  );
  readonly missingTrialManifestationNarrative = computed(() => {
    const narrative = this.resultNarrative();

    return Boolean(
      narrative &&
      isTrialResultKind(narrative) &&
      !this.trialManifestationNarrative(),
    );
  });
  readonly missingEncounterCombatHandoffNarrative = computed(() => {
    const narrative = this.resultNarrative();

    return Boolean(
      narrative &&
      isEncounterCombatResultKind(narrative) &&
      !this.encounterCombatHandoffNarrative(),
    );
  });
  readonly rewardRichText = computed(() => {
    const narrative = this.resultNarrative();
    const rewardRichText = narrative?.rewardRichText ?? null;

    return narrative && canRenderExplorationRewardSupplement(narrative) && rewardRichText?.length
      ? rewardRichText
      : null;
  });
  readonly effectRichText = computed(() => {
    const narrative = this.resultNarrative();
    const effectRichText = narrative?.effectRichText ?? null;

    return narrative && canRenderExplorationEffectSupplement(narrative) && effectRichText?.length
      ? effectRichText
      : null;
  });

  showsOutcomeStrip(result: ExplorationResultNarrativeSnapshotV1): boolean {
    return isTrialResultKind(result) || isEncounterCombatResultKind(result);
  }
}
