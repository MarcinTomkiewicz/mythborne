import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { GameServerKind } from '../../../core/enums/active-server.enum';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ExplorationActiveChallengeReport } from '../../components/exploration-active-challenge-report/exploration-active-challenge-report';
import { ExplorationCombatResultReport } from '../../components/exploration-combat-result-report/exploration-combat-result-report';
import { ExplorationSandboxTools } from '../../components/exploration-sandbox-tools/exploration-sandbox-tools';
import { ExplorationStepHandoffCard } from '../../components/exploration-step-handoff-card/exploration-step-handoff-card';
import { ExplorationDirectionBoard } from './exploration-direction-board';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationMovementState } from './exploration-movement.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationSelectionDiagnosticsCard } from './exploration-selection-diagnostics-card';
import { ExplorationStepState } from './exploration-step.state';
import { PendingTimerOracle } from '../../../shared/pending-timer-oracle/pending-timer-oracle';

@Component({
  selector: 'app-exploration-status-section',
  standalone: true,
  imports: [
    ButtonModule,
    ExplorationActiveChallengeReport,
    ExplorationCombatResultReport,
    ExplorationDirectionBoard,
    ExplorationSandboxTools,
    ExplorationSelectionDiagnosticsCard,
    ExplorationStepHandoffCard,
    PendingTimerOracle,
  ],
  templateUrl: './exploration-status-section.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationStatusSection {
  private readonly activeServer = inject(ActiveServer);
  readonly challenge = inject(ExplorationChallengeState);
  readonly movement = inject(ExplorationMovementState);
  readonly overview = inject(ExplorationOverviewState);
  readonly page = inject(ExplorationPageState);
  readonly step = inject(ExplorationStepState);
  readonly canShowDirectionBoard = computed(() => {
    const state = this.overview.state();

    return Boolean(
      state?.hasExploration
      && state.exploration
      && !state.activeStep
      && !state.activeChallenge
      && this.movement.movementBlockReason() === null,
    );
  });
  readonly canShowSelectionDiagnostics = computed(() => {
    const server = this.activeServer.selectedServer();
    const access = this.activeServer.access();

    return server?.kind === GameServerKind.Sandbox && access.canAccessSandbox;
  });
  readonly canShowSandboxChallengeTools = computed(() =>
    this.canShowSelectionDiagnostics()
    && this.challenge.canShowManualResolveActions()
    && Boolean(this.challenge.activeChallenge()),
  );
}
