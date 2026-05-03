import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { AntiAbuseCaseReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseSanctionStatus,
  CharacterPointPenaltyDecision,
} from '../../../core/domain/anti-abuse/anti-abuse-sanction.model';
import { AntiAbuseDecisions } from '../../../core/services/anti-abuse/anti-abuse-decisions';
import { AntiAbuseCasePenaltyStatusSection } from './anti-abuse-case-penalty-status-section';

describe('AntiAbuseCasePenaltyStatusSection', () => {
  let fixture: ComponentFixture<AntiAbuseCasePenaltyStatusSection>;
  let component: AntiAbuseCasePenaltyStatusSection;
  let decisions: jasmine.SpyObj<AntiAbuseDecisions>;

  beforeEach(async () => {
    decisions = jasmine.createSpyObj<AntiAbuseDecisions>('AntiAbuseDecisions', [
      'setCharacterPointPenaltyStatus',
    ]);

    await TestBed.configureTestingModule({
      imports: [AntiAbuseCasePenaltyStatusSection],
      providers: [{ provide: AntiAbuseDecisions, useValue: decisions }],
    }).compileComponents();

    fixture = TestBed.createComponent(AntiAbuseCasePenaltyStatusSection);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('caseItem', createCase());
    fixture.componentRef.setInput('penalties', [
      createPenalty(),
      createPenalty({
        id: 'penalty-2',
        status: 'applied',
        remainingAmount: 8,
        paidAmount: 2,
        reason: 'Second Character Point fine.',
      }),
    ]);
    fixture.detectChanges();
  });

  it('updates Character Point penalty status through the canonical decision workflow', () => {
    const updated = createPenalty({ status: 'completed', statusReason: 'Paid off.' });
    const emitted: CharacterPointPenaltyDecision[] = [];
    decisions.setCharacterPointPenaltyStatus.and.returnValue(of(updated));
    component.penaltyStatusSaved.subscribe((event) => emitted.push(event));

    component.form.patchValue({
      penaltyId: 'penalty-1',
      status: 'completed',
      statusReason: ' Paid off. ',
    });
    component.submit();

    expect(decisions.setCharacterPointPenaltyStatus).toHaveBeenCalledOnceWith({
      penaltyId: 'penalty-1',
      status: 'completed',
      statusReason: 'Paid off.',
    });
    expect(component.successMessage()).toBe('Character Point penalty status updated.');
    expect(emitted).toEqual([updated]);
  });

  it('requires a status reason before submitting Character Point penalty status updates', () => {
    component.form.patchValue({
      penaltyId: 'penalty-1',
      status: 'forgiven',
      statusReason: ' ',
    });
    component.submit();

    expect(component.error()).toBe('Penalty, status and status reason are required.');
    expect(decisions.setCharacterPointPenaltyStatus).not.toHaveBeenCalled();
  });

  it('ignores stale status successes after case or server context changes', () => {
    const request = new Subject<CharacterPointPenaltyDecision>();
    const emitted: CharacterPointPenaltyDecision[] = [];
    decisions.setCharacterPointPenaltyStatus.and.returnValue(request);
    component.penaltyStatusSaved.subscribe((event) => emitted.push(event));

    component.form.patchValue({
      penaltyId: 'penalty-1',
      status: 'failed',
      statusReason: 'Failed to apply.',
    });
    component.submit();

    fixture.componentRef.setInput('caseItem', createCase('case-1', 'server-2'));
    fixture.detectChanges();
    request.next(createPenalty({ status: 'failed', statusReason: 'Failed to apply.' }));
    request.complete();

    expect(emitted).toEqual([]);
  });

  it('ignores stale status errors after case or server context changes', () => {
    const request = new Subject<CharacterPointPenaltyDecision>();
    decisions.setCharacterPointPenaltyStatus.and.returnValue(request);

    component.form.patchValue({
      penaltyId: 'penalty-1',
      status: 'failed',
      statusReason: 'Failed to apply.',
    });
    component.submit();

    fixture.componentRef.setInput('caseItem', createCase('case-1', 'server-2'));
    fixture.detectChanges();
    request.error(new Error('Old request failed.'));

    expect(component.error()).toBeNull();
  });

  it('ignores stale status errors after selected penalty changes', () => {
    const request = new Subject<CharacterPointPenaltyDecision>();
    decisions.setCharacterPointPenaltyStatus.and.returnValue(request);

    component.form.patchValue({
      penaltyId: 'penalty-1',
      status: 'failed',
      statusReason: 'Failed to apply.',
    });
    component.submit();

    component.form.controls.penaltyId.setValue('penalty-2');
    component.onPenaltyChange();
    request.error(new Error('Old penalty request failed.'));

    expect(component.error()).toBeNull();
  });

  it('ignores stale status successes after selected penalty changes', () => {
    const request = new Subject<CharacterPointPenaltyDecision>();
    const emitted: CharacterPointPenaltyDecision[] = [];
    decisions.setCharacterPointPenaltyStatus.and.returnValue(request);
    component.penaltyStatusSaved.subscribe((event) => emitted.push(event));

    component.form.patchValue({
      penaltyId: 'penalty-1',
      status: 'completed',
      statusReason: 'Completed.',
    });
    component.submit();

    component.form.controls.penaltyId.setValue('penalty-2');
    component.onPenaltyChange();
    request.next(createPenalty({ status: 'completed', statusReason: 'Completed.' }));
    request.complete();

    expect(component.successMessage()).toBeNull();
    expect(emitted).toEqual([]);
  });

  it('resets form feedback when the case context changes', () => {
    decisions.setCharacterPointPenaltyStatus.and.returnValue(
      of(createPenalty({ status: 'completed', statusReason: 'Completed.' })),
    );
    component.form.patchValue({
      penaltyId: 'penalty-1',
      status: 'completed',
      statusReason: 'Completed.',
    });
    component.submit();

    expect(component.successMessage()).toBe('Character Point penalty status updated.');

    fixture.componentRef.setInput('caseItem', createCase('case-2'));
    fixture.detectChanges();

    expect(component.form.controls.statusReason.value).toBeNull();
    expect(component.successMessage()).toBeNull();
    expect(component.error()).toBeNull();
  });

  it('clears stale reason and feedback when the selected penalty changes', () => {
    decisions.setCharacterPointPenaltyStatus.and.returnValue(
      of(createPenalty({ status: 'completed', statusReason: 'Completed.' })),
    );
    component.form.patchValue({
      penaltyId: 'penalty-1',
      status: 'completed',
      statusReason: 'Reason for the first penalty.',
    });
    component.submit();

    expect(component.successMessage()).toBe('Character Point penalty status updated.');

    component.form.patchValue({
      penaltyId: 'penalty-1',
      statusReason: 'Stale reason for penalty one.',
    });
    component.form.controls.penaltyId.setValue('penalty-2');
    component.onPenaltyChange();

    expect(component.form.controls.statusReason.value).toBeNull();
    expect(component.form.controls.status.value).toBe('applied');
    expect(component.successMessage()).toBeNull();
    expect(component.error()).toBeNull();
  });

  it('uses operator-safe penalty option labels with debt context', () => {
    expect(component.penaltyOptions()).toEqual([
      {
        value: 'penalty-1',
        label: 'hero-1 - pending - 20/25 Character Points remaining - Character Point fine.',
      },
      {
        value: 'penalty-2',
        label:
          'hero-1 - applied - 8/25 Character Points remaining - Second Character Point fine.',
      },
    ]);
  });
});

function createCase(
  caseId = 'case-1',
  serverId = 'server-1',
): AntiAbuseCaseReadModel {
  return {
    id: caseId,
    serverId,
    title: 'Case',
    summary: null,
    source: 'manual',
    status: 'open',
    statusReason: null,
    verdict: null,
    verdictReason: null,
    sanctionRequired: null,
    noSanctionReason: null,
    operatorNotes: null,
    groupingKey: null,
    primaryHeroId: null,
    primaryUserId: null,
    assignedToUserId: null,
    openedByUserId: null,
    resolvedByUserId: null,
    signalCount: 0,
    lastSignalAt: null,
    possibleRecidivism: false,
    createdAt: '2026-04-30T00:00:00.000Z',
    updatedAt: '2026-04-30T00:00:00.000Z',
    resolvedAt: null,
    cancelledAt: null,
  };
}

function createPenalty(
  overrides: Partial<CharacterPointPenaltyDecision> = {},
): CharacterPointPenaltyDecision {
  return {
    id: 'penalty-1',
    sanctionId: 'sanction-1',
    caseId: 'case-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    userId: 'user-1',
    status: 'pending' as AntiAbuseSanctionStatus,
    statusReason: null,
    reason: 'Character Point fine.',
    operatorNotes: null,
    totalAmount: 25,
    remainingAmount: 20,
    paidAmount: 5,
    appliedAt: null,
    completedAt: null,
    cancelledAt: null,
    forgivenAt: null,
    failedAt: null,
    createdByUserId: 'staff-1',
    createdAt: '2026-04-30T00:01:00.000Z',
    updatedAt: '2026-04-30T00:01:00.000Z',
    ...overrides,
  };
}
