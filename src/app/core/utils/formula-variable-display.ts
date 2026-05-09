import { FormulaTarget } from '../domain/formula/formula.model';

const VARIABLE_LABELS = new Map<string, string>([
  ['luck', 'Luck value'],
  ['luckValue', 'Luck value'],
  ['luckInfluence', 'Luck influence'],
  ['testedStatValue', 'Tested stat value'],
  ['trialPower', 'Trial Power'],
  ['attackerLuck', 'Attacker Luck'],
  ['defenderLuck', 'Defender Luck'],
  ['attackerLuckInfluence', 'Attacker Luck influence'],
  ['defenderLuckInfluence', 'Defender Luck influence'],
]);

const VARIABLE_HELP = new Map<string, string>([
  [
    'luck',
    'Raw Luck input. This DB contract key is not the same as formula-derived Luck influence.',
  ],
  [
    'luckValue',
    'Raw Luck input. This is not the same as formula-derived Luck influence.',
  ],
  [
    'luckInfluence',
    'Formula-derived Luck contribution. Do not treat it as raw Luck or a 1:1 Luck value.',
  ],
  [
    'testedStatValue',
    'The tested stat value before Luck influence is added.',
  ],
  [
    'trialPower',
    'Effective Trial Power: tested stat value plus formula-derived Luck influence.',
  ],
  ['attackerLuck', 'Raw Luck value for the attacking combat participant.'],
  ['defenderLuck', 'Raw Luck value for the defending combat participant.'],
  [
    'attackerLuckInfluence',
    'Formula-derived Luck contribution for the attacking combat participant.',
  ],
  [
    'defenderLuckInfluence',
    'Formula-derived Luck contribution for the defending combat participant.',
  ],
]);

const LUCK_VARIABLE_KEYS = new Set([
  'luck',
  'luckValue',
  'luckInfluence',
  'trialPower',
  'attackerLuck',
  'defenderLuck',
  'attackerLuckInfluence',
  'defenderLuckInfluence',
]);

export function formulaVariableLabel(variableKey: string): string {
  return VARIABLE_LABELS.get(variableKey) ?? variableKey;
}

export function formulaVariableDisplayText(variableKey: string): string {
  const label = formulaVariableLabel(variableKey);
  return label === variableKey ? variableKey : `${label} (${variableKey})`;
}

export function formulaVariableFallbackHelp(variableKey: string): string | null {
  return VARIABLE_HELP.get(variableKey) ?? null;
}

export function formulaVariableHelpText(input: {
  variableKey: string;
  metadataHelp?: string | null;
  targetKey?: string | null;
}): string {
  return input.metadataHelp ??
    formulaVariableFallbackHelp(input.variableKey) ??
    (
      input.targetKey
        ? `Technical formula variable: ${input.variableKey}. Available in ${input.targetKey}.`
        : `Technical formula variable: ${input.variableKey}.`
    );
}

export function isLuckFormulaVariable(variableKey: string): boolean {
  return LUCK_VARIABLE_KEYS.has(variableKey) || variableKey.toLowerCase().includes('luck');
}

export function isLuckFormulaTarget(
  target: Pick<FormulaTarget, 'key' | 'allowedVariables'>,
): boolean {
  return target.key.toLowerCase().includes('luck') ||
    target.key.toLowerCase().includes('trial_power') ||
    target.allowedVariables.some((variable) => isLuckFormulaVariable(variable));
}
