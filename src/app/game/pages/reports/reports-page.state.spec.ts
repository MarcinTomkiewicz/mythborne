import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  DeleteGameReportResult,
  PrivateGameReportListItem,
} from '../../../core/domain/reports/game-report.model';
import { GameReports } from '../../../core/services/reports/game-reports';
import { GameReportUiMetadataService } from '../../../core/services/reports/game-report-ui-metadata';
import { ToastService } from '../../../core/services/ui/toast';
import { ReportsPageState } from './reports-page.state';

describe('ReportsPageState', () => {
  let state: ReportsPageState;
  let gameReports: jasmine.SpyObj<GameReports>;
  let uiMetadata: jasmine.SpyObj<GameReportUiMetadataService>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    gameReports = jasmine.createSpyObj<GameReports>('GameReports', [
      'getActiveHeroReports',
      'getActiveHeroUnreadCount',
      'deleteActiveHeroReport',
    ]);
    uiMetadata = jasmine.createSpyObj<GameReportUiMetadataService>(
      'GameReportUiMetadataService',
      ['getReportsCenterEntries'],
    );
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    gameReports.getActiveHeroReports.and.returnValue(of([report()]));
    gameReports.getActiveHeroUnreadCount.and.returnValue(of(1));
    gameReports.deleteActiveHeroReport.and.returnValue(of(deleteResult()));
    uiMetadata.getReportsCenterEntries.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        ReportsPageState,
        { provide: GameReports, useValue: gameReports },
        { provide: GameReportUiMetadataService, useValue: uiMetadata },
        { provide: ToastService, useValue: toast },
      ],
    });
    state = TestBed.inject(ReportsPageState);
  });

  it('loads reports and unread count through the reports service', () => {
    state.form.setValue({
      reportTypeKey: 'combat',
      unreadOnly: true,
      searchText: '',
    });

    state.loadData();

    expect(gameReports.getActiveHeroReports).toHaveBeenCalledWith({
      reportTypeKey: 'combat',
      unreadOnly: true,
      limit: 50,
      offset: 0,
    });
    expect(state.reports().map((entry) => entry.reportId)).toEqual(['report-1']);
    expect(state.unreadCount()).toBe(1);
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('filters loaded reports by local search text', () => {
    gameReports.getActiveHeroReports.and.returnValue(of([
      report({ title: 'Training combat' }),
      report({ reportId: 'report-2', title: 'Market sale' }),
    ]));
    state.form.controls.searchText.setValue('training');

    state.loadData();

    expect(state.visibleReports().map((entry) => entry.title)).toEqual([
      'Training combat',
    ]);
    expect(gameReports.getActiveHeroReports).toHaveBeenCalledWith({
      reportTypeKey: null,
      unreadOnly: false,
      limit: 50,
      offset: 0,
    });
  });

  it('exposes public share token for the public report route', () => {
    expect(state.publicShareToken(report())).toBe('public-token-1');
  });

  it('copies public token through the Clipboard API when available', async () => {
    const clipboard = {
      writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve()),
    };
    spyOnProperty(navigator, 'clipboard', 'get').and.returnValue(
      clipboard as unknown as Clipboard,
    );

    state.copyPublicToken(report());
    await Promise.resolve();

    expect(clipboard.writeText).toHaveBeenCalledWith('public-token-1');
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Public token copied',
      'public-token-1',
    );
  });

  it('removes a report through the service and reloads list state', () => {
    state.loadData();
    gameReports.getActiveHeroReports.calls.reset();
    gameReports.getActiveHeroUnreadCount.calls.reset();

    state.removeReport(report());

    expect(gameReports.deleteActiveHeroReport).toHaveBeenCalledWith('report-1');
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Report removed',
      'Training combat was removed.',
    );
    expect(gameReports.getActiveHeroReports).toHaveBeenCalled();
    expect(gameReports.getActiveHeroUnreadCount).toHaveBeenCalled();
    expect(state.deletingReportId()).toBeNull();
  });

  it('surfaces delete errors without creating notification writes', () => {
    gameReports.deleteActiveHeroReport.and.returnValue(
      throwError(() => new Error('Delete failed.')),
    );

    state.removeReport(report());

    expect(state.error()).toBe('Delete failed.');
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Report removal failed',
      'Delete failed.',
    );
    expect(gameReports.getActiveHeroReports).toHaveBeenCalledTimes(0);
  });
});

function report(
  overrides: Partial<PrivateGameReportListItem> = {},
): PrivateGameReportListItem {
  return {
    reportId: 'report-1',
    publicToken: 'public-token-1',
    reportTypeKey: 'combat',
    reportTypeLabel: 'Combat',
    title: 'Training combat',
    summary: 'A combat was completed.',
    sourceEntityType: 'combat_result',
    sourceEntityId: 'combat-result-1',
    createdAt: '2026-05-05T10:00:00.000Z',
    readState: {
      accessRole: 'owner',
      readAt: null,
      isUnread: true,
    },
    participants: [
      {
        displayName: 'Hero One',
        participantRole: 'initiator',
        sideLabel: 'Initiator',
        levelSnapshot: 7,
        sortOrder: 10,
      },
    ],
    itemReferencesCount: 1,
    ...overrides,
  };
}

function deleteResult(): DeleteGameReportResult {
  return {
    reportId: 'report-1',
    heroId: 'hero-1',
    publicToken: 'public-token-1',
    removedAccess: true,
    deletedReport: false,
    remainingAccessCount: 1,
    auditLogId: 'audit-1',
  };
}
