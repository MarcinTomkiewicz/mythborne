import { GetHeroItemRequirementStatusRpcRow } from '../types/item-equipment-rpc.types';
import { mapItemRequirementPreview } from './item-requirement-mappers';

describe('mapItemRequirementPreview', () => {
  it('maps DB-resolved requirement status rows without local stat comparison', () => {
    const preview = mapItemRequirementPreview({
      row: requirementStatusRpcRow(),
    });

    expect(preview.meetsRequirements).toBeFalse();
    expect(preview.effectiveRequirements.map((row) => ({
      key: row.requirementDefinitionKey,
      label: row.displayLabel,
      value: row.displayValue,
      current: row.currentValueLabel,
      isMet: row.isMet,
    }))).toEqual([
      { key: 'hero_level', label: 'Hero level', value: 'Level 5', current: 'Level 7', isMet: true },
      { key: 'hero_stat', label: 'Dexterity', value: '6', current: '4', isMet: false },
    ]);
    expect(preview.components).toEqual([]);
  });

  it('uses the required stat label instead of the technical hero_stat requirement key', () => {
    const preview = mapItemRequirementPreview({
      row: {
        ...requirementStatusRpcRow(),
        requirements_json: [{
          requirementDefinitionKey: 'hero_stat',
          requiredStatKey: 'dexterity',
          requiredValue: 6,
          requiredValueLabel: '6',
          currentValue: 4,
          currentValueLabel: '4',
          isMet: false,
        }],
      },
    });

    expect(preview.effectiveRequirements[0]?.displayLabel).toBe('Dexterity');
  });

  it('uses DB-provided stat label before humanizing the required stat key', () => {
    const preview = mapItemRequirementPreview({
      row: {
        ...requirementStatusRpcRow(),
        requirements_json: [{
          requirementDefinitionKey: 'hero_stat',
          requiredStatKey: 'dexterity',
          requiredStatLabel: 'Dexterity rating',
          requiredValue: 6,
          isMet: true,
        }],
      },
    });

    expect(preview.effectiveRequirements[0]?.displayLabel).toBe('Dexterity rating');
  });

  it('uses DB requirement/display label before shorter stat labels or technical keys', () => {
    const preview = mapItemRequirementPreview({
      row: {
        ...requirementStatusRpcRow(),
        requirements_json: [
          {
            requirementDefinitionKey: 'hero_stat',
            requiredStatKey: 'dexterity',
            requiredStatLabel: 'Dexterity',
            requirementLabel: 'Dexterity requirement',
            requiredValue: 6,
            isMet: true,
          },
          {
            requirementDefinitionKey: 'hero_stat',
            requiredStatKey: 'dexterity',
            requiredStatLabel: 'Dexterity',
            displayLabel: 'Required dexterity',
            requiredValue: 6,
            isMet: true,
          },
          {
            requirementDefinitionKey: 'hero_level',
            requiredStatKey: 'hero_level',
            label: 'Required hero level',
            requiredValue: 5,
            isMet: true,
          },
        ],
      },
    });

    expect(preview.effectiveRequirements.map((requirement) => requirement.displayLabel))
      .toEqual(['Dexterity requirement', 'Required dexterity', 'Required hero level']);
  });
});

function requirementStatusRpcRow(): GetHeroItemRequirementStatusRpcRow {
  return {
    check_json: {},
    failures_json: [{
      requirementDefinitionKey: 'hero_stat',
      requiredStatKey: 'dexterity',
    }],
    generated_at: '2026-05-16T10:00:00Z',
    hero_id: 'hero-1',
    item_id: 'item-1',
    item_status: 'active',
    item_name: 'Demonic Dagger',
    meets_requirements: false,
    requirement_count: 2,
    requirements_json: [{
      requirementDefinitionKey: 'hero_level',
      displayLabel: 'Hero level',
      requiredStatKey: null,
      requiredValue: 5,
      displayValue: 'Level 5',
      currentValue: 7,
      currentValueLabel: 'Level 7',
      isMet: true,
    }, {
      requirementDefinitionKey: 'hero_stat',
      label: 'Dexterity',
      requiredStatKey: 'dexterity',
      requiredValue: 6,
      requiredValueLabel: '6',
      currentValue: 4,
      currentValueLabel: '4',
      isMet: false,
      missingValue: 2,
      failureReasonKey: 'stat_too_low',
      failureReasonLabel: 'Dexterity too low',
    }],
    server_id: 'server-1',
    unmet_count: 1,
  };
}
