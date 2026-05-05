import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE,
  PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PVP_REPORT_SECTION_METADATA_NAMESPACE,
  PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
  PVP_REWARD_SECTION_METADATA_NAMESPACE,
  PVP_RUNTIME_SECTION_METADATA_NAMESPACE,
  PVP_SPY_SECTION_METADATA_NAMESPACE,
  PVP_TARGETING_SECTION_METADATA_NAMESPACE,
  PVP_UI_METADATA_NAMESPACES,
} from '../../constants/pvp-ui-metadata.const';
import { RPC } from '../../constants/rpc.const';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { PvpUiMetadata } from './pvp-ui-metadata';

describe('PvpUiMetadata', () => {
  let service: PvpUiMetadata;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'getAll',
      'create',
      'update',
      'delete',
      'upsert',
    ]);

    backend.rpc.and.callFake(<T>(_name: string, args?: Record<string, unknown>) => {
      const namespace = String(args?.['p_namespace'] ?? '');
      return of([uiMetadataRow(namespace)]) as T;
    });

    TestBed.configureTestingModule({
      providers: [
        PvpUiMetadata,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(PvpUiMetadata);
  });

  it('loads all current PvP metadata namespaces through DB-backed metadata RPC', async () => {
    const entries = await firstValueFrom(service.getEntries());

    expect(backend.rpc.calls.count()).toBe(PVP_UI_METADATA_NAMESPACES.length);
    expect(backend.rpc.calls.allArgs()).toEqual(
      PVP_UI_METADATA_NAMESPACES.map((namespace) => [
        RPC.get_ui_metadata_entries,
        {
          p_namespace: namespace,
          p_include_inactive: false,
        },
      ]),
    );
    expect(entries.map((entry) => entry.namespace)).toEqual([
      PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      PVP_RUNTIME_SECTION_METADATA_NAMESPACE,
      PVP_TARGETING_SECTION_METADATA_NAMESPACE,
      PVP_SPY_SECTION_METADATA_NAMESPACE,
      PVP_REWARD_SECTION_METADATA_NAMESPACE,
      PVP_RESOURCE_TRANSFER_SECTION_METADATA_NAMESPACE,
      PVP_ANTI_ABUSE_SECTION_METADATA_NAMESPACE,
      PVP_REPORT_SECTION_METADATA_NAMESPACE,
    ]);
    expect(entries[0]).toEqual(jasmine.objectContaining({
      key: 'overview',
      label: 'PvP metadata',
      helperText: 'DB-backed helper.',
      isActive: true,
    }));
  });

  it('can load one supported PvP namespace as read models without gameplay fallback keys', async () => {
    const entries = await firstValueFrom(
      service.getNamespaceEntries(PVP_TARGETING_SECTION_METADATA_NAMESPACE),
    );

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_ui_metadata_entries,
      {
        p_namespace: PVP_TARGETING_SECTION_METADATA_NAMESPACE,
        p_include_inactive: false,
      },
    );
    expect(backend.rpc.calls.mostRecent().args[1]).not.toEqual(
      jasmine.objectContaining({ p_keys: jasmine.anything() }),
    );
    expect(entries[0]).toEqual(jasmine.objectContaining({
      namespace: PVP_TARGETING_SECTION_METADATA_NAMESPACE,
      key: 'overview',
      helperText: 'DB-backed helper.',
      createdAt: '2026-05-05T10:00:00.000Z',
      updatedAt: '2026-05-05T10:00:00.000Z',
    }));
  });

  it('does not read or write PvP metadata tables directly', async () => {
    await firstValueFrom(service.getEntries());

    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });
});

function uiMetadataRow(namespace: string): Row<'ui_metadata_entries'> {
  return {
    created_at: '2026-05-05T10:00:00.000Z',
    description: 'DB-backed description.',
    helper_text: 'DB-backed helper.',
    id: `${namespace}-overview`,
    impact_summary: null,
    is_active: true,
    key: 'overview',
    label: 'PvP metadata',
    metadata_json: {},
    namespace,
    sort_order: 10,
    ui_group_key: null,
    ui_group_label: null,
    updated_at: '2026-05-05T10:00:00.000Z',
    warning_text: null,
  };
}
