import { GetHeroArmoryItemDetailRpcRow } from '../types/item-equipment-rpc.types';
import { mapArmoryItemDetail } from './item-detail-mappers';

describe('mapArmoryItemDetail', () => {
  it('uses hardened final stats and modifier rows for player-facing detail', () => {
    const detail = mapArmoryItemDetail(demonicDaggerRow());

    expect(detail.itemStats).toEqual([{
      label: 'Damage',
      displayValue: '2-9',
    }]);
    expect(detail.baseTypeKey).toBe('one_handed_weapon');
    expect(detail.drachmaValue).toBe(300);
    expect(detail.bonuses.map((bonus) => ({
      label: bonus.label,
      value: bonus.displayValue,
    }))).toEqual([
      { label: 'Critical chance', value: '+2%' },
    ]);
    expect(JSON.stringify(detail.bonuses)).not.toContain('Minimum damage');
    expect(JSON.stringify(detail.bonuses)).not.toContain('Maximum damage');
    expect(JSON.stringify(detail.bonuses)).not.toContain('Attack count');
    expect(JSON.stringify(detail.bonuses)).not.toContain('Flat');
  });

  it('does not render consumed itemStats modifiers as player-facing bonuses', () => {
    const detail = mapArmoryItemDetail(demonicDaggerRow({
      bonuses_json: {
        itemStats: {
          rows: [{
            key: 'damage',
            label: 'Damage',
            displayValue: '2-9',
          }],
          bonusRows: [{
            label: 'Max Damage Flat',
            targetKey: 'max_damage',
            displayValue: '+4',
            numericValue: 4,
          }],
          consumedModifierRows: [{
            label: 'Max Damage Flat',
            targetKey: 'max_damage',
            displayValue: '+4',
            numericValue: 4,
          }],
        },
        modifierRows: [{
          statKey: 'critical_chance',
          label: 'Critical Chance Flat',
          value: 2,
          displayValue: '+2%',
          sortOrder: 20,
        }],
      },
    }));

    expect(detail.itemStats).toEqual([{
      label: 'Damage',
      displayValue: '2-9',
    }]);
    expect(detail.bonuses.map((bonus) => ({
      label: bonus.label,
      value: bonus.displayValue,
    }))).toEqual([
      { label: 'Critical chance', value: '+2%' },
    ]);
  });

  it('uses modifierRows for the player-facing Bonuses section', () => {
    const detail = mapArmoryItemDetail(demonicDaggerRow({
      bonuses_json: {
        itemStats: {
          rows: [{
            key: 'damage',
            label: 'Damage',
            displayValue: '2-9',
          }],
          bonusRows: [],
        },
        modifierRows: [{
          statKey: 'max_damage',
          label: 'Max Damage Flat',
          value: 4,
          displayValue: '+4',
          sortOrder: 10,
        }, {
          statKey: 'critical_chance',
          label: 'Critical Chance Flat',
          value: 2,
          displayValue: '+2%',
          sortOrder: 20,
        }, {
          statKey: 'critical_damage',
          label: 'Critical Damage Flat',
          value: 0,
          displayValue: '0',
          sortOrder: 30,
        }],
      },
    }));

    expect(detail.itemStats).toEqual([{
      label: 'Damage',
      displayValue: '2-9',
    }]);
    expect(detail.bonuses.map((bonus) => ({
      label: bonus.label,
      value: bonus.displayValue,
    }))).toEqual([
      { label: 'Maximum damage', value: '+4' },
      { label: 'Critical chance', value: '+2%' },
    ]);
    expect(JSON.stringify(detail.bonuses)).not.toContain('Critical damage');
  });
});

function demonicDaggerRow(
  overrides: Partial<GetHeroArmoryItemDetailRpcRow> = {},
): GetHeroArmoryItemDetailRpcRow {
  return {
    armory_shelf_position: 1,
    bonuses_json: {
      itemStats: {
        rows: [{
          key: 'damage',
          label: 'Damage',
          displayValue: '2-9',
          sortOrder: 10,
        }],
        bonusRows: [
          row('Max Damage Flat', '+4', 'modifier_bonus', 'bonuses', 4, 10),
          row('Critical Chance Flat', '+2%', 'modifier_bonus', 'bonuses', 2, 20),
          row('Critical Damage Flat', '0', 'modifier_bonus', 'bonuses', 0, 30),
        ],
        consumedModifierRows: [
          row('Max Damage Flat', '+4', 'modifier_bonus', 'bonuses', 4, 10),
        ],
        hiddenNativeRows: [
          row('Attack count', '1', 'native_stat', 'item_stats', 1, 30),
        ],
      },
      nativeRows: [
        row('Minimum damage', '2', 'native_stat', 'item_stats', 2, 10),
        row('Maximum damage', '5', 'native_stat', 'item_stats', 5, 20),
        row('Attack count', '1', 'native_stat', 'item_stats', 1, 30),
      ],
      modifierRows: [
        row('Critical Chance Flat', '+2%', 'modifier_bonus', 'bonuses', 2, 20),
        row('Critical Damage Flat', '0', 'modifier_bonus', 'bonuses', 0, 30),
      ],
      rows: [
        row('Minimum damage', '2', 'native_stat', 'item_stats', 2, 10),
        row('Max Damage Flat', '+4', 'modifier_bonus', 'bonuses', 4, 20),
      ],
    },
    created_at: '2026-05-07T10:00:00Z',
    drachma_value: 300,
    generated_at: '2026-05-07T10:00:00Z',
    generation_base_id: 'base-1',
    generation_quality_key: 'normal',
    hero_id: 'fca4ecdd-a9d4-4488-97e9-877901403b94',
    base_key: 'dagger',
    base_name: 'Dagger',
    base_type_key: 'one_handed_weapon',
    item_id: 'bf9b8156-e62d-41be-a977-542d54d72534',
    item_name: 'Demonic Dagger',
    item_status: 'active',
    prefix_affix_id: 'prefix-1',
    prefix_key: 'demonic',
    prefix_name: 'Demonic',
    quality_multiplier: 1,
    server_id: '8c587756-0155-4d8f-aae9-7282695713e0',
    shelf_name: 'Vlad\'s items',
    suffix_affix_id: '',
    suffix_key: '',
    suffix_name: '',
    visibility_index: 1,
    visibility_limit: 30,
    ...overrides,
  };
}

function row(
  label: string,
  displayValue: string,
  rowKind: string,
  displaySection: string,
  numericValue: number,
  sortOrder: number,
) {
  return {
    label,
    targetKey: label.toLowerCase().replace(/\s+flat$/i, '').replace(/\s+/g, '_'),
    targetLabel: label,
    rowKind,
    displaySection,
    numericValue,
    displayValue,
    sortOrder,
    sourceKey: rowKind === 'native_stat' ? 'dagger' : 'demonic',
    sourceLabel: rowKind === 'native_stat' ? 'Dagger' : 'Demonic',
  };
}
