import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { PvpSpyResult } from '../../../core/domain/pvp/pvp.model';
import {
  PvpSpyResultReadStatus,
  PvpSpyResultState,
} from './pvp-spy-result.state';
import { PvpSpyResultPage } from './pvp-spy-result-page';

describe('PvpSpyResultPage', () => {
  let fixture: ComponentFixture<PvpSpyResultPage>;
  let paramMap: Subject<ReturnType<typeof convertToParamMap>>;
  let state: FakePvpSpyResultState;

  beforeEach(async () => {
    paramMap = new Subject<ReturnType<typeof convertToParamMap>>();
    state = new FakePvpSpyResultState();

    await TestBed.configureTestingModule({
      imports: [PvpSpyResultPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap.asObservable(),
          },
        },
      ],
    })
      .overrideComponent(PvpSpyResultPage, {
        set: {
          providers: [
            { provide: PvpSpyResultState, useValue: state },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PvpSpyResultPage);
    fixture.detectChanges();
  });

  it('loads the spy result id from the route and reacts to parameter changes', () => {
    paramMap.next(convertToParamMap({ spyResultId: 'spy-result-1' }));
    paramMap.next(convertToParamMap({ spyResultId: 'spy-result-2' }));

    expect(state.load).toHaveBeenCalledTimes(2);
    expect(state.load).toHaveBeenCalledWith('spy-result-1');
    expect(state.load).toHaveBeenCalledWith('spy-result-2');
  });

  it('uses player-facing copy for access denied instead of raw technical errors', () => {
    state.status.set('access-denied');
    state.error.set('permission denied for function get_my_pvp_spy_result');

    expect(fixture.componentInstance.errorMessage())
      .toBe('You do not have access to this spy result.');
  });

  it('renders safe spy result snapshot sections', () => {
    state.status.set('loaded');
    state.result.set(spyResult());
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Target Hero');
    expect(text).toContain('Base stats');
    expect(text).toContain('Strength');
    expect(text).toContain('10');
    expect(text).toContain('Bronze Spear');
    expect(text).not.toContain('target-hero-1');
    expect(text).not.toContain('permission denied');
  });
});

class FakePvpSpyResultState {
  readonly result = signal<PvpSpyResult | null>(null);
  readonly status = signal<PvpSpyResultReadStatus>('idle');
  readonly error = signal<string | null>(null);
  readonly requestedSpyResultId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly hasResult = signal(false);
  readonly isUnavailable = signal(false);
  readonly load = jasmine.createSpy('load');
  readonly clear = jasmine.createSpy('clear');
}

function textContent(fixture: ComponentFixture<PvpSpyResultPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function spyResult(): PvpSpyResult {
  return {
    spyResultId: 'spy-result-1',
    pvpActionId: 'pvp-action-1',
    serverId: 'server-1',
    createdAt: '2026-05-06T12:00:00Z',
    spyHeroId: 'active-hero-1',
    spyLevelSnapshot: 10,
    targetHeroId: 'target-hero-1',
    targetDisplayName: 'Target Hero',
    targetLevelSnapshot: 9,
    targetAddress: 'Agora 12',
    visibilityKey: 'private',
    resultSummary: 'Spy succeeded.',
    snapshots: {
      baseStats: {
        strength: 10,
      },
      resources: {
        drachma: 1000,
      },
      equipment: [{
        slot: 'weapon',
        itemName: 'Bronze Spear',
      }],
      estate: {
        rank: 3,
      },
      buildings: [],
      derivedCombatStats: {
        heroDerivedUsed: false,
      },
    },
  };
}
