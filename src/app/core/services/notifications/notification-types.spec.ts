import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { Backend } from '../backend/backend';
import { NotificationTypes } from './notification-types';

describe('NotificationTypes', () => {
  let service: NotificationTypes;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll', 'rpc']);
    backend.getAll.and.returnValue(of([notificationTypeRow()]));
    backend.rpc.and.returnValue(of([metadataRow()]));

    TestBed.configureTestingModule({
      providers: [
        NotificationTypes,
        { provide: Backend, useValue: backend },
      ],
    });

    service = TestBed.inject(NotificationTypes);
  });

  it('loads notification types and admin metadata through read-only paths', (done) => {
    service.getAdminData().subscribe((data) => {
      expect(backend.getAll).toHaveBeenCalledWith({
        table: TABLES.notification_types,
        orderBy: [
          { column: 'category' },
          { column: 'sort_order' },
          { column: 'label' },
        ],
        camelCase: false,
      });
      expect(backend.rpc).toHaveBeenCalledWith(
        RPC.get_ui_metadata_entries,
        {
          p_namespace: 'notification_type_admin_section',
          p_keys: ['page_header', 'type_list', 'toast_behavior', 'empty_state'],
          p_include_inactive: false,
        },
      );
      expect(data.types[0]).toEqual(jasmine.objectContaining({
        key: 'estate.building_job.completed',
        adminDescription: 'Internal admin note.',
      }));
      expect(data.metadataEntries[0]).toEqual(jasmine.objectContaining({
        namespace: 'notification_type_admin_section',
        key: 'page_header',
      }));
      done();
    });
  });
});

function notificationTypeRow() {
  return {
    admin_description: 'Internal admin note.',
    category: 'estate',
    created_at: '2026-05-05T10:00:00.000Z',
    default_severity: 'notice',
    default_toast_enabled: true,
    description: 'A building job completed.',
    helper_text: 'Shown when estate construction finishes.',
    is_active: true,
    key: 'estate.building_job.completed',
    label: 'Building completed',
    sort_order: 10,
    updated_at: '2026-05-05T10:00:00.000Z',
  };
}

function metadataRow() {
  return {
    namespace: 'notification_type_admin_section',
    key: 'page_header',
    label: 'Notification catalog',
    description: 'DB metadata header copy.',
    helper_text: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
  };
}
