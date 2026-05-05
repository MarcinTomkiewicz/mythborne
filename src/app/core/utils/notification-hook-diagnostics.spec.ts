import { GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow } from '../types/notification-rpc.types';
import { mapNotificationHookDiagnosticRow } from './notification-hook-diagnostics';

describe('notification hook diagnostics', () => {
  it('maps DB-owned producer RPC rows without deriving producer coverage in Angular', () => {
    const diagnostic = mapNotificationHookDiagnosticRow(rpcRow({
      notification_type_keys: ['building.completed'],
      notification_types_json: [{ key: 'building.completed', label: 'Building completed' }],
      producer_function_names: ['notify_building_completed'],
      producer_functions_json: [{ name: 'notify_building_completed' }],
    }));

    expect(diagnostic).toEqual(jasmine.objectContaining({
      producerKey: 'building_completed',
      adminLabelPl: 'Ukonczenie budynku',
      workflowKey: 'building.completed',
      notificationTypeKeys: ['building.completed'],
      missingNotificationTypeKeys: [],
      inactiveNotificationTypeKeys: [],
      producerFunctionNames: ['notify_building_completed'],
      missingProducerFunctionNames: [],
      diagnosticsStatus: 'covered',
      diagnosticsStatusLabelPl: 'Pokryty',
      isExplicitNonProducer: false,
      producerKind: 'trigger',
      producerTableExists: true,
      producerTableName: 'estate_building_jobs',
      producerTriggerName: 'notify_building_completed_trigger',
    }));
    expect(diagnostic.notificationTypesJson as unknown)
      .toEqual([{ key: 'building.completed', label: 'Building completed' }]);
    expect(diagnostic.producerFunctionsJson as unknown)
      .toEqual([{ name: 'notify_building_completed' }]);
  });

  it('maps missing type/function arrays and explicit non-producer rows from RPC', () => {
    const row = rpcRow({
      producer_key: 'game_report_created_is_not_default_notification_producer',
      admin_label_pl: 'Raport gry nie jest domyslnym producentem',
      notification_type_keys: [],
      missing_notification_type_keys: ['game_report.created'],
      producer_function_names: [],
      missing_producer_function_names: ['create_game_report_notification'],
      diagnostics_status: 'explicit_non_producer',
      diagnostics_status_label_pl: 'Jawny non-producer',
      blocker_help_text_pl: 'Raporty maja wlasny inbox.',
      is_explicit_non_producer: true,
      producer_table_exists: false,
    });
    (row as unknown as { producer_table_name: null }).producer_table_name = null;
    (row as unknown as { producer_trigger_name: null }).producer_trigger_name = null;

    const diagnostic = mapNotificationHookDiagnosticRow(row);

    expect(diagnostic).toEqual(jasmine.objectContaining({
      producerKey: 'game_report_created_is_not_default_notification_producer',
      diagnosticsStatus: 'explicit_non_producer',
      diagnosticsStatusLabelPl: 'Jawny non-producer',
      missingNotificationTypeKeys: ['game_report.created'],
      missingProducerFunctionNames: ['create_game_report_notification'],
      blockerHelpTextPl: 'Raporty maja wlasny inbox.',
      isExplicitNonProducer: true,
      producerTableExists: false,
      producerTableName: null,
      producerTriggerName: null,
    }));
  });
});

function rpcRow(
  overrides: Partial<GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow> = {},
): GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow {
  return {
    admin_description_pl: 'Tworzy powiadomienie po zakonczeniu budynku.',
    admin_label_pl: 'Ukonczenie budynku',
    blocker_help_text_pl: '',
    diagnostics_status: 'covered',
    diagnostics_status_label_pl: 'Pokryty',
    diagnostics_summary_pl: 'Producent ma typ powiadomienia i funkcje.',
    helper_text_pl: 'Read-only diagnostyka z DB.',
    inactive_notification_type_keys: [],
    is_active: true,
    is_expected: true,
    is_explicit_non_producer: false,
    metadata_json: {},
    missing_notification_type_keys: [],
    missing_producer_function_names: [],
    notification_type_keys: [],
    notification_types_json: [],
    producer_function_names: [],
    producer_functions_json: [],
    producer_key: 'building_completed',
    producer_kind: 'trigger',
    producer_table_exists: true,
    producer_table_name: 'estate_building_jobs',
    producer_trigger_name: 'notify_building_completed_trigger',
    workflow_key: 'building.completed',
    ...overrides,
  } as GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow;
}
