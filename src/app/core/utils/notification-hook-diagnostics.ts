import { NotificationHookDiagnostic } from '../domain/notifications/notification-hook-diagnostics.model';
import { Json } from '../types/database.types';
import { GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow } from '../types/notification-rpc.types';

export function mapNotificationHookDiagnosticRow(
  row: GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow,
): NotificationHookDiagnostic {
  return {
    producerKey: requiredText(row.producer_key, 'producerKey'),
    adminLabelPl: requiredText(row.admin_label_pl, 'adminLabelPl'),
    adminDescriptionPl: requiredText(row.admin_description_pl, 'adminDescriptionPl'),
    workflowKey: requiredText(row.workflow_key, 'workflowKey'),
    notificationTypeKeys: stringArray(row.notification_type_keys),
    notificationTypesJson: jsonValue(row.notification_types_json),
    missingNotificationTypeKeys: stringArray(row.missing_notification_type_keys),
    inactiveNotificationTypeKeys: stringArray(row.inactive_notification_type_keys),
    producerFunctionNames: stringArray(row.producer_function_names),
    producerFunctionsJson: jsonValue(row.producer_functions_json),
    missingProducerFunctionNames: stringArray(row.missing_producer_function_names),
    diagnosticsStatus: requiredText(row.diagnostics_status, 'diagnosticsStatus'),
    diagnosticsStatusLabelPl: requiredText(
      row.diagnostics_status_label_pl,
      'diagnosticsStatusLabelPl',
    ),
    diagnosticsSummaryPl: requiredText(row.diagnostics_summary_pl, 'diagnosticsSummaryPl'),
    helperTextPl: requiredText(row.helper_text_pl, 'helperTextPl'),
    blockerHelpTextPl: nullableText(row.blocker_help_text_pl),
    isExplicitNonProducer: row.is_explicit_non_producer,
    metadataJson: jsonValue(row.metadata_json),
    producerKind: requiredText(row.producer_kind, 'producerKind'),
    producerTableExists: row.producer_table_exists,
    producerTableName: nullableText(row.producer_table_name),
    producerTriggerName: nullableText(row.producer_trigger_name),
    isActive: row.is_active,
    isExpected: row.is_expected,
  };
}

function stringArray(value: readonly string[] | null | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string =>
      typeof entry === 'string' && entry.length > 0,
    )
    : [];
}

function jsonValue(value: Json | null | undefined): Json {
  return value ?? null;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = nullableText(value);

  if (!normalized) {
    throw new Error(`${field} must be a non-empty notification producer diagnostic field.`);
  }

  return normalized;
}

function nullableText(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
