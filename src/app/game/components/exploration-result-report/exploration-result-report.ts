import { Component, computed, inject } from '@angular/core';
import { GAME_COPY_DEFAULT_LOCALE } from '../../../core/constants/game-copy.const';
import { MANUAL_TRIAL_COPY_KIND } from '../../../core/constants/manual-trial.const';
import type { GameCopyEditTarget } from '../../../core/domain/game-copy/game-copy-edit.model';
import { GameCopyEditableText } from '../../../shared/game-copy-editable-text/game-copy-editable-text';
import { ExplorationManualTrialCopyState } from '../../pages/exploration/exploration-manual-trial-copy.state';
import { ExplorationManualTrialReportState } from '../../pages/exploration/exploration-manual-trial-report.state';
import { ExplorationManualTrialRuntimeError } from '../../pages/exploration/exploration-manual-trial-runtime-error';
import { ExplorationMinigameHandoffState } from '../../pages/exploration/exploration-minigame-handoff.state';
import { ExplorationRewardState } from '../../pages/exploration/exploration-reward.state';
import { ExplorationSandboxToolState } from '../../pages/exploration/exploration-sandbox-tool.state';
import { ExplorationReportResultContent } from '../exploration-report-result-content/exploration-report-result-content';

@Component({
  selector: 'app-exploration-result-report',
  standalone: true,
  imports: [
    ExplorationReportResultContent,
    ExplorationManualTrialRuntimeError,
    GameCopyEditableText,
  ],
  templateUrl: './exploration-result-report.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationResultReport {
  private readonly manualTrialCopy = inject(ExplorationManualTrialCopyState);
  private readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  private readonly sandbox = inject(ExplorationSandboxToolState);
  readonly manualTrialReport = inject(ExplorationManualTrialReportState);
  readonly reward = inject(ExplorationRewardState);

  readonly currentChallengeResult = computed(() =>
    this.sandbox.sandboxChallengeResult(),
  );
  readonly minigameReportPointer = computed(() =>
    this.minigameHandoff.currentMinigameReportPointer(),
  );
  readonly minigameCompletion = computed(() =>
    this.minigameHandoff.currentMinigameCompletion(),
  );
  readonly completionResultProjection = computed(() => {
    const completion = this.minigameCompletion();
    const copy = this.manualTrialCopy.copy();

    if (completion?.sourceKind !== 'trial') {
      return null;
    }

    if (!copy) {
      return {
        presentation: null,
        missingCopyPath: MANUAL_TRIAL_COPY_KIND,
      };
    }

    const source = completion.presentationSource;
    const failureReason = source?.kind === 'manual_trial' && source.failureReasonKey
      ? copy.failureReasons[source.failureReasonKey]
      : null;

    if (source?.kind === 'manual_trial' && source.failureReasonKey && !failureReason) {
      return {
        presentation: null,
        missingCopyPath:
          `${MANUAL_TRIAL_COPY_KIND}.failureReasons.${source.failureReasonKey}.label`,
      };
    }

    return {
      presentation: {
        title: {
          text: copy.result.title,
          copyEditTarget: {
            gameCopyKind: MANUAL_TRIAL_COPY_KIND,
            copyPath: 'result.title',
            locale: GAME_COPY_DEFAULT_LOCALE,
          } satisfies GameCopyEditTarget,
        },
        details: source?.kind === 'manual_trial'
          && source.failureReasonKey
          && failureReason
          ? [
              {
                text: failureReason.label,
                copyEditTarget: {
                  gameCopyKind: MANUAL_TRIAL_COPY_KIND,
                  copyPath: `failureReasons.${source.failureReasonKey}.label`,
                  locale: GAME_COPY_DEFAULT_LOCALE,
                } satisfies GameCopyEditTarget,
              },
              {
                text: failureReason.helper,
                copyEditTarget: {
                  gameCopyKind: MANUAL_TRIAL_COPY_KIND,
                  copyPath: `failureReasons.${source.failureReasonKey}.helper`,
                  locale: GAME_COPY_DEFAULT_LOCALE,
                } satisfies GameCopyEditTarget,
              },
            ]
          : [],
      },
      missingCopyPath: null,
    };
  });
  readonly reportId = computed(() =>
    this.minigameReportPointer()?.reportId
    ?? this.currentChallengeResult()?.gameReportId
    ?? null,
  );
}
