import { ExplorationDefinitionReadinessReadModel } from '../domain/exploration/exploration-readiness.model';

type ReadinessSeverity = 'success' | 'secondary' | 'warn';

export function explorationReadinessStatusLabel(
  readiness: ExplorationDefinitionReadinessReadModel | null,
): string {
  if (!readiness) {
    return 'Readiness not reported by DB';
  }

  if (readiness.statusKey === 'ready') {
    return 'Runtime-ready';
  }

  return readiness.statusKey === 'inactive' ? 'Inactive' : 'Incomplete';
}

export function explorationReadinessSeverity(
  readiness: ExplorationDefinitionReadinessReadModel | null,
): ReadinessSeverity {
  if (!readiness || readiness.statusKey === 'inactive') {
    return 'secondary';
  }

  return readiness.statusKey === 'ready' ? 'success' : 'warn';
}

export function explorationReadinessSummary(
  readiness: ExplorationDefinitionReadinessReadModel | null,
  definitionNoun: 'Trial' | 'Encounter',
): string {
  if (!readiness) {
    return `The readiness RPC did not return a row for this ${definitionNoun}.`;
  }

  if (readiness.statusKey === 'ready') {
    return `This ${definitionNoun} is complete and eligible for normal runtime selection.`;
  }

  if (readiness.statusKey === 'inactive') {
    return `This ${definitionNoun} is inactive and is not selected by normal runtime.`;
  }

  return `This ${definitionNoun} is incomplete and is not selected by normal runtime until blocking reasons are resolved.`;
}

export function explorationReadinessReasonLabels(
  readiness: ExplorationDefinitionReadinessReadModel | null,
): string[] {
  return (readiness?.reasons ?? []).map((reason) =>
    [
      reason.label ?? reason.key,
      reason.description,
      reason.isBlocking === true ? 'blocking' : null,
    ]
      .filter(Boolean)
      .join(' - '),
  );
}
