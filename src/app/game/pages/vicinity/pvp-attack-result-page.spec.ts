import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { PvpAttackResult } from '../../../core/domain/pvp/pvp.model';
import {
  PvpAttackResultReadStatus,
  PvpAttackResultState,
} from './pvp-attack-result.state';
import { PvpAttackResultPage } from './pvp-attack-result-page';

describe('PvpAttackResultPage', () => {
  let fixture: ComponentFixture<PvpAttackResultPage>;
  let paramMap: Subject<ReturnType<typeof convertToParamMap>>;
  let state: FakePvpAttackResultState;

  beforeEach(async () => {
    paramMap = new Subject<ReturnType<typeof convertToParamMap>>();
    state = new FakePvpAttackResultState();

    await TestBed.configureTestingModule({
      imports: [PvpAttackResultPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap.asObservable(),
          },
        },
      ],
    })
      .overrideComponent(PvpAttackResultPage, {
        set: {
          providers: [
            { provide: PvpAttackResultState, useValue: state },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PvpAttackResultPage);
    fixture.detectChanges();
  });

  it('loads the attack result id from the route and reacts to parameter changes', () => {
    paramMap.next(convertToParamMap({ attackResultId: 'attack-result-1' }));
    paramMap.next(convertToParamMap({ attackResultId: 'attack-result-2' }));

    expect(state.load).toHaveBeenCalledTimes(2);
    expect(state.load).toHaveBeenCalledWith('attack-result-1');
    expect(state.load).toHaveBeenCalledWith('attack-result-2');
  });

  it('uses player-facing copy for access denied instead of raw technical errors', () => {
    state.status.set('access-denied');
    state.error.set('permission denied for function get_my_pvp_attack_result');

    expect(fixture.componentInstance.errorMessage())
      .toBe('You do not have access to this attack result.');
  });

  it('renders mapped attack result context without raw ids or notification context', () => {
    state.status.set('loaded');
    state.result.set(attackResult());
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Attacker victory');
    expect(text).toContain('Attacker level 10 - winner');
    expect(text).toContain('Drachma');
    expect(text).toContain('+120');
    expect(text).toContain('XP');
    expect(text).toContain('+25');
    expect(text).toContain('Equipment is part of DB/runtime combat resolution');
    expect(text).toContain('Ordinary PvP attacks do not transfer, steal or destroy items.');
    expect(text).not.toContain('active-hero-1');
    expect(text).not.toContain('target-hero-1');
    expect(text).not.toContain('pvp.attack.completed');
    expect(text).not.toContain('Open combat report');
    expect(text).not.toContain('permission denied');
  });
});

class FakePvpAttackResultState {
  readonly result = signal<PvpAttackResult | null>(null);
  readonly status = signal<PvpAttackResultReadStatus>('idle');
  readonly error = signal<string | null>(null);
  readonly requestedAttackResultId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly hasResult = signal(false);
  readonly isUnavailable = signal(false);
  readonly load = jasmine.createSpy('load');
  readonly clear = jasmine.createSpy('clear');
}

function textContent(fixture: ComponentFixture<PvpAttackResultPage>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function attackResult(): PvpAttackResult {
  return {
    attackResultId: 'attack-result-1',
    pvpActionId: 'pvp-action-1',
    serverId: 'server-1',
    createdAt: '2026-05-06T12:00:00Z',
    attacker: {
      heroId: 'active-hero-1',
      levelSnapshot: 10,
    },
    defender: {
      heroId: 'target-hero-1',
      levelSnapshot: 9,
    },
    combatResultId: 'combat-result-1',
    combatOutcome: 'initiator_victory',
    outcomeKey: 'attacker_won',
    outcomeLabel: 'Attacker victory',
    winnerHeroId: 'active-hero-1',
    loserHeroId: 'target-hero-1',
    levelDifference: 1,
    resourceOutcome: { raw: { drachmaDelta: 120 } },
    rewardContext: { raw: { xp: 25 } },
    prestigeContext: { prestigeDelta: 1, future: true },
    reportContext: { raw: { reportId: 'report-1' } },
    notificationContext: { raw: { notificationType: 'pvp.attack.completed' } },
  };
}
