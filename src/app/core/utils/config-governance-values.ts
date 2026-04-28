import {
  ConfigChangeValueTarget,
  ConfigGovernanceScopeKey,
  ConfigManagedEntityTypeKey,
  ConfigValueTypeKey,
  EffectiveConfigValueSource,
} from '../enums/config-governance.enum';
import {
  ConfigDefinition,
  ConfigValueType,
  EffectiveConfigValue,
  GlobalConfigValue,
  ServerConfigValue,
} from '../types/config-governance.types';
import { Json } from '../types/database.types';
import { formatJsonPreview, parseJsonInput } from './json-preview';
import { trimText } from './normalize-text';

export function resolveEffectiveConfigValues(
  definitions: readonly ConfigDefinition[],
  globalValues: readonly GlobalConfigValue[],
  serverValues: readonly ServerConfigValue[],
): Map<string, EffectiveConfigValue> {
  const globalByDefinition = latestGlobalValuesByDefinition(globalValues);
  const serverByDefinition = latestServerValuesByDefinition(serverValues);

  return new Map(
    definitions.map((definition) => {
      const serverValue = serverByDefinition.get(definition.id) ?? null;
      const globalValue = globalByDefinition.get(definition.id) ?? null;
      const effectiveValue = resolveEffectiveConfigValue(
        definition,
        globalValue,
        serverValue,
      );

      return [definition.id, effectiveValue];
    }),
  );
}

export function formatConfigJsonPreview(value: Json | null): string {
  return formatJsonPreview(value, 'No default');
}

export function formatConfigValuePreview(value: Json | null): string {
  return formatJsonPreview(value, 'No value');
}

export function parseConfigValueInput(
  value: string,
  valueType: ConfigValueType,
): Json {
  const trimmedValue = trimText(value);

  if (valueType === ConfigValueTypeKey.String) {
    return value;
  }

  if (valueType === ConfigValueTypeKey.Integer) {
    const parsedValue = Number(trimmedValue);

    if (trimmedValue === '' || !Number.isInteger(parsedValue)) {
      throw new Error('Expected integer config value.');
    }

    return parsedValue;
  }

  if (valueType === ConfigValueTypeKey.Decimal) {
    const parsedValue = Number(trimmedValue);

    if (trimmedValue === '' || !Number.isFinite(parsedValue)) {
      throw new Error('Expected decimal config value.');
    }

    return parsedValue;
  }

  if (valueType === ConfigValueTypeKey.Boolean) {
    if (trimmedValue === 'true') {
      return true;
    }

    if (trimmedValue === 'false') {
      return false;
    }

    throw new Error('Expected boolean config value: true or false.');
  }

  if (valueType === ConfigValueTypeKey.Json) {
    return parseJsonInput(trimmedValue, 'Expected valid JSON config value.');
  }

  throw new Error(
    'This config value type is not supported in the draft editor.',
  );
}

export function isConfigValueTypeSupportedInDraftEditor(
  valueType: ConfigValueType,
): boolean {
  return (
    valueType === ConfigValueTypeKey.Integer ||
    valueType === ConfigValueTypeKey.Decimal ||
    valueType === ConfigValueTypeKey.Boolean ||
    valueType === ConfigValueTypeKey.String ||
    valueType === ConfigValueTypeKey.Json
  );
}

export function isConfigDefinitionSupportedInValueDraftEditor(
  definition: ConfigDefinition,
): boolean {
  // D4 handles simple value_json drafts only. server_setting and relational definitions
  // stay out until they get dedicated entity_field_change flows.
  const isValueConfig =
    definition.managedEntityType === ConfigManagedEntityTypeKey.ScalarConfig ||
    definition.managedEntityType === ConfigManagedEntityTypeKey.JsonConfig;

  return (
    isValueConfig &&
    isConfigValueTypeSupportedInDraftEditor(definition.valueType)
  );
}

export function isGlobalConfigGovernanceScope(
  definition: Pick<ConfigDefinition, 'governanceScope'>,
): boolean {
  return (
    definition.governanceScope === ConfigGovernanceScopeKey.ProductGlobal ||
    definition.governanceScope === ConfigGovernanceScopeKey.GlobalBalance
  );
}

export function valueTargetForConfigDefinition(
  definition: Pick<ConfigDefinition, 'governanceScope'>,
): ConfigChangeValueTarget {
  return isGlobalConfigGovernanceScope(definition)
    ? ConfigChangeValueTarget.Global
    : ConfigChangeValueTarget.Server;
}

export function sourceLabelForEffectiveConfigValue(
  value: EffectiveConfigValue,
): string {
  if (value.source === EffectiveConfigValueSource.Server && value.serverValue) {
    return `Server: ${value.serverValue.source}`;
  }

  if (value.source === EffectiveConfigValueSource.Global && value.globalValue) {
    return `Global: v${value.globalValue.version}`;
  }

  if (value.source === EffectiveConfigValueSource.Default) {
    return 'Default';
  }

  return 'No value';
}

function resolveEffectiveConfigValue(
  definition: ConfigDefinition,
  globalValue: GlobalConfigValue | null,
  serverValue: ServerConfigValue | null,
): EffectiveConfigValue {
  // TODO D2: this is a simple read model: server value > active global value > default.
  // Later config governance tasks must enforce governance_scope more strictly when editing/applying values.
  if (serverValue) {
    return buildEffectiveValue(
      definition,
      serverValue.value,
      EffectiveConfigValueSource.Server,
      globalValue,
      serverValue,
    );
  }

  if (globalValue) {
    return buildEffectiveValue(
      definition,
      globalValue.value,
      EffectiveConfigValueSource.Global,
      globalValue,
      null,
    );
  }

  if (definition.defaultValue !== null) {
    return buildEffectiveValue(
      definition,
      definition.defaultValue,
      EffectiveConfigValueSource.Default,
      null,
      null,
    );
  }

  return buildEffectiveValue(
    definition,
    null,
    EffectiveConfigValueSource.None,
    null,
    null,
  );
}

function buildEffectiveValue(
  definition: ConfigDefinition,
  value: Json | null,
  source: EffectiveConfigValueSource,
  globalValue: GlobalConfigValue | null,
  serverValue: ServerConfigValue | null,
): EffectiveConfigValue {
  const effectiveValue: EffectiveConfigValue = {
    configDefinitionId: definition.id,
    value,
    source,
    sourceLabel: '',
    serverValue,
    globalValue,
    defaultValue: definition.defaultValue,
  };

  return {
    ...effectiveValue,
    sourceLabel: sourceLabelForEffectiveConfigValue(effectiveValue),
  };
}

function latestGlobalValuesByDefinition(
  values: readonly GlobalConfigValue[],
): Map<string, GlobalConfigValue> {
  return values.reduce((acc, value) => {
    const current = acc.get(value.configDefinitionId);

    if (!current || value.version > current.version) {
      acc.set(value.configDefinitionId, value);
    }

    return acc;
  }, new Map<string, GlobalConfigValue>());
}

function latestServerValuesByDefinition(
  values: readonly ServerConfigValue[],
): Map<string, ServerConfigValue> {
  return values.reduce((acc, value) => {
    const current = acc.get(value.configDefinitionId);

    if (
      !current ||
      Date.parse(value.updatedAt) > Date.parse(current.updatedAt)
    ) {
      acc.set(value.configDefinitionId, value);
    }

    return acc;
  }, new Map<string, ServerConfigValue>());
}
