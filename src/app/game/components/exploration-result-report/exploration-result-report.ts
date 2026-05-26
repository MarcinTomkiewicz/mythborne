import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../../../core/services/ui/toast';
import { absoluteBrowserUrl, copyTextToClipboard } from '../../../core/utils/browser-clipboard';
import {
  combatParticipantPair,
  mapCompletedCombatLogGroups,
  mapCompletedCombatParticipants,
} from '../../../core/utils/combat-report-display.mapper';
import { mapCompletedCombatStageView } from '../../../core/utils/combat-stage-display.mapper';
import {
  explorationReportRewardDisplay,
  explorationResultSourceKind,
  mapExplorationOutcomeView,
  mapExplorationReportActions,
  mapExplorationRewardText,
} from '../../../core/utils/exploration-result-display.mapper';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';
import { ExplorationRewardState } from '../../pages/exploration/exploration-reward.state';
import { combatActiveLogGroups } from '../../pages/exploration/exploration-live-combat-labels';
import { CombatStage } from '../combat/combat-stage';
import { ExplorationOutcomeReportLayout } from '../exploration-outcome-report-layout/exploration-outcome-report-layout';

@Component({
  selector: 'app-exploration-result-report',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    ExplorationOutcomeReportLayout,
    ItemDetailPopover,
    CombatStage,
  ],
  templateUrl: './exploration-result-report.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationResultReport {
  readonly challenge = inject(ExplorationChallengeState);
  readonly rewardState = inject(ExplorationRewardState);
  private readonly toast = inject(ToastService);
  readonly combatResultDetail = computed(() => this.challenge.combatResultDetail());
  readonly completedChallenge = computed(() => this.challenge.completedCombatChallenge());
  readonly reportSourceKind = computed(() =>
    explorationResultSourceKind(this.completedChallenge()),
  );
  readonly outcome = computed(() =>
    mapExplorationOutcomeView({
      detail: this.combatResultDetail(),
      rawJson: this.combatResultDetail()?.rawJson,
      sourceKind: this.reportSourceKind(),
    }),
  );
  readonly participantRows = computed(() =>
    mapCompletedCombatParticipants({
      detail: this.combatResultDetail(),
      liveParticipants: this.challenge.combatParticipants(),
    }),
  );
  readonly combatParticipantPair = computed(() => combatParticipantPair(this.participantRows()));
  readonly combatLogGroups = computed(() =>
    mapCompletedCombatLogGroups({
      detail: this.combatResultDetail(),
      liveEvents: this.challenge.combatEvents(),
      liveParticipants: this.challenge.combatParticipants(),
      displayParticipants: this.participantRows(),
      liveEventMapper: combatActiveLogGroups,
    }),
  );
  readonly combatStage = computed(() => {
    const pair = this.combatParticipantPair();

    return mapCompletedCombatStageView({
      ariaLabel: 'Raport walki',
      leftParticipant: pair.left,
      rightParticipant: pair.right,
      log: {
        groups: this.combatLogGroups(),
        title: 'Przebieg starcia',
        subtitle: 'Zapis walki',
        emptyText: 'Szczegółowy przebieg walki nie jest dostępny w bieżącym odczycie raportu.',
      },
      emptyParticipants: {
        leftTitle: 'Brak danych bohatera',
        leftText: 'Raport nie zawiera finalnych danych bohatera.',
        rightTitle: 'Brak danych przeciwnika',
        rightText: 'Raport nie zawiera finalnych danych przeciwnika.',
      },
    });
  });
  readonly reportActions = computed(() =>
    mapExplorationReportActions(this.combatResultDetail()?.rawJson),
  );
  readonly reportRewardDisplay = computed(() =>
    explorationReportRewardDisplay(this.rewardState.rewardDisplay()),
  );
  readonly rewardText = computed(() =>
    mapExplorationRewardText({
      rewardRawJson: this.rewardState.reward()?.rawJson,
      combatRawJson: this.combatResultDetail()?.rawJson,
      sourceKind: this.reportSourceKind(),
    }),
  );

  copyPublicReportLink(): void {
    const link = this.reportActions().publicReportPath;

    if (!link) {
      this.toast.show('error', 'Raport', 'Nie udało się skopiować linku do raportu.');
      return;
    }

    void copyTextToClipboard(absoluteBrowserUrl(link))
      .then((copied) => this.toast.show(
        copied ? 'success' : 'error',
        'Raport',
        copied
          ? 'Link do raportu został skopiowany.'
          : 'Nie udało się skopiować linku do raportu.',
      ));
  }
}
