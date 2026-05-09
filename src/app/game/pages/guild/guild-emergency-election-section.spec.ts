import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  GuildEmergencyElectionCandidate,
  GuildEmergencyElectionOperationResult,
  GuildEmergencyElectionSummary,
} from '../../../core/domain/guild/guild-emergency-election.model';
import { GuildEmergencyElectionState } from '../../../core/services/guild/guild-emergency-election.state';
import { ToastService } from '../../../core/services/ui/toast';
import { GuildEmergencyElectionSection } from './guild-emergency-election-section';

describe('GuildEmergencyElectionSection', () => {
  let fixture: ComponentFixture<GuildEmergencyElectionSection>;
  let election: FakeGuildEmergencyElectionState;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    election = new FakeGuildEmergencyElectionState();
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [GuildEmergencyElectionSection],
      providers: [
        { provide: GuildEmergencyElectionState, useValue: election },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GuildEmergencyElectionSection);
  });

  it('loads emergency election state', () => {
    fixture.detectChanges();

    expect(election.load).toHaveBeenCalled();
  });

  it('renders active election summary, timestamps and candidate rows without local result semantics', () => {
    election.summary.set(summary({
      canNominate: true,
      canStartVoting: true,
      canVote: true,
      canFinalize: true,
    }));
    election.candidates.set([candidate()]);

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Emergency election');
    expect(text).toContain('nomination');
    expect(text).toContain('Inactive Leader');
    expect(text).toContain('1 / 3');
    expect(text).toContain('2026-05-09T10:00:00.000Z - 2026-05-09T11:00:00.000Z');
    expect(text).toContain('Candidate Hero');
    expect(text).toContain('Nominated by: Nominator Hero');
    expect(text).toContain('Nominate');
    expect(text).toContain('Start voting');
    expect(text).toContain('Vote');
    expect(text).toContain('Finalize');
    expect(text).not.toContain('quorum');
    expect(text).not.toContain('50%');
    expect(text).not.toContain('winner');
  });

  it('renders start action only when current guild permissions allow it and no election is active', () => {
    election.canStartElection.set(true);

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('No active emergency election.');
    expect(text).toContain('Start emergency election');
  });

  it('wires election actions through emergency election state', () => {
    election.canStartElection.set(true);
    election.summary.set(summary({
      canNominate: true,
      canStartVoting: true,
      canVote: true,
      canFinalize: true,
    }));
    election.candidates.set([candidate()]);
    fixture.detectChanges();
    fixture.componentInstance.startForm.controls.reason.setValue(' Leader inactive. ');
    fixture.componentInstance.nominateForm.controls.candidateHeroId.setValue(' candidate-hero-2 ');
    fixture.componentInstance.nominateForm.controls.reason.setValue(' Good fit. ');
    fixture.componentInstance.actionReasonForm.controls.reason.setValue(' Move on. ');

    fixture.componentInstance.startElection();
    fixture.componentInstance.nominateCandidate();
    fixture.componentInstance.startVoting();
    fixture.componentInstance.vote(candidate());
    fixture.componentInstance.finalizeElection();

    expect(election.start).toHaveBeenCalledWith({ reason: 'Leader inactive.' });
    expect(election.nominate).toHaveBeenCalledWith({
      electionId: 'election-1',
      candidateHeroId: 'candidate-hero-2',
      reason: 'Good fit.',
    });
    expect(election.startVoting).toHaveBeenCalledWith({
      electionId: 'election-1',
      reason: 'Move on.',
    });
    expect(election.vote).toHaveBeenCalledWith({
      electionId: 'election-1',
      candidateHeroId: 'candidate-hero-1',
      reason: 'Move on.',
    });
    expect(election.finalize).toHaveBeenCalledWith({
      electionId: 'election-1',
      reason: 'Move on.',
    });
  });

  it('blocks whitespace-only candidate nomination before calling state action', () => {
    election.summary.set(summary({ canNominate: true }));
    fixture.detectChanges();
    fixture.componentInstance.nominateForm.controls.candidateHeroId.setValue('   ');

    fixture.componentInstance.nominateCandidate();
    fixture.detectChanges();

    expect(election.nominate).not.toHaveBeenCalled();
    expect(textContent(fixture)).toContain('Candidate hero id is required.');
  });

  it('keeps read errors inline and transient action feedback in toast', () => {
    fixture.detectChanges();

    election.error.set('Failed to load guild emergency election.');
    fixture.detectChanges();

    expect(textContent(fixture)).toContain('Failed to load guild emergency election.');

    election.canStartElection.set(true);
    fixture.componentInstance.startElection();
    election.error.set('Leader is still active.');
    fixture.detectChanges();
    election.error.set(null);
    fixture.componentInstance.startElection();
    election.message.set('Guild emergency election started.');
    fixture.detectChanges();

    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild emergency election failed',
      'Leader is still active.',
    );
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Guild emergency election',
      'Guild emergency election started.',
    );
    expect(textContent(fixture)).not.toContain('Leader is still active.');
  });
});

class FakeGuildEmergencyElectionState {
  readonly summary = signal<GuildEmergencyElectionSummary | null>(null);
  readonly candidates = signal<GuildEmergencyElectionCandidate[]>([]);
  readonly lastResult = signal<GuildEmergencyElectionOperationResult | null>(null);
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly canStartElection = signal(false);
  readonly load = jasmine.createSpy('load');
  readonly start = jasmine.createSpy('start');
  readonly nominate = jasmine.createSpy('nominate');
  readonly startVoting = jasmine.createSpy('startVoting');
  readonly vote = jasmine.createSpy('vote');
  readonly finalize = jasmine.createSpy('finalize');
}

function textContent(fixture: ComponentFixture<GuildEmergencyElectionSection>): string {
  return fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();
}

function summary(
  overrides: Partial<GuildEmergencyElectionSummary> = {},
): GuildEmergencyElectionSummary {
  return {
    electionId: 'election-1',
    guildId: 'guild-1',
    statusKey: 'nomination',
    inactiveLeaderHeroId: 'leader-hero-1',
    inactiveLeaderHeroName: 'Inactive Leader',
    startedByHeroId: 'starter-hero-1',
    startedByHeroName: 'Starter Hero',
    nominationStartsAt: '2026-05-09T10:00:00.000Z',
    nominationEndsAt: '2026-05-09T11:00:00.000Z',
    votingStartsAt: null,
    votingEndsAt: null,
    nominationCount: 1,
    voteCount: 0,
    maxCandidates: 3,
    myVoteCandidateHeroId: null,
    canNominate: false,
    canStartVoting: false,
    canVote: false,
    canFinalize: false,
    ...overrides,
  };
}

function candidate(
  overrides: Partial<GuildEmergencyElectionCandidate> = {},
): GuildEmergencyElectionCandidate {
  return {
    electionId: 'election-1',
    guildId: 'guild-1',
    nominationId: 'nomination-1',
    candidateHeroId: 'candidate-hero-1',
    candidateHeroName: 'Candidate Hero',
    nominatedByHeroId: 'nominator-hero-1',
    nominatedByHeroName: 'Nominator Hero',
    createdAt: '2026-05-09T10:15:00.000Z',
    voteCount: 2,
    isMyCandidate: false,
    isMyVote: false,
    ...overrides,
  };
}
