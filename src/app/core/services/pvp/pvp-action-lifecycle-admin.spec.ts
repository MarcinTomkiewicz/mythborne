import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { Backend } from '../backend/backend';
import { PvpActionLifecycleAdmin } from './pvp-action-lifecycle-admin';

describe('PvpActionLifecycleAdmin', () => {
  let service: PvpActionLifecycleAdmin;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    backend.getAll.and.callFake((opts: { table: string }) => {
      const { table } = opts;

      if (table === TABLES.pvp_action_kinds) {
        return of([
          actionKindRow({ key: 'attack', label: 'Attack', is_active: true }),
          actionKindRow({ key: 'siege', label: 'Siege', is_active: false }),
        ]) as never;
      }

      if (table === TABLES.pvp_action_statuses) {
        return of([
          actionStatusRow({
            key: 'travelling',
            label: 'Travelling',
            is_blocking: true,
            is_terminal: false,
          }),
          actionStatusRow({
            key: 'resolved',
            label: 'Resolved',
            is_blocking: false,
            is_terminal: true,
          }),
        ]) as never;
      }

      return of([]) as never;
    });

    TestBed.configureTestingModule({
      providers: [
        PvpActionLifecycleAdmin,
        { provide: Backend, useValue: backend },
      ],
    });

    service = TestBed.inject(PvpActionLifecycleAdmin);
  });

  it('loads action kinds and statuses through read-only backend reads', async () => {
    const data = await firstValueFrom(service.getData());

    expect(data.actionKinds.map((kind) => kind.key)).toEqual(['attack', 'siege']);
    expect(data.actionKinds[0]).toEqual(jasmine.objectContaining({
      createsCombat: true,
      createsRuntimeActivity: true,
      isActive: true,
    }));
    expect(data.actionStatuses.map((status) => status.key)).toEqual([
      'travelling',
      'resolved',
    ]);
    expect(data.actionStatuses[1]).toEqual(jasmine.objectContaining({
      isBlocking: false,
      isTerminal: true,
    }));
  });

  it('does not use backend write APIs', async () => {
    await firstValueFrom(service.getData());

    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.pvp_action_kinds,
      camelCase: false,
    }));
    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.pvp_action_statuses,
      camelCase: false,
    }));
  });
});

function actionKindRow(overrides: Partial<ReturnType<typeof baseActionKindRow>> = {}) {
  return {
    ...baseActionKindRow(),
    ...overrides,
  };
}

function baseActionKindRow() {
  return {
    admin_description: 'Admin action kind description.',
    created_at: '2026-05-07T00:00:00.000Z',
    creates_combat: true,
    creates_runtime_activity: true,
    creates_spy_result: false,
    description: 'Action kind description.',
    helper_text: 'Action kind helper.',
    is_active: true,
    is_travel_action: true,
    key: 'attack',
    label: 'Attack',
    sort_order: 10,
    updated_at: '2026-05-07T00:00:00.000Z',
  };
}

function actionStatusRow(
  overrides: Partial<ReturnType<typeof baseActionStatusRow>> = {},
) {
  return {
    ...baseActionStatusRow(),
    ...overrides,
  };
}

function baseActionStatusRow() {
  return {
    admin_description: 'Admin status description.',
    created_at: '2026-05-07T00:00:00.000Z',
    description: 'Status description.',
    helper_text: 'Status helper.',
    is_active: true,
    is_blocking: true,
    is_terminal: false,
    key: 'travelling',
    label: 'Travelling',
    sort_order: 10,
    updated_at: '2026-05-07T00:00:00.000Z',
  };
}
