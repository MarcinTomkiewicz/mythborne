import {
  ConfigChangeKindKey,
  ConfigGovernanceScopeKey,
} from '../enums/config-governance.enum';
import {
  ConfigDefinition,
  ConfigDefinitionExplainabilityRow,
  CreateConfigChangeSetDraftInput,
  CreateConfigValueChangeEntryInput,
} from '../types/config-governance.types';
import {
  toCreateConfigChangeSetDraftRpcArgs,
  toCreateConfigValueChangeEntryRpcArgs,
} from './config-governance-rpc';
import { valueTargetForConfigDefinition } from './config-governance';
import { mapConfigDefinitionExplainability } from './config-governance-mappers';

describe('config governance rpc mappers', () => {
  it('maps draft creation input to audited workflow rpc args', () => {
    const input: CreateConfigChangeSetDraftInput = {
      title: 'Economy update',
      reason: 'Balance pass.',
      changelogVisibility: 'internal',
      changelogTitle: 'Economy',
      changelogBody: null,
    };

    expect(toCreateConfigChangeSetDraftRpcArgs(input)).toEqual({
      p_title: 'Economy update',
      p_reason: 'Balance pass.',
      p_changelog_visibility: 'internal',
      p_changelog_title: 'Economy',
    });
  });

  it('maps value entry input to audited workflow rpc args without direct-write fields', () => {
    const args = toCreateConfigValueChangeEntryRpcArgs({
      changeSetId: 'change-set-1',
      changeKind: ConfigChangeKindKey.ServerValueChange,
      definition: createDefinition(),
      serverId: 'server-1',
      oldValue: 10,
      newValue: 12,
      oldSource: 'global',
      oldSourceLabel: 'Global value',
    });

    expect(args as Record<string, unknown>).toEqual({
      p_change_set_id: 'change-set-1',
      p_change_kind: 'server_value_change',
      p_config_definition_id: 'definition-1',
      p_new_value_json: 12,
      p_server_id: 'server-1',
      p_metadata_json: {
        configKey: 'hero.max_level',
        valueType: 'integer',
        oldSource: 'global',
        oldSourceLabel: 'Global value',
      },
    });
  });

  it('resolves global value target only for global governance scopes', () => {
    expect(
      valueTargetForConfigDefinition(
        createDefinition({
          governanceScope: ConfigGovernanceScopeKey.GlobalBalance,
        }),
      ),
    ).toBe('global');
    expect(
      valueTargetForConfigDefinition(
        createDefinition({
          governanceScope: ConfigGovernanceScopeKey.ProductGlobal,
        }),
      ),
    ).toBe('global');
  });

  it('resolves server value target for non-global governance scopes', () => {
    expect(
      valueTargetForConfigDefinition(
        createDefinition({
          governanceScope: ConfigGovernanceScopeKey.LiveServer,
        }),
      ),
    ).toBe('server');
    expect(
      valueTargetForConfigDefinition(
        createDefinition({
          governanceScope: ConfigGovernanceScopeKey.ServerLaunch,
        }),
      ),
    ).toBe('server');
    expect(
      valueTargetForConfigDefinition(
        createDefinition({
          governanceScope: ConfigGovernanceScopeKey.TestOverride,
        }),
      ),
    ).toBe('server');
  });

  it('maps config definition explainability rows from DB metadata', () => {
    expect(
      mapConfigDefinitionExplainability(createExplainabilityRow()),
    ).toEqual(
      jasmine.objectContaining({
        configDefinitionId: 'definition-1',
        configKey: 'hero.max_level',
        label: 'Hero max level',
        governanceScopeLabel: 'Global balance',
        appliesToLabel: 'Global value',
        valueTypeLabel: 'Integer',
        expectedChangeKindLabel: 'Global value change',
        effectiveValueSourceLabel: 'Global value',
        gameplayImpactSummary: 'Changes the hero level cap.',
      }),
    );
  });
});

function createDefinition(
  overrides: Partial<ConfigDefinition> = {},
): ConfigDefinition {
  return {
    id: 'definition-1',
    key: 'hero.max_level',
    label: 'Hero max level',
    description: null,
    governanceScope: ConfigGovernanceScopeKey.GlobalBalance,
    managedEntityType: 'scalar_config',
    managedEntityKey: null,
    valueType: 'integer',
    valueSchema: {},
    defaultValue: 10,
    isActive: true,
    sortOrder: 10,
    createdAt: '2026-04-28T00:00:00.000Z',
    updatedAt: '2026-04-28T00:00:00.000Z',
    ...overrides,
  };
}

function createExplainabilityRow(): ConfigDefinitionExplainabilityRow {
  return {
    config_definition_id: 'definition-1',
    config_key: 'hero.max_level',
    label: 'Hero max level',
    description: 'Maximum hero level.',
    helper_text: 'Use for global progression tuning.',
    governance_scope: ConfigGovernanceScopeKey.GlobalBalance,
    governance_scope_label: 'Global balance',
    governance_scope_description: 'Applies globally.',
    governance_scope_helper_text: 'Use for balance-wide values.',
    governance_scope_warning_text: 'Review carefully.',
    managed_entity_type: 'scalar_config',
    managed_entity_type_label: 'Scalar config',
    managed_entity_type_description: 'Single config value.',
    managed_entity_key: 'hero',
    value_type: 'integer',
    value_type_label: 'Integer',
    value_type_description: 'Whole number.',
    applies_to_kind: 'global_value',
    applies_to_label: 'Global value',
    applies_to_description: 'Changes the global value.',
    applies_to_helper_text: 'No server selection is required.',
    expected_change_kind: ConfigChangeKindKey.GlobalValueChange,
    expected_change_kind_label: 'Global value change',
    effective_value_json: 10,
    effective_value_source_key: 'global',
    effective_value_source_label: 'Global value',
    effective_value_source_description: 'Current global version.',
    gameplay_impact_summary: 'Changes the hero level cap.',
    change_warning: 'Can affect all servers.',
    preview_kind: 'scalar',
    preview_label: 'Scalar',
    preview_description: 'Simple scalar preview.',
    ui_group_key: 'progression',
    ui_group_label: 'Progression',
    selected_server_id: 'server-1',
    metadata_json: {},
    sort_order: 10,
  };
}
