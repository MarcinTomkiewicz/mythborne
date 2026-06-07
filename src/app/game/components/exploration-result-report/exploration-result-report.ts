import { Component, computed, inject } from '@angular/core';
import type { ExplorationResultSourceKind } from '../../../core/domain/exploration/exploration-result-display.model';
import type { Json } from '../../../core/types/database.types';
import {
  explorationReportRewardDisplay,
  explorationResultSourceKind,
  mapExplorationRewardText,
} from '../../../core/utils/exploration-result-display.mapper';
import { ExplorationMinigameHandoffState } from '../../pages/exploration/exploration-minigame-handoff.state';
import { ExplorationPageState } from '../../pages/exploration/exploration-page.state';
import { ExplorationRewardState } from '../../pages/exploration/exploration-reward.state';
import { ExplorationReportResultContent } from '../exploration-report-result-content/exploration-report-result-content';

@Component({
  selector: 'app-exploration-result-report',
  standalone: true,
  imports: [
    ExplorationReportResultContent,
  ],
  templateUrl: './exploration-result-report.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationResultReport {
  private readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  private readonly page = inject(ExplorationPageState);
  readonly rewardState = inject(ExplorationRewardState);

  readonly currentChallengeResult = computed(() => this.page.sandboxChallengeResult());
  readonly minigameReportPointer = computed(() =>
    this.minigameHandoff.currentMinigameReportPointer(),
  );
  readonly reportRawJson = computed(() =>
    currentChallengeResultRawJson(this.currentChallengeResult())
      ?? this.rewardState.reward()?.rawJson,
  );
  readonly resultSourceKind = computed(() =>
    this.minigameReportPointer()?.sourceKind ?? currentChallengeResultSourceKind(
      this.currentChallengeResult(),
    ),
  );
  readonly reportId = computed(() => requiredResultReportId(
    this.minigameReportPointer()?.reportId ??
    this.currentChallengeResult()?.gameReportId ??
    null,
  ));
  readonly reportRewardDisplay = computed(() =>
    explorationReportRewardDisplay(this.rewardState.rewardDisplay()),
  );
  readonly rewardText = computed(() =>
    mapExplorationRewardText({
      rewardRawJson: this.rewardState.reward()?.rawJson,
      reportRawJson: this.reportRawJson(),
      sourceKind: this.resultSourceKind(),
    }),
  );
}

function currentChallengeResultRawJson(value: unknown): Json | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as { rawJson?: Json; playerReportSummaryJson?: Json };

  return record.rawJson ?? record.playerReportSummaryJson;
}

function currentChallengeResultSourceKind(value: unknown): ExplorationResultSourceKind {
  if (!value || typeof value !== 'object') {
    return 'unknown';
  }

  const record = value as {
    trialDefinitionId?: string | null;
    encounterDefinitionId?: string | null;
  };

  return explorationResultSourceKind(record);
}

function requiredResultReportId(reportId: string | null | undefined): string {
  if (!reportId) {
    throw new Error(
      'ExplorationResultReport requires a canonical report id from game_report_id.',
    );
  }

  return reportId;
}
