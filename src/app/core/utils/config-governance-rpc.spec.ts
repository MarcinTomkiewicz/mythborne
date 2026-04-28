import {
  ConfigChangeKindKey,
  ConfigGovernanceScopeKey,
} from '../enums/config-governance.enum';
import {
  ConfigDefinition,
  CreateConfigChangeSetDraftInput,
  CreateConfigValueChangeEntryInput,
} from '../types/config-governance.types';
import {
  toCreateConfigChangeSetDraftRpcArgs,
  toCreateConfigValueChangeEntryRpcArgs,
} from './config-governance-rpc';
import { valueTargetForConfigDefinition } from './config-governance';

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
