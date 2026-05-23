import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { GameServerKind } from '../../../core/enums/active-server.enum';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ExplorationSandboxTools } from '../../components/exploration-sandbox-tools/exploration-sandbox-tools';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationSelectionDiagnosticsCard } from './exploration-selection-diagnostics-card';
import { ExplorationStepState } from './exploration-step.state';

@Component({
  selector: 'app-exploration-runtime-diagnostics-section',
  standalone: true,
  imports: [ButtonModule, ExplorationSandboxTools, ExplorationSelectionDiagnosticsCard],
  templateUrl: './exploration-runtime-diagnostics-section.html',
  host: { class: 'd-contents' },
})
export class ExplorationRuntimeDiagnosticsSection {
  private readonly activeServer = inject(ActiveServer);
  readonly challenge = inject(ExplorationChallengeState);
  readonly page = inject(ExplorationPageState);
  readonly step = inject(ExplorationStepState);
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
  readonly canShowResolvedDiagnostics = computed(() =>
    Boolean(
      this.step.currentStepResult()
      || this.challenge.currentChallengeResult()
      || this.challenge.activeChallenge()
      || this.challenge.completedCombatLiveState()
    ),
  );
  readonly canShowDiagnosticsSection = computed(() =>
    this.page.canShowSandboxTools()
    || (this.canShowResolvedDiagnostics() && this.canShowSelectionDiagnostics()),
  );
}
