import {
  toUpsertCombatOpponentAttackSourceRpcArgs,
  toUpsertCombatOpponentDefinitionRpcArgs,
  toUpsertCombatOpponentEquipmentEntryRpcArgs,
  toUpsertCombatOpponentFamilyRpcArgs,
  toUpsertCombatOpponentStatValueRpcArgs,
} from './combat-opponent-admin-rpc';

describe('combat opponent admin RPC mappers', () => {
  it('maps family and definition drafts to canonical RPC args with trimmed optional text', () => {
    expect(toUpsertCombatOpponentFamilyRpcArgs({
      key: ' beasts ',
      label: ' Beasts ',
      description: ' predators ',
      helperText: null,
      adminDescription: ' balance pool ',
      sortOrder: 10,
      isActive: true,
      reason: ' Balance pass. ',
    })).toEqual({
      p_key: 'beasts',
      p_label: 'Beasts',
      p_description: 'predators',
      p_admin_description: 'balance pool',
      p_sort_order: 10,
      p_is_active: true,
      p_reason: 'Balance pass.',
    });

    expect(toUpsertCombatOpponentDefinitionRpcArgs({
      opponentDefinitionId: 'opponent-1',
      key: 'boar',
      label: 'Boar',
      description: null,
      helperText: null,
      adminDescription: null,
      familyKey: 'beasts',
      equipmentMode: 'generated',
      defaultScalingFormulaId: 'formula-1',
      sortOrder: 20,
      isActive: true,
      reason: 'Tune.',
    })).toEqual(jasmine.objectContaining({
      p_opponent_definition_id: 'opponent-1',
      p_family_key: 'beasts',
      p_equipment_mode: 'generated',
      p_default_scaling_formula_id: 'formula-1',
      p_reason: 'Tune.',
    }));
  });

  it('allows non-negative stat baselines and validates natural attack ranges before RPC calls', () => {
    expect(toUpsertCombatOpponentStatValueRpcArgs({
      statValueId: null,
      opponentDefinitionId: 'opponent-1',
      statKey: 'strength',
      baseValue: 0,
      sortOrder: 10,
      reason: 'Baseline.',
    })).toEqual({
      p_opponent_definition_id: 'opponent-1',
      p_stat_key: 'strength',
      p_base_value: 0,
      p_sort_order: 10,
      p_reason: 'Baseline.',
    });

    expect(toUpsertCombatOpponentAttackSourceRpcArgs({
      attackSourceId: null,
      opponentDefinitionId: 'opponent-1',
      key: 'heavy_strike',
      label: 'Heavy strike',
      description: null,
      helperText: null,
      adminDescription: null,
      minOpponentLevel: null,
      maxOpponentLevel: null,
      attackCount: 1,
      minDamage: 3,
      maxDamage: 6,
      criticalChance: 5,
      criticalDamage: 150,
      sortOrder: 10,
      isActive: true,
      reason: 'Critical damage multiplier.',
    })).toEqual(jasmine.objectContaining({
      p_critical_chance: 5,
      p_critical_damage: 150,
    }));

    expect(() => toUpsertCombatOpponentAttackSourceRpcArgs({
      attackSourceId: null,
      opponentDefinitionId: 'opponent-1',
      key: 'bite',
      label: 'Bite',
      description: null,
      helperText: null,
      adminDescription: null,
      minOpponentLevel: 10,
      maxOpponentLevel: 5,
      attackCount: 1,
      minDamage: 3,
      maxDamage: 6,
      criticalChance: 5,
      criticalDamage: 50,
      sortOrder: 10,
      isActive: true,
      reason: 'Invalid.',
    })).toThrowError('max opponent level must be greater than or equal to min opponent level.');
  });

  it('keeps manual and generated equipment entries as blueprint RPC args only', () => {
    expect(toUpsertCombatOpponentEquipmentEntryRpcArgs({
      equipmentEntryId: null,
      opponentDefinitionId: 'opponent-1',
      slotKey: 'main_hand',
      entryMode: 'manual',
      manualBaseId: 'base-1',
      manualQualityKey: 'common',
      manualPrefixAffixId: null,
      manualSuffixAffixId: 'suffix-1',
      generatedBucketProfileId: null,
      generatedMaxQualityKey: null,
      minOpponentLevel: null,
      maxOpponentLevel: null,
      sortOrder: 10,
      isActive: true,
      reason: 'Manual blueprint.',
    })).toEqual(jasmine.objectContaining({
      p_slot_key: 'main_hand',
      p_entry_mode: 'manual',
      p_manual_base_id: 'base-1',
      p_manual_quality_key: 'common',
      p_manual_suffix_affix_id: 'suffix-1',
      p_reason: 'Manual blueprint.',
    }));

    expect(toUpsertCombatOpponentEquipmentEntryRpcArgs({
      equipmentEntryId: 'entry-1',
      opponentDefinitionId: 'opponent-1',
      slotKey: 'main_hand',
      entryMode: 'generated',
      manualBaseId: null,
      manualQualityKey: null,
      manualPrefixAffixId: null,
      manualSuffixAffixId: null,
      generatedBucketProfileId: 'bucket-1',
      generatedMaxQualityKey: 'rare',
      minOpponentLevel: 2,
      maxOpponentLevel: 10,
      sortOrder: 20,
      isActive: true,
      reason: 'Generated loadout.',
    })).toEqual(jasmine.objectContaining({
      p_equipment_entry_id: 'entry-1',
      p_entry_mode: 'generated',
      p_generated_bucket_profile_id: 'bucket-1',
      p_generated_max_quality_key: 'rare',
      p_min_opponent_level: 2,
      p_max_opponent_level: 10,
    }));
  });
});
