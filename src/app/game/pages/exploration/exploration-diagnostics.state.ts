import { Injectable, computed, inject } from '@angular/core';
import { EXPLORATION_RUNTIME_COPY } from '../../../core/constants/exploration-runtime-copy.const';
import { ExplorationStepSelectionDiagnosticReadModel } from '../../../core/domain/exploration/exploration-readiness.model';
import { ExplorationDiagnosticRow } from '../../../core/types/exploration-runtime-context.types';
import { humanizeKey } from '../../../core/utils/normalize-text';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationSandboxToolState } from './exploration-sandbox-tool.state';
import { ExplorationStepState } from './exploration-step.state';

@Injectable()
export class ExplorationDiagnosticsState {
  private readonly challenge = inject(ExplorationChallengeState);
  private readonly sandbox = inject(ExplorationSandboxToolState);
  private readonly step = inject(ExplorationStepState);
  readonly copy = EXPLORATION_RUNTIME_COPY;

  readonly stepSelectionDiagnostic = computed(() =>
    this.sandbox.canShowSelectionDiagnostics()
      ? this.step.currentStepResult()?.selectionDiagnostic ?? null
      : null,
  );
  readonly canShowResolvedDiagnostics = computed(() =>
    Boolean(
      this.step.currentStepResult()
      || this.sandbox.sandboxChallengeResult()
      || this.challenge.activeChallenge()
    ),
  );
  readonly canShowDiagnosticsSection = computed(() =>
    this.sandbox.canShowSandboxTools()
    || (
      this.canShowResolvedDiagnostics()
      && this.sandbox.canShowSelectionDiagnostics()
    ),
  );

  diagnosticOutcomeLabel(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string {
    return humanizeKey(diagnostic.finalOutcomeKind, EXPLORATION_RUNTIME_COPY.unknownLabel);
  }

  diagnosticSelectionReason(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string {
    if (diagnostic.forcedOverrideId) {
      return EXPLORATION_RUNTIME_COPY.sandboxOverrideDiagnostic;
    }

    if (diagnostic.readinessGuarded) {
      return EXPLORATION_RUNTIME_COPY.readinessFilteringDiagnostic;
    }

    return EXPLORATION_RUNTIME_COPY.runtimeSelectionDiagnostic;
  }

  diagnosticDefinitionLabel(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string {
    const selected = diagnostic.selectedDefinition;

    if (!selected) {
      return EXPLORATION_RUNTIME_COPY.noDefinitionSelected;
    }

    const kind = selected.encounterKind
      ? `${humanizeKey(
          selected.encounterKind,
          EXPLORATION_RUNTIME_COPY.unknownLabel,
        )} ${EXPLORATION_RUNTIME_COPY.encounterDefinitionSuffix}`
      : humanizeKey(selected.definitionKind, EXPLORATION_RUNTIME_COPY.unknownLabel);

    return `${kind}: ${selected.definitionKey}`;
  }

  diagnosticSkippedLabel(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string | null {
    const skipped = diagnostic.skippedDefinition;

    if (!skipped) {
      return null;
    }

    const definition = skipped.definitionKey
      ?? skipped.definitionId
      ?? EXPLORATION_RUNTIME_COPY.unknownDefinition;
    const reason = skipped.reasonKey ?? EXPLORATION_RUNTIME_COPY.unspecifiedReason;

    return `${humanizeKey(
      skipped.definitionKind,
      EXPLORATION_RUNTIME_COPY.unknownLabel,
    )} ${definition} ${EXPLORATION_RUNTIME_COPY.skippedDefinitionInfix} ${reason}`;
  }

  diagnosticReasonLabels(
    diagnostic: ExplorationStepSelectionDiagnosticReadModel,
  ): string[] {
    return [
      ...(diagnostic.selectedDefinition?.readinessReasons ?? []),
      ...(diagnostic.skippedDefinition?.readinessReasons ?? []),
    ].map((reason) =>
      [
        reason.label ?? reason.key,
        reason.description,
        reason.isBlocking === true
          ? EXPLORATION_RUNTIME_COPY.blockingDiagnosticLabel
          : null,
      ]
        .filter(Boolean)
        .join(EXPLORATION_RUNTIME_COPY.diagnosticReasonSeparator),
    );
  }

  stepBackendDiagnostics(): ExplorationDiagnosticRow[] {
    const result = this.step.currentStepResult();

    if (!result) {
      return [];
    }

    return [
      {
        label: EXPLORATION_RUNTIME_COPY.stepDiagnosticRpcLabel,
        value: EXPLORATION_RUNTIME_COPY.stepResolutionRpcName,
      },
      {
        label: EXPLORATION_RUNTIME_COPY.stepDiagnosticArgsLabel,
        value: JSON.stringify({ p_step_id: result.stepId }),
      },
      {
        label: EXPLORATION_RUNTIME_COPY.stepDiagnosticMappedResultLabel,
        value: JSON.stringify(result),
      },
    ];
  }
}
