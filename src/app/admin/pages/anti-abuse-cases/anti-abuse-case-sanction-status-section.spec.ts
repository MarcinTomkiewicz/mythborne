import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { AntiAbuseCaseReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseSanctionDecision,
  AntiAbuseSanctionStatus,
} from '../../../core/domain/anti-abuse/anti-abuse-sanction.model';
import { AntiAbuseDecisions } from '../../../core/services/anti-abuse/anti-abuse-decisions';
import { AntiAbuseCaseSanctionStatusSection } from './anti-abuse-case-sanction-status-section';

describe('AntiAbuseCaseSanctionStatusSection', () => {
  let fixture: ComponentFixture<AntiAbuseCaseSanctionStatusSection>;
  let component: AntiAbuseCaseSanctionStatusSection;
  let decisions: jasmine.SpyObj<AntiAbuseDecisions>;

  beforeEach(async () => {
    decisions = jasmine.createSpyObj<AntiAbuseDecisions>('AntiAbuseDecisions', [
      'setSanctionStatus',
    ]);

    await TestBed.configureTestingModule({
      imports: [AntiAbuseCaseSanctionStatusSection],
      providers: [{ provide: AntiAbuseDecisions, useValue: decisions }],
    }).compileComponents();

    fixture = TestBed.createComponent(AntiAbuseCaseSanctionStatusSection);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('caseItem', createCase());
    fixture.componentRef.setInput('sanctions', [
      createSanction(),
      createSanction({
        id: 'sanction-2',
        sanctionTypeKey: 'suspension',
        status: 'applied',
        reason: 'Second sanction with a different status.',
      }),
    ]);
    fixture.detectChanges();
  });

  it('updates sanction status through the canonical decision workflow', () => {
    const updated = createSanction({ status: 'applied', statusReason: 'Applied now.' });
    const emitted: AntiAbuseSanctionDecision[] = [];
    decisions.setSanctionStatus.and.returnValue(of(updated));
    component.sanctionStatusSaved.subscribe((event) => emitted.push(event));

    component.form.patchValue({
      sanctionId: 'sanction-1',
      status: 'applied',
      statusReason: ' Applied now. ',
    });
    component.submit();

    expect(decisions.setSanctionStatus).toHaveBeenCalledOnceWith({
      sanctionId: 'sanction-1',
      status: 'applied',
      statusReason: 'Applied now.',
    });
    expect(component.successMessage()).toBe('Sanction status updated.');
    expect(emitted).toEqual([updated]);
  });

  it('requires a status reason before submitting cancellation-style updates', () => {
    component.form.patchValue({
      sanctionId: 'sanction-1',
      status: 'cancelled',
      statusReason: ' ',
    });
    component.submit();

    expect(component.error()).toBe('Sanction, status and status reason are required.');
    expect(decisions.setSanctionStatus).not.toHaveBeenCalled();
  });

  it('does not emit stale status responses after case or server context changes', () => {
    const request = new Subject<AntiAbuseSanctionDecision>();
    const emitted: AntiAbuseSanctionDecision[] = [];
    decisions.setSanctionStatus.and.returnValue(request);
    component.sanctionStatusSaved.subscribe((event) => emitted.push(event));

    component.form.patchValue({
      sanctionId: 'sanction-1',
      status: 'failed',
      statusReason: 'Failed to apply.',
    });
    component.submit();

    fixture.componentRef.setInput('caseItem', createCase('case-1', 'server-2'));
    fixture.detectChanges();
    request.next(createSanction({ status: 'failed', statusReason: 'Failed to apply.' }));
    request.complete();

    expect(emitted).toEqual([]);
  });

  it('ignores stale status errors after case or server context changes', () => {
    const request = new Subject<AntiAbuseSanctionDecision>();
    decisions.setSanctionStatus.and.returnValue(request);

    component.form.patchValue({
      sanctionId: 'sanction-1',
      status: 'failed',
      statusReason: 'Failed to apply.',
    });
    component.submit();

    fixture.componentRef.setInput('caseItem', createCase('case-1', 'server-2'));
    fixture.detectChanges();
    request.error(new Error('Old request failed.'));

    expect(component.error()).toBeNull();
  });

  it('ignores stale status errors after selected sanction changes', () => {
    const request = new Subject<AntiAbuseSanctionDecision>();
    decisions.setSanctionStatus.and.returnValue(request);

    component.form.patchValue({
      sanctionId: 'sanction-1',
      status: 'failed',
      statusReason: 'Failed to apply.',
    });
    component.submit();

    component.form.controls.sanctionId.setValue('sanction-2');
    component.onSanctionChange();
    request.error(new Error('Old sanction request failed.'));

    expect(component.error()).toBeNull();
  });

  it('ignores stale status successes after selected sanction changes', () => {
    const request = new Subject<AntiAbuseSanctionDecision>();
    const emitted: AntiAbuseSanctionDecision[] = [];
    decisions.setSanctionStatus.and.returnValue(request);
    component.sanctionStatusSaved.subscribe((event) => emitted.push(event));

    component.form.patchValue({
      sanctionId: 'sanction-1',
      status: 'completed',
      statusReason: 'Completed.',
    });
    component.submit();

    component.form.controls.sanctionId.setValue('sanction-2');
    component.onSanctionChange();
    request.next(createSanction({ status: 'completed', statusReason: 'Completed.' }));
    request.complete();

    expect(component.successMessage()).toBeNull();
    expect(emitted).toEqual([]);
  });

  it('resets form feedback when the case context changes', () => {
    decisions.setSanctionStatus.and.returnValue(
      of(createSanction({ status: 'completed', statusReason: 'Completed.' })),
    );
    component.form.patchValue({
      sanctionId: 'sanction-1',
      status: 'completed',
      statusReason: 'Completed.',
    });
    component.submit();

    expect(component.successMessage()).toBe('Sanction status updated.');

    fixture.componentRef.setInput('caseItem', createCase('case-2'));
    fixture.detectChanges();

    expect(component.form.controls.statusReason.value).toBeNull();
    expect(component.successMessage()).toBeNull();
    expect(component.error()).toBeNull();
  });

  it('clears stale reason and feedback when the selected sanction changes', () => {
    decisions.setSanctionStatus.and.returnValue(
      of(createSanction({ status: 'completed', statusReason: 'Completed.' })),
    );
    component.form.patchValue({
      sanctionId: 'sanction-1',
      status: 'completed',
      statusReason: 'Reason for the first sanction.',
    });
    component.submit();

    expect(component.successMessage()).toBe('Sanction status updated.');

    component.form.patchValue({
      sanctionId: 'sanction-1',
      statusReason: 'Stale reason for sanction one.',
    });
    component.form.controls.sanctionId.setValue('sanction-2');
    component.onSanctionChange();

    expect(component.form.controls.statusReason.value).toBeNull();
    expect(component.form.controls.status.value).toBe('applied');
    expect(component.successMessage()).toBeNull();
    expect(component.error()).toBeNull();
  });

  it('uses operator-safe sanction option labels instead of reason-only labels', () => {
    expect(component.sanctionOptions()).toEqual([
      {
        value: 'sanction-1',
        label: 'warning · pending · hero-1 · Confirmed abuse.',
      },
      {
        value: 'sanction-2',
        label: 'suspension · applied · hero-1 · Second sanction with a different status.',
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

function createSanction(
  overrides: Partial<AntiAbuseSanctionDecision> = {},
): AntiAbuseSanctionDecision {
  return {
    id: 'sanction-1',
    caseId: 'case-1',
    sanctionTypeKey: 'warning',
    status: 'pending' as AntiAbuseSanctionStatus,
    statusReason: null,
    reason: 'Confirmed abuse.',
    operatorNotes: null,
    targetHeroId: 'hero-1',
    targetUserId: 'user-1',
    sourceHeroId: null,
    destinationHeroId: null,
    amountCharacterPoints: null,
    durationDays: null,
    startsAt: null,
    endsAt: null,
    appliedAt: null,
    completedAt: null,
    cancelledAt: null,
    forgivenAt: null,
    failedAt: null,
    imposedByUserId: 'staff-1',
    createdAt: '2026-04-30T00:01:00.000Z',
    updatedAt: '2026-04-30T00:01:00.000Z',
    ...overrides,
  };
}
