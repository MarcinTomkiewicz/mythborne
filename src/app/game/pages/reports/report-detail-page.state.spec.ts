import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  DeleteGameReportResult,
  MarkGameReportReadResult,
  PrivateGameReportDetail,
} from '../../../core/domain/reports/game-report.model';
import { GameReports } from '../../../core/services/reports/game-reports';
import { GameReportUiMetadataService } from '../../../core/services/reports/game-report-ui-metadata';
import { ToastService } from '../../../core/services/ui/toast';
import { ReportDetailPageState } from './report-detail-page.state';

describe('ReportDetailPageState', () => {
  let state: ReportDetailPageState;
  let gameReports: jasmine.SpyObj<GameReports>;
  let uiMetadata: jasmine.SpyObj<GameReportUiMetadataService>;
  let toast: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    gameReports = jasmine.createSpyObj<GameReports>('GameReports', [
      'getActiveHeroReportDetail',
      'getActiveHeroUnreadCount',
      'markActiveHeroReportRead',
      'deleteActiveHeroReport',
    ]);
    uiMetadata = jasmine.createSpyObj<GameReportUiMetadataService>(
      'GameReportUiMetadataService',
      ['getReportDetailEntries'],
    );
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    gameReports.getActiveHeroReportDetail.and.returnValue(of(detail()));
    gameReports.getActiveHeroUnreadCount.and.returnValues(of(2), of(1));
    gameReports.markActiveHeroReportRead.and.returnValue(of(markReadResult()));
    gameReports.deleteActiveHeroReport.and.returnValue(of(deleteResult()));
    uiMetadata.getReportDetailEntries.and.returnValue(of([]));
    router.navigateByUrl.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        ReportDetailPageState,
        { provide: GameReports, useValue: gameReports },
        { provide: GameReportUiMetadataService, useValue: uiMetadata },
        { provide: ToastService, useValue: toast },
        { provide: Router, useValue: router },
      ],
    });
    state = TestBed.inject(ReportDetailPageState);
  });

  it('loads detail and marks unread report read for the active hero only', () => {
    state.loadData('report-1');

    expect(gameReports.getActiveHeroReportDetail).toHaveBeenCalledWith('report-1');
    expect(gameReports.markActiveHeroReportRead).toHaveBeenCalledWith('report-1');
    expect(state.report()?.readState).toEqual({
      accessRole: 'owner',
      readAt: '2026-05-05T10:05:00.000Z',
      isUnread: false,
    });
    expect(state.unreadCount()).toBe(1);
    expect(state.isLoading()).toBeFalse();
  });

  it('does not mark already read reports again', () => {
    gameReports.getActiveHeroReportDetail.and.returnValue(of(detail({
      readState: {
        accessRole: 'owner',
        readAt: '2026-05-05T10:00:00.000Z',
        isUnread: false,
      },
    })));

    state.loadData('report-1');

    expect(gameReports.markActiveHeroReportRead).not.toHaveBeenCalled();
    expect(state.unreadCount()).toBe(2);
  });

  it('removes report from detail through the report service and returns to list', () => {
    state.loadData('report-1');

    state.removeReport();

    expect(gameReports.deleteActiveHeroReport).toHaveBeenCalledWith('report-1');
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Report removed',
      'Training combat was removed.',
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/game/reports');
  });

  it('surfaces mark-read failures without hiding loaded detail', () => {
    gameReports.markActiveHeroReportRead.and.returnValue(
      throwError(() => new Error('Cannot mark read.')),
    );

    state.loadData('report-1');

    expect(state.report()?.reportId).toBe('report-1');
    expect(state.error()).toBe('Cannot mark read.');
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Read state update failed',
      'Cannot mark read.',
    );
  });

  it('does not locally guess unread count when post-mark refresh fails', () => {
    gameReports.getActiveHeroUnreadCount.and.returnValues(
      of(2),
      throwError(() => new Error('Count failed.')),
    );

    state.loadData('report-1');

    expect(state.unreadCount()).toBe(2);
    expect(state.error()).toBe('Unread count refresh failed.');
    expect(toast.show).toHaveBeenCalledWith(
      'warn',
      'Unread count unavailable',
      'Unread count refresh failed.',
    );
  });
});

function detail(
  overrides: Partial<PrivateGameReportDetail> = {},
): PrivateGameReportDetail {
  return {
    reportId: 'report-1',
    publicToken: 'public-token-1',
    reportTypeKey: 'combat',
    reportTypeLabel: 'Combat',
    reportTypeDescription: 'Combat report.',
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
    participants: [],
    itemReferences: [],
    combatSection: null,
    contextualReadiness: null,
    ...overrides,
  };
}

function markReadResult(): MarkGameReportReadResult {
  return {
    reportId: 'report-1',
    heroId: 'hero-1',
    accessRole: 'owner',
    readAt: '2026-05-05T10:05:00.000Z',
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
