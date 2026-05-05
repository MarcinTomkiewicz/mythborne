import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow } from '../../types/notification-rpc.types';
import { Backend } from '../backend/backend';
import { NotificationHookDiagnostics } from './notification-hook-diagnostics';

describe('NotificationHookDiagnostics', () => {
  let service: NotificationHookDiagnostics;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.callFake(<T>(functionName: string) => {
      if (functionName === RPC.get_admin_notification_db_owned_producer_diagnostics) {
        return of([diagnosticRow()] as T);
      }

      if (functionName === RPC.get_ui_metadata_entries) {
        return of([metadataRow()] as T);
      }

      return of([] as T);
    });

    TestBed.configureTestingModule({
      providers: [
        NotificationHookDiagnostics,
        { provide: Backend, useValue: backend },
      ],
    });

    service = TestBed.inject(NotificationHookDiagnostics);
  });

  it('loads DB-owned producer diagnostics through canonical read-only RPC and metadata', (done) => {
    service.getAdminData().subscribe((data) => {
      expect(backend.rpc).toHaveBeenCalledWith(
        RPC.get_admin_notification_db_owned_producer_diagnostics,
      );
      expect(backend.rpc).toHaveBeenCalledWith(
        RPC.get_ui_metadata_entries,
        {
          p_namespace: 'notification_hook_diagnostics_section',
          p_keys: [
            'page_header',
            'producer_list',
            'coverage_summary',
            'report_boundary',
            'empty_state',
          ],
          p_include_inactive: false,
        },
      );
      expect(data.diagnostics[0]).toEqual(jasmine.objectContaining({
        producerKey: 'building_completed',
        adminLabelPl: 'Ukonczenie budynku',
        diagnosticsStatus: 'covered',
      }));
      expect(data.metadataEntries[0]).toEqual(jasmine.objectContaining({
        namespace: 'notification_hook_diagnostics_section',
        key: 'page_header',
      }));
      done();
    });
  });
});

function diagnosticRow(): GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow {
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
    notification_type_keys: ['building.completed'],
    notification_types_json: [{ key: 'building.completed' }],
    producer_function_names: ['notify_building_completed'],
    producer_functions_json: [{ name: 'notify_building_completed' }],
    producer_key: 'building_completed',
    producer_kind: 'trigger',
    producer_table_exists: true,
    producer_table_name: 'estate_building_jobs',
    producer_trigger_name: 'notify_building_completed_trigger',
    workflow_key: 'building.completed',
  } as GetAdminNotificationDbOwnedProducerDiagnosticsRpcRow;
}

function metadataRow() {
  return {
    namespace: 'notification_hook_diagnostics_section',
    key: 'page_header',
    label: 'Diagnostyka producentow powiadomien',
    description: 'DB producer diagnostics copy.',
    helper_text: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
  };
}
