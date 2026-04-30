import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AntiAbuseCaseReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseSanctionTypeEntry } from '../../../core/domain/anti-abuse/anti-abuse-dictionary.model';
import {
  AntiAbuseSanctionDecision,
  AntiAbuseSanctionItemDecision,
  CharacterPointPenaltyDecision,
} from '../../../core/domain/anti-abuse/anti-abuse-sanction.model';
import {
  ModerationHeroTarget,
  ModerationItemTarget,
} from '../../../core/domain/moderation/moderation-action.model';
import { AntiAbuseDecisions } from '../../../core/services/anti-abuse/anti-abuse-decisions';
import { ModerationActions } from '../../../core/services/moderation/moderation-actions';
import { AntiAbuseCaseSanctionCreateSection } from './anti-abuse-case-sanction-create-section';

describe('AntiAbuseCaseSanctionCreateSection', () => {
  let fixture: ComponentFixture<AntiAbuseCaseSanctionCreateSection>;
  let component: AntiAbuseCaseSanctionCreateSection;
  let decisions: jasmine.SpyObj<AntiAbuseDecisions>;
  let moderationActions: jasmine.SpyObj<ModerationActions>;

  beforeEach(async () => {
    decisions = jasmine.createSpyObj<AntiAbuseDecisions>('AntiAbuseDecisions', [
      'createSanction',
      'createCharacterPointPenalty',
      'addSanctionItem',
    ]);
    moderationActions = jasmine.createSpyObj<ModerationActions>('ModerationActions', [
      'canSearchTargets',
      'searchHeroTargets',
      'searchItemTargets',
      'searchUserTargets',
    ]);
    moderationActions.canSearchTargets.and.returnValue(of(true));
    moderationActions.searchHeroTargets.and.returnValue(of([]));
    moderationActions.searchItemTargets.and.returnValue(of([]));
    moderationActions.searchUserTargets.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AntiAbuseCaseSanctionCreateSection],
      providers: [
        { provide: AntiAbuseDecisions, useValue: decisions },
        { provide: ModerationActions, useValue: moderationActions },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AntiAbuseCaseSanctionCreateSection);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('caseItem', createCase());
    fixture.componentRef.setInput('sanctionTypes', createSanctionTypes());
    fixture.componentRef.setInput('canTriageAntiAbuse', true);
    fixture.detectChanges();
  });

  it('creates a warning sanction through the canonical decision workflow', () => {
    const emitted: unknown[] = [];
    decisions.createSanction.and.returnValue(of(createSanction()));
    component.sanctionCreated.subscribe((event) => emitted.push(event));

    component.state.form.patchValue({
      sanctionTypeKey: 'warning',
      reason: 'Confirmed rule abuse.',
      operatorNotes: 'Internal context.',
    });
    component.onSanctionTypeChange();
    component.selectTargetHero(createHeroTarget());
    component.state.submit();

    expect(decisions.createSanction).toHaveBeenCalledOnceWith({
      caseId: 'case-1',
      sanctionTypeKey: 'warning',
      targetHeroId: 'hero-2',
      targetUserId: 'user-2',
      reason: 'Confirmed rule abuse.',
      operatorNotes: 'Internal context.',
      sourceHeroId: null,
      amountCharacterPoints: null,
      durationDays: null,
    });
    expect(decisions.createCharacterPointPenalty).not.toHaveBeenCalled();
    expect(decisions.addSanctionItem).not.toHaveBeenCalled();
    expect(emitted.length).toBe(1);
  });

  it('creates a Character Point penalty when the sanction type requires an amount', () => {
    decisions.createSanction.and.returnValue(of(createSanction()));
    decisions.createCharacterPointPenalty.and.returnValue(of(createPenalty()));

    component.state.form.patchValue({
      sanctionTypeKey: 'character_point_fine',
      reason: 'Confirmed point abuse.',
      amountCharacterPoints: 25,
      operatorNotes: 'Penalty context.',
    });
    component.onSanctionTypeChange();
    component.selectTargetHero(createHeroTarget());
    component.state.submit();

    expect(decisions.createSanction).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        sanctionTypeKey: 'character_point_fine',
        amountCharacterPoints: 25,
      }),
    );
    expect(decisions.createCharacterPointPenalty).toHaveBeenCalledOnceWith({
      sanctionId: 'sanction-1',
      reason: 'Confirmed point abuse.',
      operatorNotes: 'Penalty context.',
    });
  });

  it('adds sanction item links for item sanctions', () => {
    decisions.createSanction.and.returnValue(of(createSanction()));
    decisions.addSanctionItem.and.returnValue(of(createSanctionItem()));

    component.state.form.patchValue({
      sanctionTypeKey: 'item_recovery',
      reason: 'Item transfer abuse.',
    });
    component.onSanctionTypeChange();
    component.selectSourceHero(createHeroTarget('hero-1', 'user-1'));
    component.selectTargetHero(createHeroTarget());
    component.selectItem(createItemTarget('item-1'));
    component.selectItem(createItemTarget('item-2'));
    component.selectItem(createItemTarget('item-1'));
    component.state.submit();

    expect(decisions.addSanctionItem).toHaveBeenCalledTimes(2);
    expect(decisions.addSanctionItem.calls.argsFor(0)[0]).toEqual({
      sanctionId: 'sanction-1',
      itemId: 'item-1',
      reason: 'Item transfer abuse.',
      operatorNotes: null,
      sourceHeroId: 'hero-1',
      destinationHeroId: 'hero-2',
    });
    expect(decisions.addSanctionItem.calls.argsFor(1)[0].itemId).toBe('item-2');
  });

  it('requires dynamic fields before submitting sanction-specific workflows', () => {
    component.state.form.patchValue({
      sanctionTypeKey: 'suspension',
      reason: 'Temporary restriction.',
    });
    component.onSanctionTypeChange();
    component.selectTargetHero(createHeroTarget());
    component.state.submit();

    expect(component.state.error()).toBe(
      'Duration in days is required for this sanction type.',
    );
    expect(decisions.createSanction).not.toHaveBeenCalled();
  });

  it('sets and clears both target hero and target account from hero target search', () => {
    component.selectTargetHero(createHeroTarget());

    expect(component.state.form.controls.targetHeroId.value).toBe('hero-2');
    expect(component.state.form.controls.targetUserId.value).toBe('user-2');

    component.state.clearTargetHero();

    expect(component.state.form.controls.targetHeroId.value).toBeNull();
    expect(component.state.form.controls.targetUserId.value).toBeNull();
  });

  it('does not emit a stale sanction result after the case or server context changes', () => {
    const request = new Subject<AntiAbuseSanctionDecision>();
    const emitted: unknown[] = [];
    decisions.createSanction.and.returnValue(request);
    component.sanctionCreated.subscribe((event) => emitted.push(event));

    component.state.form.patchValue({
      sanctionTypeKey: 'warning',
      reason: 'Confirmed rule abuse.',
    });
    component.onSanctionTypeChange();
    component.selectTargetHero(createHeroTarget());
    component.state.submit();

    fixture.componentRef.setInput('caseItem', createCase('case-1', 'server-2'));
    fixture.detectChanges();
    request.next(createSanction());
    request.complete();

    expect(emitted).toEqual([]);
  });

  it('does not leak hidden item/source fields after changing sanction type', () => {
    decisions.createSanction.and.returnValue(of(createSanction()));

    component.state.form.patchValue({
      sanctionTypeKey: 'item_recovery',
      reason: 'Item transfer abuse.',
    });
    component.onSanctionTypeChange();
    component.selectTargetHero(createHeroTarget());
    component.selectSourceHero(createHeroTarget('hero-1', 'user-1'));
    component.selectItem(createItemTarget('item-1'));

    component.state.form.controls.sanctionTypeKey.setValue('warning');
    component.onSanctionTypeChange();
    component.state.submit();

    expect(decisions.createSanction).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        sanctionTypeKey: 'warning',
        sourceHeroId: null,
      }),
    );
    expect(decisions.addSanctionItem).not.toHaveBeenCalled();
  });

  it('resets target controls and form state when the case context changes', () => {
    component.state.form.patchValue({
      reason: 'Context-specific reason.',
      operatorNotes: 'Context-specific notes.',
    });
    component.selectTargetHero(createHeroTarget());
    component.selectSourceHero(createHeroTarget('hero-1', 'user-1'));
    component.selectItem(createItemTarget('item-1'));

    fixture.componentRef.setInput('caseItem', createCase('case-2'));
    fixture.detectChanges();

    expect(component.state.form.controls.reason.value).toBeNull();
    expect(component.state.form.controls.operatorNotes.value).toBeNull();
    expect(component.state.form.controls.targetHeroId.value).toBeNull();
    expect(component.state.form.controls.targetUserId.value).toBeNull();
    expect(component.state.form.controls.sourceHeroId.value).toBeNull();
    expect(component.state.targetSearch.heroTargetControl.value).toBeNull();
    expect(component.state.sourceSearch.heroTargetControl.value).toBeNull();
    expect(component.state.itemSearch.selectedItemTargets()).toEqual([]);
  });

  it('rejects invalid optional number values instead of silently sending null', () => {
    component.state.form.patchValue({
      sanctionTypeKey: 'character_point_fine',
      reason: 'Confirmed point abuse.',
      amountCharacterPoints: -1,
    });
    component.onSanctionTypeChange();
    component.selectTargetHero(createHeroTarget());
    component.state.submit();

    expect(component.state.error()).toBe(
      'Character Points amount must be a positive whole number.',
    );
    expect(decisions.createSanction).not.toHaveBeenCalled();

    component.state.form.controls.amountCharacterPoints.setValue(1.5);
    component.state.submit();

    expect(component.state.error()).toBe(
      'Character Points amount must be a positive whole number.',
    );
    expect(decisions.createSanction).not.toHaveBeenCalled();
  });

  it('emits partial success and refreshes when linked records fail after sanction creation', () => {
    const emitted: unknown[] = [];
    decisions.createSanction.and.returnValue(of(createSanction()));
    decisions.createCharacterPointPenalty.and.returnValue(
      throwError(() => new Error('Penalty failed')),
    );
    component.sanctionCreated.subscribe((event) => emitted.push(event));

    component.state.form.patchValue({
      sanctionTypeKey: 'character_point_fine',
      reason: 'Confirmed point abuse.',
      amountCharacterPoints: 25,
    });
    component.onSanctionTypeChange();
    component.selectTargetHero(createHeroTarget());
    component.state.submit();

    expect(component.state.successMessage()).toContain('Sanction was created');
    expect(emitted.length).toBe(1);
  });
});

function createCase(caseId = 'case-1', serverId = 'server-1'): AntiAbuseCaseReadModel {
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

function createSanctionTypes(): AntiAbuseSanctionTypeEntry[] {
  return [
    createSanctionType('warning', 'Warning'),
    createSanctionType('suspension', 'Suspension', { requiresDurationDays: true }),
    createSanctionType('character_point_fine', 'Character Point fine', {
      requiresCharacterPointsAmount: true,
    }),
    createSanctionType('item_recovery', 'Item recovery', {
      requiresSourceHero: true,
      requiresItemSelection: true,
    }),
  ];
}

function createSanctionType(
  key: string,
  label: string,
  overrides: Partial<AntiAbuseSanctionTypeEntry> = {},
): AntiAbuseSanctionTypeEntry {
  return {
    key,
    label,
    description: `${label} description.`,
    helperText: `${label} helper.`,
    adminDescription: `${label} admin description.`,
    category: 'case',
    sortOrder: 10,
    isActive: true,
    requiresReason: true,
    requiresTargetHero: true,
    requiresSourceHero: false,
    requiresDurationDays: false,
    requiresItemSelection: false,
    requiresCharacterPointsAmount: false,
    ...overrides,
  };
}

function createHeroTarget(heroId = 'hero-2', userId = 'user-2'): ModerationHeroTarget {
  return {
    heroId,
    heroName: `Target Hero ${heroId}`,
    userId,
    userDisplayName: 'Target Account',
    email: 'target@example.com',
    hasVisibleModerationHistory: false,
    matchKind: 'hero_name',
    technicalLabel: heroId,
    label: 'Target Hero',
    description: 'Target Account / target@example.com',
  };
}

function createItemTarget(itemId: string): ModerationItemTarget {
  return {
    itemId,
    itemDisplayName: `Item ${itemId}`,
    itemStatus: 'active',
    itemValue: 100,
    ownerHeroId: 'hero-1',
    ownerHeroName: 'Source Hero',
    ownerUserId: 'user-1',
    ownerDisplayName: 'Source Account',
    relatedAuctionListingId: null,
    relatedTradeOfferId: null,
    matchKind: 'item_id',
    technicalLabel: itemId,
    label: `Item ${itemId}`,
    description: `Source Hero | ${itemId}`,
  };
}

function createSanction(): AntiAbuseSanctionDecision {
  return {
    id: 'sanction-1',
    caseId: 'case-1',
    sanctionTypeKey: 'warning',
    status: 'pending',
    statusReason: null,
    reason: 'Confirmed rule abuse.',
    operatorNotes: null,
    targetHeroId: 'hero-2',
    targetUserId: 'user-2',
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
  };
}

function createPenalty(): CharacterPointPenaltyDecision {
  return {
    id: 'penalty-1',
    sanctionId: 'sanction-1',
    caseId: 'case-1',
    serverId: 'server-1',
    heroId: 'hero-2',
    userId: 'user-2',
    status: 'pending',
    statusReason: null,
    reason: 'Confirmed point abuse.',
    operatorNotes: 'Penalty context.',
    totalAmount: 25,
    remainingAmount: 25,
    paidAmount: 0,
    appliedAt: null,
    completedAt: null,
    cancelledAt: null,
    forgivenAt: null,
    failedAt: null,
    createdByUserId: 'staff-1',
    createdAt: '2026-04-30T00:02:00.000Z',
    updatedAt: '2026-04-30T00:02:00.000Z',
  };
}

function createSanctionItem(): AntiAbuseSanctionItemDecision {
  return {
    id: 'sanction-item-1',
    sanctionId: 'sanction-1',
    itemId: 'item-1',
    sourceHeroId: 'hero-1',
    destinationHeroId: 'hero-2',
    reason: 'Item transfer abuse.',
    operatorNotes: null,
    createdByUserId: 'staff-1',
    createdAt: '2026-04-30T00:03:00.000Z',
  };
}
