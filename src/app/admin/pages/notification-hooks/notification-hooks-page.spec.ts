import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NotificationHookDiagnostic } from '../../../core/domain/notifications/notification-hook-diagnostics.model';
import {
  NotificationHookDiagnostics,
  NotificationHookDiagnosticsAdminData,
} from '../../../core/services/notifications/notification-hook-diagnostics';
import { NotificationHooksPage } from './notification-hooks-page';

describe('NotificationHooksPage', () => {
  let fixture: ComponentFixture<NotificationHooksPage>;
  let hookDiagnostics: jasmine.SpyObj<NotificationHookDiagnostics>;

  beforeEach(() => {
    hookDiagnostics = jasmine.createSpyObj<NotificationHookDiagnostics>(
      'NotificationHookDiagnostics',
      ['getAdminData'],
    );
    hookDiagnostics.getAdminData.and.returnValue(of(adminData()));

    TestBed.configureTestingModule({
      imports: [NotificationHooksPage],
      providers: [
        provideRouter([]),
        { provide: NotificationHookDiagnostics, useValue: hookDiagnostics },
      ],
    });

    fixture = TestBed.createComponent(NotificationHooksPage);
  });

  it('renders DB/RPC producer diagnostics instead of the generic missing source blocker', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(hookDiagnostics.getAdminData).toHaveBeenCalled();
    expect(text).toContain('Diagnostyka producentow powiadomien');
    expect(text).toContain('Kopia metadanych diagnostyki producentow z DB.');
    expect(text).toContain('Ukonczenie budynku');
    expect(text).toContain('building_completed');
    expect(text).toContain('building.completed');
    expect(text).not.toContain('Save');
    expect(text).not.toContain('Create notification');
    expect(text).not.toContain('Delete');
  });

  it('shows explicit non-producer diagnostics returned by DB/RPC', async () => {
    hookDiagnostics.getAdminData.and.returnValue(of(adminData({
      diagnostics: [
        diagnostic({
          producerKey: 'game_report_created_is_not_default_notification_producer',
          adminLabelPl: 'Raport gry nie jest domyslnym producentem',
          diagnosticsStatus: 'explicit_non_producer',
          diagnosticsStatusLabelPl: 'Jawny non-producer',
          diagnosticsSummaryPl: 'Raporty gry maja osobny inbox.',
          isExplicitNonProducer: true,
          notificationTypeKeys: [],
          producerFunctionNames: [],
        }),
      ],
    })));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('game_report_created_is_not_default_notification_producer');
    expect(text).toContain('Raport gry nie jest domyslnym producentem');
    expect(text).toContain('Jawny non-producer');
    expect(text).toContain('explicit non-producer');
  });

  it('shows per-row DB/RPC blockers for missing notification types and producer functions', async () => {
    hookDiagnostics.getAdminData.and.returnValue(of(adminData({
      diagnostics: [
        diagnostic({
          diagnosticsStatus: 'blocked',
          diagnosticsStatusLabelPl: 'Wymaga poprawy',
          missingNotificationTypeKeys: ['building.completed'],
          missingProducerFunctionNames: ['notify_building_completed'],
          blockerHelpTextPl: 'Dodaj brakujacy typ i funkcje w DB.',
        }),
      ],
    })));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('DB/content blocker');
    expect(text).toContain('Brakujace notification type keys: building.completed');
    expect(text).toContain('Brakujace funkcje producenta: notify_building_completed');
    expect(text).toContain('Dodaj brakujacy typ i funkcje w DB.');
  });

  it('shows load errors without masking them as empty diagnostics', async () => {
    hookDiagnostics.getAdminData.and.returnValue(
      throwError(() => new Error('diagnostics unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('diagnostics unavailable');
    expect(text).not.toContain('Brak diagnostyki producentow powiadomien do wyswietlenia.');
  });
});

function adminData(
  options: {
    diagnostics?: NotificationHookDiagnostic[];
  } = {},
): NotificationHookDiagnosticsAdminData {
  return {
    diagnostics: options.diagnostics ?? [diagnostic()],
    metadataEntries: [
      {
        id: 'metadata-1',
        namespace: 'notification_hook_diagnostics_section',
        key: 'page_header',
        label: 'Diagnostyka producentow powiadomien',
        description: 'Kopia metadanych diagnostyki producentow z DB.',
        helperText: null,
        impactSummary: null,
        warningText: null,
        uiGroupKey: null,
        uiGroupLabel: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        createdAt: '2026-05-05T10:00:00.000Z',
        updatedAt: '2026-05-05T10:00:00.000Z',
      },
    ],
  };
}

function diagnostic(
  overrides: Partial<NotificationHookDiagnostic> = {},
): NotificationHookDiagnostic {
  return {
    producerKey: 'building_completed',
    adminLabelPl: 'Ukonczenie budynku',
    adminDescriptionPl: 'Tworzy powiadomienie po zakonczeniu budynku.',
    workflowKey: 'building.completed',
    notificationTypeKeys: ['building.completed'],
    notificationTypesJson: [{ key: 'building.completed' }],
    missingNotificationTypeKeys: [],
    inactiveNotificationTypeKeys: [],
    producerFunctionNames: ['notify_building_completed'],
    producerFunctionsJson: [{ name: 'notify_building_completed' }],
    missingProducerFunctionNames: [],
    diagnosticsStatus: 'covered',
    diagnosticsStatusLabelPl: 'Pokryty',
    diagnosticsSummaryPl: 'Producent ma typ powiadomienia i funkcje.',
    helperTextPl: 'Read-only diagnostyka z DB.',
    blockerHelpTextPl: null,
    isExplicitNonProducer: false,
    metadataJson: {},
    producerKind: 'trigger',
    producerTableExists: true,
    producerTableName: 'estate_building_jobs',
    producerTriggerName: 'notify_building_completed_trigger',
    isActive: true,
    isExpected: true,
    ...overrides,
  };
}
