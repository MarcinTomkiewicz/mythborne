import { REQUIREMENT_VALUE_TYPES } from '../constants/requirement.const';
import { BuildingRequirementDraft } from '../domain/building/building.model';
import {
  toCreateManagedEntityRequirementRpcArgs,
  toCreateEntityRequirementRpcArgs,
  toGetEntityRequirementImpactPreviewRpcArgs,
  toUpdateEntityRequirementRpcArgs,
} from './building-requirement-rpc.mappers';

describe('building requirement rpc mappers', () => {
  it('maps hero level central requirement create args', () => {
    expect(
      toCreateEntityRequirementRpcArgs(
        'building-1',
        {
          ...createRequirementDraft('hero_level'),
          requiredValueInteger: 12,
        },
        REQUIREMENT_VALUE_TYPES.Integer,
      ),
    ).toEqual(
      jasmine.objectContaining({
        p_entity_type: 'building_definition',
        p_entity_id: 'building-1',
        p_requirement_definition_key: 'hero_level',
        p_required_value_integer: 12,
      }),
    );
  });

  it('maps item generation base central requirement create args through governed RPC contract', () => {
    expect(
      toCreateManagedEntityRequirementRpcArgs(
        'item_generation_base',
        'base-1',
        {
          ...createRequirementDraft('hero_level'),
          requiredValueInteger: 10,
        },
        REQUIREMENT_VALUE_TYPES.Integer,
      ),
    ).toEqual(
      jasmine.objectContaining({
        p_entity_type: 'item_generation_base',
        p_entity_id: 'base-1',
        p_requirement_definition_key: 'hero_level',
        p_required_value_integer: 10,
      }),
    );
  });

  it('maps item generation affix preview args without using item or bonus tables', () => {
    expect(
      toGetEntityRequirementImpactPreviewRpcArgs('item_generation_affix', 'affix-1'),
    ).toEqual({
      p_entity_type: 'item_generation_affix',
      p_entity_id: 'affix-1',
    });
  });

  it('maps prestige rank central requirement create args', () => {
    expect(
      toCreateEntityRequirementRpcArgs(
        'building-1',
        {
          ...createRequirementDraft('prestige_rank'),
          requiredValueInteger: 3,
        },
        REQUIREMENT_VALUE_TYPES.Integer,
      ),
    ).toEqual(jasmine.objectContaining({ p_required_value_integer: 3 }));
  });

  it('maps hero stat central requirement create args', () => {
    expect(
      toCreateEntityRequirementRpcArgs(
        'building-1',
        {
          ...createRequirementDraft('hero_stat'),
          requiredStatKey: 'dexterity',
          requiredValueInteger: 20,
        },
        REQUIREMENT_VALUE_TYPES.StatKey,
      ),
    ).toEqual(
      jasmine.objectContaining({
        p_required_stat_key: 'dexterity',
        p_required_value_integer: 20,
      }),
    );
  });

  it('maps building level central requirement create args', () => {
    expect(
      toCreateEntityRequirementRpcArgs(
        'building-1',
        {
          ...createRequirementDraft('building_level'),
          requiredBuildingKey: 'market',
          requiredValueInteger: 5,
        },
        REQUIREMENT_VALUE_TYPES.BuildingKey,
      ),
    ).toEqual(
      jasmine.objectContaining({
        p_required_building_key: 'market',
        p_required_value_integer: 5,
      }),
    );
  });

  it('maps resource amount central requirement create args', () => {
    expect(
      toCreateEntityRequirementRpcArgs(
        'building-1',
        {
          ...createRequirementDraft('resource_amount'),
          requiredResourceType: 'materials',
          requiredValueDecimal: 150.5,
          requiredValueInteger: 999,
          requiredValueBoolean: false,
        },
        REQUIREMENT_VALUE_TYPES.ResourceType,
      ),
    ).toEqual(
      jasmine.objectContaining({
        p_required_resource_type: 'materials',
        p_required_value_decimal: 150.5,
      }),
    );
  });

  it('maps district access central requirement create args without unrelated values', () => {
    const args = toCreateEntityRequirementRpcArgs(
      'building-1',
      {
        ...createRequirementDraft('district_access'),
        requiredDistrictCode: 'B',
        requiredValueInteger: 0,
        requiredValueBoolean: false,
      },
      REQUIREMENT_VALUE_TYPES.DistrictCode,
    );

    expect(args).toEqual(jasmine.objectContaining({ p_required_district_code: 'B' }));
    expect(args as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        p_required_value_integer: jasmine.any(Number),
        p_required_value_boolean: jasmine.any(Boolean),
      }),
    );
  });

  it('maps trade routes access central requirement update args without unrelated values', () => {
    const args = toUpdateEntityRequirementRpcArgs(
      {
        ...createRequirementDraft('trade_routes_access'),
        id: 'requirement-1',
        requiredValueBoolean: true,
        requiredValueInteger: 0,
        requiredValueText: 'ignored',
      },
      REQUIREMENT_VALUE_TYPES.Boolean,
    );

    expect(args).toEqual(
      jasmine.objectContaining({
        p_requirement_id: 'requirement-1',
        p_requirement_definition_key: 'trade_routes_access',
        p_is_active: true,
        p_required_value_boolean: true,
      }),
    );
    expect(args as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        p_required_value_integer: jasmine.any(Number),
        p_required_value_text: jasmine.any(String),
      }),
    );
  });

  it('does not include unrelated technical preview values in resource amount args', () => {
    const args = toCreateEntityRequirementRpcArgs(
      'building-1',
      {
        ...createRequirementDraft('resource_amount'),
        requiredResourceType: 'materials',
        requiredValueDecimal: 150.5,
        requiredDistrictCode: 'B',
        requiredStatKey: 'dexterity',
        requiredValueBoolean: false,
        requiredValueInteger: 0,
        requiredValueText: 'ignored',
      },
      REQUIREMENT_VALUE_TYPES.ResourceType,
    );

    expect(args).toEqual(
      jasmine.objectContaining({
        p_required_resource_type: 'materials',
        p_required_value_decimal: 150.5,
      }),
    );
    expect(args as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        p_required_district_code: jasmine.any(String),
        p_required_stat_key: jasmine.any(String),
        p_required_value_boolean: jasmine.any(Boolean),
        p_required_value_integer: jasmine.any(Number),
        p_required_value_text: jasmine.any(String),
      }),
    );
  });
});

function createRequirementDraft(
  requirementDefinitionKey: string,
): BuildingRequirementDraft {
  return {
    id: null,
    requirementDefinitionKey,
    appliesFromLevel: 1,
    description: '',
    reason: 'Admin update.',
    sortOrder: 10,
    requiredBuildingKey: null,
    requiredDistrictCode: null,
    requiredResourceType: null,
    requiredStatKey: null,
    requiredValueBoolean: null,
    requiredValueDecimal: null,
    requiredValueInteger: null,
    requiredValueText: null,
  };
}
