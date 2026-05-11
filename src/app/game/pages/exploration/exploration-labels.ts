import { HeroExplorationStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';
import { humanizeKey } from '../../../core/utils/normalize-text';

export interface ExplorationActiveEffectDisplay {
  title: string;
  summary: string;
  warning: string | null;
  facts: Array<{ label: string; value: string }>;
}

export function explorationCurrentNodeLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const node = state?.currentNode;
  return node?.label ?? node?.id ?? 'No current node';
}

export function explorationActiveStepLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const step = state?.activeStep;

  if (!step) {
    return 'No active movement step.';
  }

  return `${step.stepKind} - ${step.status} - resolves at ${step.resolvesAt}`;
}

export function explorationActiveChallengeLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const challenge = state?.activeChallenge;

  if (!challenge) {
    return 'No active challenge.';
  }

  return `${challenge.challengeKind} - ${challenge.status}`;
}

export function explorationActiveEffectLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const display = explorationActiveEffectDisplay(state);

  if (!display) {
    return 'No active exploration effect.';
  }

  return `${display.title}. ${display.summary}`;
}

export function explorationActiveEffectDisplay(
  state: HeroExplorationStateReadModel | null,
): ExplorationActiveEffectDisplay | null {
  const effect = state?.activeEffect;

  if (!effect) {
    return null;
  }

  const status = effect.isActive ? 'active' : 'inactive';
  const metadata = jsonRecord(effect.metadataJson);
  const dbLabel = optionalText(read(
    metadata,
    'effectLabel',
    'effect_label',
    'label',
    'title',
    'name',
  ));
  const dbSummary = optionalText(read(
    metadata,
    'summary',
    'description',
    'helperText',
    'helper_text',
  ));
  const kindLabel = `${humanizeKey(effect.effectKind, 'Effect')} effect`;

  return {
    title: dbLabel ?? `${kindLabel} ${status}`,
    summary: dbSummary ?? 'Szczegóły efektu są niedostępne w kanonicznym read modelu DB.',
    warning: dbLabel ? null : 'Brak szczegółów efektu w kanonicznym read modelu DB.',
    facts: [
      { label: 'Kind', value: kindLabel },
      { label: 'Status', value: status },
      { label: 'Source', value: humanizeKey(effect.sourceKind, 'source') },
      { label: 'Applied', value: effect.appliedAt },
    ],
  };
}
