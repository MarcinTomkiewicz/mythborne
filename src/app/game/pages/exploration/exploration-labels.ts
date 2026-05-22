import { ExplorationActiveEffectDisplay } from '../../../core/interfaces/exploration/active-effect-display.interface';
import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import { HeroExplorationStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';
import { humanizeKey } from '../../../core/utils/normalize-text';

export function explorationCurrentNodeLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const node = state?.currentNode;
  return node?.label ?? 'Aktualny punkt jest niedostępny';
}

export function explorationActiveStepLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const step = state?.activeStep;

  if (!step) {
    return 'Brak aktywnego ruchu.';
  }

  return `${step.stepKind} - ${step.status} - gotowe ${step.resolvesAt}`;
}

export function explorationActiveChallengeLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const challenge = state?.activeChallenge;

  if (!challenge) {
    return 'Brak aktywnego wyzwania.';
  }

  return `${challenge.challengeKind} - ${challenge.status}`;
}

export function explorationActiveEffectLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const display = explorationActiveEffectDisplay(state);

  if (!display) {
    return 'Brak aktywnego efektu eksploracji.';
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

  const status = effect.isActive ? 'aktywne' : 'nieaktywne';
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
    'playerSummary',
    'player_summary',
    'summary',
    'description',
    'helperText',
    'helper_text',
  ));
  const kindLabel = optionalText(read(metadata, 'effectKindLabel', 'effect_kind_label'))
    ?? effectKindLabel(effect.effectKind);
  const targetLabel = optionalText(read(metadata, 'effectTargetLabel', 'effect_target_label'));
  const valueDisplay = optionalText(read(metadata, 'valueDisplay', 'value_display'));
  const fallbackSummary = targetLabel && valueDisplay
    ? `${targetLabel}: ${valueDisplay}.`
    : `${kindLabel} jest ${status} w bieżącej eksploracji.`;

  return {
    title: dbLabel ?? `${kindLabel} ${status}`,
    summary: dbSummary ?? fallbackSummary,
    warning: null,
    facts: [
      { label: 'Typ', value: kindLabel },
      { label: 'Status', value: status },
      { label: 'Źródło', value: humanizeKey(effect.sourceKind, 'źródło') },
      { label: 'Nałożono', value: effect.appliedAt },
    ],
  };
}

function effectKindLabel(effectKind: string): string {
  switch (effectKind) {
    case ENCOUNTER_KIND.buff:
      return 'Wzmocnienie';
    case ENCOUNTER_KIND.debuff:
      return 'Osłabienie';
    default:
      return humanizeKey(effectKind, 'Efekt');
  }
}
