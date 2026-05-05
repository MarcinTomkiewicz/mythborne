import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PublicGameReport } from '../../../core/domain/reports/game-report.model';
import { GameReportUiMetadataService } from '../../../core/services/reports/game-report-ui-metadata';
import { GameReports } from '../../../core/services/reports/game-reports';
import { PublicReportPageState } from './public-report-page.state';

describe('PublicReportPageState', () => {
  let state: PublicReportPageState;
  let gameReports: jasmine.SpyObj<GameReports>;
  let uiMetadata: jasmine.SpyObj<GameReportUiMetadataService>;

  beforeEach(() => {
    gameReports = jasmine.createSpyObj<GameReports>('GameReports', [
      'getPublicReportByToken',
    ]);
    uiMetadata = jasmine.createSpyObj<GameReportUiMetadataService>(
      'GameReportUiMetadataService',
      ['getPublicReportEntries'],
    );

    gameReports.getPublicReportByToken.and.returnValue(of(report()));
    uiMetadata.getPublicReportEntries.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        PublicReportPageState,
        { provide: GameReports, useValue: gameReports },
        { provide: GameReportUiMetadataService, useValue: uiMetadata },
      ],
    });
    state = TestBed.inject(PublicReportPageState);
  });

  it('loads a public report by token without private report state', () => {
    state.loadData('public-token-1');

    expect(gameReports.getPublicReportByToken).toHaveBeenCalledWith('public-token-1');
    expect(uiMetadata.getPublicReportEntries).toHaveBeenCalled();
    expect(state.report()).toEqual(jasmine.objectContaining({
      publicToken: 'public-token-1',
      title: 'Training combat',
    }));
    expect(Object.keys(state.report() ?? {}).sort()).not.toContain('reportId');
    expect(state.isNotFound()).toBeFalse();
    expect(state.isLoading()).toBeFalse();
  });

  it('shows safe not-found state when the public token does not resolve', () => {
    gameReports.getPublicReportByToken.and.returnValue(
      throwError(() => new Error('RLS denied internal detail.')),
    );

    state.loadData('missing-token');

    expect(state.report()).toBeNull();
    expect(state.isNotFound()).toBeTrue();
    expect(state.isLoading()).toBeFalse();
  });
});

function report(): PublicGameReport {
  return {
    publicToken: 'public-token-1',
    reportTypeKey: 'combat',
    reportTypeLabel: 'Combat',
    reportTypeDescription: 'Combat report.',
    title: 'Training combat',
    summary: 'A combat was completed.',
    sourceEntityType: 'combat_result',
    createdAt: '2026-05-05T10:00:00.000Z',
    participants: [],
    itemReferences: [],
    combatSection: null,
    contextualReadiness: null,
  };
}
