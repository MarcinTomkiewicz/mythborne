import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NotificationTypeEntry } from '../../../core/domain/notifications/notification.model';
import {
  NotificationTypeAdminData,
  NotificationTypes,
} from '../../../core/services/notifications/notification-types';
import { NotificationTypesPage } from './notification-types-page';

describe('NotificationTypesPage', () => {
  let fixture: ComponentFixture<NotificationTypesPage>;
  let notificationTypes: jasmine.SpyObj<NotificationTypes>;

  beforeEach(() => {
    notificationTypes = jasmine.createSpyObj<NotificationTypes>(
      'NotificationTypes',
      ['getAdminData'],
    );
    notificationTypes.getAdminData.and.returnValue(of(adminData()));

    TestBed.configureTestingModule({
      imports: [NotificationTypesPage],
      providers: [
        provideRouter([]),
        { provide: NotificationTypes, useValue: notificationTypes },
      ],
    });

    fixture = TestBed.createComponent(NotificationTypesPage);
  });

  it('renders DB-backed notification type labels and toast defaults without a raw editor', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(notificationTypes.getAdminData).toHaveBeenCalled();
    expect(text).toContain('Notification catalog');
    expect(text).toContain('DB metadata header copy.');
    expect(text).toContain('Building completed');
    expect(text).toContain('estate.building_job.completed');
    expect(text).toContain('A building job completed.');
    expect(text).toContain('Shown when estate construction finishes.');
    expect(text).toContain('Internal admin note.');
    expect(text).toContain('notice');
    expect(text).toContain('toast default');
    expect(text).toContain('active');
    expect(text).toContain('Sanction created');
    expect(text).toContain('inbox only');
    expect(text).toContain('inactive');
    expect(text).not.toContain('<table');
    expect(text).not.toContain('Save');
  });

  it('shows a clear empty state from metadata fallback when no types are returned', async () => {
    notificationTypes.getAdminData.and.returnValue(of({
      types: [],
      metadataEntries: [],
    }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('No notification types registered.');
  });

  it('shows load errors without masking them as empty dictionary data', async () => {
    notificationTypes.getAdminData.and.returnValue(
      throwError(() => new Error('RPC unavailable')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('RPC unavailable');
    expect(text).not.toContain('No notification types registered.');
  });
});

function adminData(): NotificationTypeAdminData {
  return {
    types: [
      notificationType(),
      notificationType({
        key: 'staff.sanction.created',
        label: 'Sanction created',
        category: 'staff',
        defaultSeverity: 'warning',
        defaultToastEnabled: false,
        isActive: false,
        sortOrder: 20,
        adminDescription: null,
      }),
    ],
    metadataEntries: [
      {
        id: 'metadata-1',
        namespace: 'notification_type_admin_section',
        key: 'page_header',
        label: 'Notification catalog',
        description: 'DB metadata header copy.',
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

function notificationType(
  overrides: Partial<NotificationTypeEntry> = {},
): NotificationTypeEntry {
  return {
    key: 'estate.building_job.completed',
    label: 'Building completed',
    description: 'A building job completed.',
    helperText: 'Shown when estate construction finishes.',
    adminDescription: 'Internal admin note.',
    category: 'estate',
    defaultSeverity: 'notice',
    defaultToastEnabled: true,
    sortOrder: 10,
    isActive: true,
    ...overrides,
  };
}
