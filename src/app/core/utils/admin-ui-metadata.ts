import { UiMetadataEntryReadModel } from '../domain/admin-ui-metadata.model';
import { Row } from '../types/supabase.types';

export function mapUiMetadataEntry(
  row: Row<'ui_metadata_entries'>,
): UiMetadataEntryReadModel {
  return {
    id: row.id,
    namespace: row.namespace,
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    impactSummary: row.impact_summary,
    warningText: row.warning_text,
    uiGroupKey: row.ui_group_key,
    uiGroupLabel: row.ui_group_label,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function metadataEntry(
  entries: UiMetadataEntryReadModel[],
  namespace: string,
  key: string,
): UiMetadataEntryReadModel | null {
  return entries.find((entry) =>
    entry.namespace === namespace && entry.key === key && entry.isActive
  ) ?? null;
}

export function metadataText(
  entries: UiMetadataEntryReadModel[],
  namespace: string,
  key: string,
): string {
  const entry = metadataEntry(entries, namespace, key);

  return entry?.description
    ?? entry?.helperText
    ?? entry?.impactSummary
    ?? entry?.warningText
    ?? missingUiMetadataLabel(namespace, key);
}

export function missingUiMetadataLabel(namespace: string, key: string): string {
  return `Missing UI metadata: ${namespace}/${key}`;
}

export function missingUiMetadataGaps(
  entries: UiMetadataEntryReadModel[],
  expected: Record<string, readonly string[]>,
): string[] {
  return Object.entries(expected).flatMap(([namespace, keys]) =>
    keys
      .filter((key) => !metadataEntry(entries, namespace, key))
      .map((key) => `${namespace}/${key}`),
  );
}
