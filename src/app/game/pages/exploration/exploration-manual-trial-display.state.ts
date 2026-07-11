import { Injectable, computed, inject } from '@angular/core';
import { MANUAL_TRIAL_COPY_KIND } from '../../../core/constants/manual-trial.const';
import {
  MINIGAME_IMPLEMENTATION_KEY,
  MINIGAME_KEY,
  MINIGAME_SOURCE_ENTITY_TYPE,
} from '../../../core/domain/minigame/minigame-completion.model';
import { ExplorationManualTrialCopyState } from './exploration-manual-trial-copy.state';
import { ExplorationManualTrialState } from './exploration-manual-trial.state';
import { ExplorationPageState } from './exploration-page.state';

@Injectable()
export class ExplorationManualTrialDisplayState {
  private readonly copyState = inject(ExplorationManualTrialCopyState);
  private readonly manualTrial = inject(ExplorationManualTrialState);
  private readonly page = inject(ExplorationPageState);

  readonly runtimeErrorPresentation = computed(() => {
    const copy = this.page.runtimeCopy();

    return copy
      ? { text: copy.feedback.genericError, locale: copy.locale }
      : null;
  });
  readonly combatPresentation = computed(() => {
    const copy = this.copyState.copy();
    const offer = this.manualTrial.offer();
    const runtimeCopy = this.page.runtimeCopy();
    const trialIdentity = offer ? copy?.trials[offer.trialKey] : null;

    if (
      !offer
      || offer.minigameKey !== MINIGAME_KEY.combat
      || offer.minigameImplementationKey !== MINIGAME_IMPLEMENTATION_KEY.combat
      || !runtimeCopy
      || !trialIdentity
    ) {
      return null;
    }

    return {
      minigameKey: offer.minigameKey,
      contextTitle: trialIdentity.label,
      sourceRef: {
        sourceEntityType: MINIGAME_SOURCE_ENTITY_TYPE.explorationChallengeAttempt,
        sourceEntityId: offer.attemptId,
      },
      sourcePresentation:
        runtimeCopy.combatSourcePresentations[
          runtimeCopy.combatSourcePresentationKeys.trial
        ],
    };
  });
  readonly offerMissingCopyPath = computed(() => {
    const copy = this.copyState.copy();
    const offer = this.manualTrial.offer();

    return copy && offer && !copy.trials[offer.trialKey]
      ? `${MANUAL_TRIAL_COPY_KIND}.trials.${offer.trialKey}.label`
      : null;
  });
  readonly rendererDiagnostic = computed(() => {
    const offer = this.manualTrial.offer();

    if (!offer || this.combatPresentation()) {
      return null;
    }

    return [
      `trialKey=${offer.trialKey}`,
      `minigameKey=${offer.minigameKey}`,
      `minigameImplementationKey=${offer.minigameImplementationKey}`,
      `sourceEntityType=${MINIGAME_SOURCE_ENTITY_TYPE.explorationChallengeAttempt}`,
      `sourceEntityId=${offer.attemptId}`,
      `renderer=${
        offer.minigameKey === MINIGAME_KEY.combat
        && offer.minigameImplementationKey === MINIGAME_IMPLEMENTATION_KEY.combat
          ? 'combat'
          : 'unsupported'
      }`,
      `combatSourcePresentation=${this.page.runtimeCopy() ? 'available' : 'missing'}`,
    ].join('; ');
  });
  readonly shouldShowUnavailable = computed(() => {
    if (this.manualTrial.verdict() || !this.manualTrial.offer()) {
      return false;
    }

    if (this.manualTrial.isInitialLoading()) {
      return false;
    }

    return Boolean(
      this.manualTrial.workflowUnavailable()
      || this.offerMissingCopyPath()
      || this.manualTrial.manifest()
      || !this.combatPresentation(),
    );
  });
}
