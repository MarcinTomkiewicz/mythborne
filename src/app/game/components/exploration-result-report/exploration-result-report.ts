import { Component, computed, inject } from '@angular/core';
import { ExplorationMinigameHandoffState } from '../../pages/exploration/exploration-minigame-handoff.state';
import { ExplorationSandboxToolState } from '../../pages/exploration/exploration-sandbox-tool.state';
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
  private readonly sandbox = inject(ExplorationSandboxToolState);

  readonly currentChallengeResult = computed(() =>
    this.sandbox.sandboxChallengeResult(),
  );
  readonly minigameReportPointer = computed(() =>
    this.minigameHandoff.currentMinigameReportPointer(),
  );
  readonly reportId = computed(() => requiredResultReportId(
    this.minigameReportPointer()?.reportId ??
    this.currentChallengeResult()?.gameReportId ??
    null,
  ));
}

function requiredResultReportId(reportId: string | null | undefined): string {
  if (!reportId) {
    throw new Error(
      'ExplorationResultReport requires a canonical report id from game_report_id.',
    );
  }

  return reportId;
}
