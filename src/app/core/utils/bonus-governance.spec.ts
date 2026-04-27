import {
  mapCanonicalBonusTemplate,
  mapResolvedBonus,
  projectQualityScaledValue,
  toBonusTemplateAdminView,
  toSemanticBonusTemplatePayload,
} from './bonus-governance';
import {
  CanonicalBonusTemplateRow,
  CanonicalEntityBonusWithTemplateRow,
} from '../types/bonus-governance.types';
import { toSnakeCase } from './type-mappings';

describe('bonus governance mappers', () => {
  it('maps a canonical bonus template from semantic columns only', () => {
    const template = mapCanonicalBonusTemplate(createTemplateRow());

    expect(template.id).toBe('template-1');
    expect(template.key).toBe('hero-strength-flat');
    expect(template.label).toBe('Hero strength flat');
    expect(template.typeKey).toBe('flat');
    expect(template.targetKey).toBe('strength');
    expect(template.scopeKey).toBe('global');
    expect(JSON.stringify(template.paramsJson)).toBe('{"source":"seed"}');
    expect(template.sortOrder).toBe(10);
    expect(template.isActive).toBeTrue();
  });

  it('does not fall back to legacy template target/type columns', () => {
    const row = createTemplateRow({
      target_key: null,
      type_key: null,
      target: 'legacy_target',
      type: 'percent',
    });

    expect(() => mapCanonicalBonusTemplate(row)).toThrowError(
      'bonus_templates.type_key is required for canonical bonus row "template-1".',
    );
  });

  it('creates admin template view category from target dictionary', () => {
    const template = mapCanonicalBonusTemplate(createTemplateRow());
    const view = toBonusTemplateAdminView(
      template,
      new Map([
        [
          'strength',
          {
            id: 'target-1',
            key: 'strength',
            label: 'Strength',
            categoryKey: 'base_stats',
            valueKind: 'number',
            description: 'Strength target.',
            helperText: null,
            isStackable: true,
            sortOrder: 1,
            isActive: true,
          },
        ],
      ]),
    );

    expect(view.category).toBe('base_stats');
    expect(view.target).toBe('strength');
    expect(view.type).toBe('flat');
    expect(view.scope).toBe('global');
  });

  it('creates semantic template write payload without legacy columns', () => {
    const payload = toSemanticBonusTemplatePayload({
      id: '',
      key: 'hero-strength-scaled',
      label: 'Hero strength scaled',
      category: 'legacy-category',
      target: 'strength',
      type: 'scaled_stat_bonus',
      scope: 'combat',
      description: 'Scaled strength bonus.',
      baseValue: 123,
      levelsStep: 4,
      sourceStat: 'hero_level',
      scalingFactor: 0.25,
      sortOrder: 30,
      isActive: true,
    });

    expect(payload.key).toBe('hero-strength-scaled');
    expect(payload.label).toBe('Hero strength scaled');
    expect(payload.description).toBe('Scaled strength bonus.');
    expect(payload.typeKey).toBe('scaled_stat_bonus');
    expect(payload.targetKey).toBe('strength');
    expect(payload.scopeKey).toBe('combat');
    expect(payload.levelInterval).toBe(4);
    expect(payload.scalingStatKey).toBe('hero_level');
    expect(JSON.stringify(payload.paramsJson)).toBe('{"scalingFactor":0.25}');
    expect(payload.sortOrder).toBe(30);
    expect(payload.isActive).toBeTrue();
    expect(Object.hasOwn(payload, 'category')).toBeFalse();
    expect(Object.hasOwn(payload, 'target')).toBeFalse();
    expect(Object.hasOwn(payload, 'type')).toBeFalse();
    expect(Object.hasOwn(payload, 'scope')).toBeFalse();
    expect(Object.hasOwn(payload, 'formulaId')).toBeFalse();
    expect(Object.hasOwn(payload, 'formulaTargetId')).toBeFalse();
    expect(Object.hasOwn(payload, 'baseValue')).toBeFalse();
    expect(Object.hasOwn(payload, 'levelsStep')).toBeFalse();
    expect(Object.hasOwn(payload, 'sourceStat')).toBeFalse();
    expect(Object.hasOwn(payload, 'scalingFactor')).toBeFalse();
  });

  it('serializes semantic template payload to database snake_case columns', () => {
    const payload = toSemanticBonusTemplatePayload({
      id: '',
      key: 'hero-strength-flat',
      label: 'Hero strength flat',
      category: 'legacy-category',
      target: 'strength',
      type: 'flat',
      scope: 'global',
      description: '',
      baseValue: 0,
      levelsStep: null,
      sourceStat: null,
      scalingFactor: null,
      sortOrder: 10,
      isActive: true,
    });
    const databasePayload = toSnakeCase<Record<string, unknown>>(payload);

    expect(databasePayload['type_key']).toBe('flat');
    expect(databasePayload['target_key']).toBe('strength');
    expect(databasePayload['scope_key']).toBe('global');
    expect(databasePayload['level_interval']).toBeNull();
    expect(JSON.stringify(databasePayload['params_json'])).toBe('{}');
    expect(databasePayload['is_active']).toBeTrue();
    expect(Object.hasOwn(databasePayload, 'typeKey')).toBeFalse();
    expect(Object.hasOwn(databasePayload, 'targetKey')).toBeFalse();
    expect(Object.hasOwn(databasePayload, 'scopeKey')).toBeFalse();
  });

  it('maps a resolved entity bonus with override fields', () => {
    const resolved = mapResolvedBonus(
      createEntityBonusRow({
        value: 7.5,
        scope_key_override: 'combat',
        level_interval_override: 3,
        formula_id_override: 'formula-override',
        params_json: { quality: 'raw' },
      }),
    );

    expect(resolved.entityType).toBe('item_generation_base');
    expect(resolved.entityId).toBe('base-1');
    expect(resolved.templateKey).toBe('hero-strength-flat');
    expect(resolved.targetKey).toBe('strength');
    expect(resolved.typeKey).toBe('flat');
    expect(resolved.scopeKey).toBe('combat');
    expect(resolved.value).toBe(7.5);
    expect(resolved.levelInterval).toBe(3);
    expect(resolved.formulaId).toBe('formula-override');
    expect(JSON.stringify(resolved.paramsJson)).toBe('{"source":"seed","quality":"raw"}');
    expect(resolved.qualityScalesValue).toBeTrue();
    expect(resolved.qualityScalesLevelInterval).toBeFalse();
    expect(resolved.isActive).toBeTrue();
  });

  it('scales only value in quality projection helper', () => {
    expect(projectQualityScaledValue({ value: 4, qualityScalesValue: true }, 1.5)).toBe(6);
    expect(projectQualityScaledValue({ value: 4, qualityScalesValue: false }, 1.5)).toBe(4);
  });

  it('rejects unsupported entity bonus types', () => {
    expect(() =>
      mapResolvedBonus(createEntityBonusRow({ entity_type: 'legacy_table' })),
    ).toThrowError('Unsupported bonus entity type "legacy_table".');
  });
});

function createTemplateRow(
  overrides: Partial<CanonicalBonusTemplateRow> = {},
): CanonicalBonusTemplateRow {
  return {
    id: 'template-1',
    key: 'hero-strength-flat',
    label: 'Hero strength flat',
    description: 'Flat strength bonus.',
    type_key: 'flat',
    target_key: 'strength',
    scope_key: 'global',
    level_interval: null,
    formula_id: null,
    formula_target_id: null,
    scaling_stat_key: null,
    params_json: { source: 'seed' },
    sort_order: 10,
    is_active: true,
    target: 'legacy-target',
    type: 'flat',
    updated_at: '2026-04-27T00:00:00.000Z',
    ...overrides,
  };
}

function createEntityBonusRow(
  overrides: Partial<CanonicalEntityBonusWithTemplateRow> = {},
): CanonicalEntityBonusWithTemplateRow {
  return {
    id: 'entity-bonus-1',
    entity_type: 'item_generation_base',
    entity_id: 'base-1',
    bonus_template_id: 'template-1',
    value: 5,
    description: null,
    level_interval_override: null,
    formula_id_override: null,
    formula_target_id_override: null,
    scaling_stat_key_override: null,
    scope_key_override: null,
    quality_scales_value: true,
    quality_scales_level_interval: false,
    params_json: {},
    sort_order: 20,
    is_active: true,
    legacy_source_id: null,
    legacy_source_table: null,
    created_at: '2026-04-27T00:00:00.000Z',
    updated_at: '2026-04-27T00:00:00.000Z',
    bonus_templates: createTemplateRow(),
    ...overrides,
  };
}
