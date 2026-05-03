import { BONUS_ENTITY_TYPES } from '../constants/bonus-entity-types.const';
import { DerivedStatKey } from '../enums/derived-stat.enum';
import { IHeroStats } from '../interfaces/hero/i-hero-stats';
import { Row } from '../types/supabase.types';
import { EntityBonusWithTemplateRow } from '../types/hero-derived-stats.types';
import {
  mapEntityBonus,
  resolveAdditiveDerivedStats,
  resolveEffectiveBaseStatsForDerived,
} from './hero-derived-stats';

describe('hero derived stats bonus mapper', () => {
  it('maps active entity bonus from semantic bonus template columns', () => {
    const bonus = mapEntityBonus(createEntityBonusRow());

    expect(bonus).toEqual({
      target: 'critical_chance',
      value: 6,
      type: 'scaled_stat_bonus',
      scope: 'combat',
      levelsStep: 4,
      sourceStat: 'cunning',
      scalingFactor: 0.25,
    });
  });

  it('returns null for inactive joined templates', () => {
    const bonus = mapEntityBonus(
      createEntityBonusRow({
        bonus_templates: createTemplateRow({ is_active: false }),
      }),
    );

    expect(bonus).toBeNull();
  });

  it('fails instead of falling back to legacy bonus template target/type columns', () => {
    expect(() =>
      mapEntityBonus(
        createEntityBonusRow({
          bonus_templates: createTemplateRow({
            target_key: null as unknown as string,
            type_key: null as unknown as string,
          }),
        }),
      ),
    ).toThrowError('bonus_templates.type_key is required for canonical bonus row "template-1".');
  });

  it('derives defense from final base stats after active base stat bonuses', () => {
    const baseStats = createBaseStats({ endurance: 10 });
    const bonuses = [
      {
        target: 'endurance',
        value: 5,
        type: 'flat',
        scope: 'global',
        levelsStep: null,
        sourceStat: null,
        scalingFactor: null,
      },
    ] as const;
    const effectiveBaseStats = resolveEffectiveBaseStatsForDerived(
      baseStats,
      [...bonuses],
      1,
      'global',
    );
    const derived = resolveAdditiveDerivedStats(
      effectiveBaseStats,
      [createDerivedDefinitionRow()],
      [...bonuses],
      1,
    );

    expect(effectiveBaseStats.endurance).toBe(15);
    expect(derived[DerivedStatKey.Defense]).toBe(15);
  });

  it('does not count base stat bonuses twice when a derived definition points at the base stat target', () => {
    const baseStats = createBaseStats({ endurance: 10 });
    const bonuses = [
      {
        target: 'endurance',
        value: 5,
        type: 'flat',
        scope: 'global',
        levelsStep: null,
        sourceStat: null,
        scalingFactor: null,
      },
    ] as const;
    const effectiveBaseStats = resolveEffectiveBaseStatsForDerived(
      baseStats,
      [...bonuses],
      1,
      'global',
    );
    const derived = resolveAdditiveDerivedStats(
      effectiveBaseStats,
      [createDerivedDefinitionRow({ bonus_target_key: 'endurance' })],
      [...bonuses],
      1,
    );

    expect(effectiveBaseStats.endurance).toBe(15);
    expect(derived[DerivedStatKey.Defense]).toBe(15);
  });

  it('uses base critical damage percent plus active critical damage bonuses', () => {
    const baseStats = createBaseStats();
    const bonuses = [
      {
        target: DerivedStatKey.CriticalDamage,
        value: 25,
        type: 'flat',
        scope: 'combat',
        levelsStep: null,
        sourceStat: null,
        scalingFactor: null,
      },
    ] as const;
    const derived = resolveAdditiveDerivedStats(
      baseStats,
      [createDerivedDefinitionRow({
        key: DerivedStatKey.CriticalDamage,
        base_stat_key: null,
        bonus_target_key: DerivedStatKey.CriticalDamage,
      })],
      [...bonuses],
      1,
    );

    expect(derived[DerivedStatKey.CriticalDamage]).toBe(75);
  });

  it('does not add a base stat value to critical damage percent', () => {
    const baseStats = createBaseStats({ cunning: 40 });
    const derived = resolveAdditiveDerivedStats(
      baseStats,
      [createDerivedDefinitionRow({
        key: DerivedStatKey.CriticalDamage,
        base_stat_key: 'cunning',
        bonus_target_key: DerivedStatKey.CriticalDamage,
      })],
      [],
      1,
    );

    expect(derived[DerivedStatKey.CriticalDamage]).toBe(50);
  });
});

function createEntityBonusRow(
  overrides: Partial<EntityBonusWithTemplateRow> = {},
): EntityBonusWithTemplateRow {
  return {
    id: 'entity-bonus-1',
    entity_type: BONUS_ENTITY_TYPES.Hero,
    entity_id: 'hero-1',
    bonus_template_id: 'template-1',
    value: 6,
    description: null,
    level_interval_override: null,
    formula_id_override: null,
    formula_target_id_override: null,
    legacy_source_id: null,
    legacy_source_table: null,
    scaling_stat_key_override: null,
    scope_key_override: 'combat',
    quality_scales_value: false,
    quality_scales_level_interval: false,
    params_json: { scalingFactor: 0.25 },
    sort_order: 10,
    is_active: true,
    created_at: '2026-04-27T00:00:00.000Z',
    updated_at: '2026-04-27T00:00:00.000Z',
    bonus_templates: createTemplateRow(),
    ...overrides,
  };
}

function createTemplateRow(
  overrides: Partial<Row<'bonus_templates'>> = {},
): Row<'bonus_templates'> {
  return {
    id: 'template-1',
    key: 'critical-training',
    label: 'Critical training',
    description: 'Critical chance from equipment.',
    type_key: 'scaled_stat_bonus',
    target_key: 'critical_chance',
    scope_key: 'global',
    level_interval: 4,
    formula_id: null,
    formula_target_id: null,
    scaling_stat_key: 'cunning',
    params_json: { scalingFactor: 0.1 },
    sort_order: 1,
    is_active: true,
    updated_at: '2026-04-27T00:00:00.000Z',
    target: 'legacy-critical',
    type: 'flat',
    ...overrides,
  };
}

function createBaseStats(overrides: Partial<IHeroStats> = {}): IHeroStats {
  return {
    strength: 10,
    dexterity: 10,
    endurance: 10,
    agility: 10,
    cunning: 10,
    charisma: 10,
    wisdom: 10,
    intelligence: 10,
    spirituality: 10,
    ...overrides,
  };
}

function createDerivedDefinitionRow(
  overrides: Partial<Row<'derived_stat_definitions'>> = {},
): Row<'derived_stat_definitions'> {
  return {
    id: 'definition-defense',
    key: DerivedStatKey.Defense,
    label: 'Defense',
    description: 'Defense from final endurance.',
    admin_description: null,
    base_source: 'base_stat',
    base_stat_key: 'endurance',
    bonus_target_key: 'defense',
    secondary_bonus_target_key: null,
    calculation_kind: 'additive',
    formula_target_key: null,
    helper_text: null,
    is_active: true,
    is_combat_stat: true,
    max_related_stat_key: null,
    min_related_stat_key: null,
    min_value: 0,
    sort_order: 1,
    updated_at: '2026-04-27T00:00:00.000Z',
    value_kind: 'number',
    created_at: '2026-04-27T00:00:00.000Z',
    ...overrides,
  };
}
