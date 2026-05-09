import {
  formulaVariableDisplayText,
  formulaVariableFallbackHelp,
  formulaVariableHelpText,
  isLuckFormulaTarget,
} from './formula-variable-display';

describe('formula variable display helpers', () => {
  it('distinguishes raw Luck, Luck influence, tested stat value and Trial Power labels', () => {
    expect(formulaVariableDisplayText('luck')).toBe('Luck value (luck)');
    expect(formulaVariableDisplayText('luckValue')).toBe('Luck value (luckValue)');
    expect(formulaVariableDisplayText('luckInfluence')).toBe(
      'Luck influence (luckInfluence)',
    );
    expect(formulaVariableDisplayText('testedStatValue')).toBe(
      'Tested stat value (testedStatValue)',
    );
    expect(formulaVariableDisplayText('trialPower')).toBe('Trial Power (trialPower)');
  });

  it('provides neutral fallback help without replacing DB metadata', () => {
    expect(formulaVariableFallbackHelp('luck')).toContain('Raw Luck input');
    expect(formulaVariableFallbackHelp('luckValue')).toContain('Raw Luck input');
    expect(formulaVariableFallbackHelp('luckInfluence')?.toLowerCase()).toContain(
      'formula-derived',
    );
    expect(formulaVariableFallbackHelp('testedStatValue')).toContain('before Luck');
    expect(formulaVariableFallbackHelp('trialPower')).toContain('tested stat value plus');
    expect(formulaVariableFallbackHelp('unknownVariable')).toBeNull();
  });

  it('prefers DB metadata help over neutral fallback text', () => {
    expect(formulaVariableHelpText({
      variableKey: 'luckValue',
      metadataHelp: 'DB-owned Luck help.',
      targetKey: 'trial_power',
    })).toBe('DB-owned Luck help.');

    expect(formulaVariableHelpText({
      variableKey: 'luckValue',
      targetKey: 'trial_power',
    })).toContain('Raw Luck input');
  });

  it('detects Luck formula targets from DB target keys and allowed variables', () => {
    expect(isLuckFormulaTarget({
      key: 'trial_power',
      allowedVariables: ['testedStatValue'],
    })).toBeTrue();
    expect(isLuckFormulaTarget({
      key: 'combat_critical_chance',
      allowedVariables: ['attackerLuck', 'defenderLuck'],
    })).toBeTrue();
    expect(isLuckFormulaTarget({
      key: 'building_upgrade_cost',
      allowedVariables: ['currentLevel', 'targetLevel'],
    })).toBeFalse();
  });
});
