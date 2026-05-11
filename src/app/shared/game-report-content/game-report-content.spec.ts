import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameReportContent } from './game-report-content';

describe('GameReportContent', () => {
  let fixture: ComponentFixture<GameReportContent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GameReportContent);
    fixture.componentRef.setInput('participantsTitle', 'Participants');
    fixture.componentRef.setInput('participantsText', 'Participants text');
    fixture.componentRef.setInput('itemReferencesTitle', 'Items');
    fixture.componentRef.setInput('itemReferencesText', 'Items text');
    fixture.componentRef.setInput('combatSectionTitle', 'Combat');
    fixture.componentRef.setInput('combatSectionText', 'Combat text');
  });

  it('renders safe item display details without raw component ids', () => {
    fixture.componentRef.setInput('report', {
      participants: [],
      itemReferences: [
        {
          sourceKind: 'reward_drop',
          displayName: 'Fine Bronze Blade',
          qualityKey: 'fine',
          displayDetails: ['Fine quality', 'Bronze blade', 'Dawn suffix'],
          sortOrder: 10,
        },
      ],
      combatSection: null,
      contextualReadiness: null,
    });

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Fine Bronze Blade');
    expect(text).toContain('Reward drop');
    expect(text).toContain('Fine quality');
    expect(text).toContain('Bronze blade');
    expect(text).toContain('Dawn suffix');
    expect(text).not.toContain('base-1');
    expect(text).not.toContain('prefix-1');
    expect(text).not.toContain('suffix-1');
  });

  it('renders contextual readiness only when safe report payload is unavailable', () => {
    fixture.componentRef.setInput('report', {
      participants: [],
      itemReferences: [],
      combatSection: null,
      contextualReadiness: {
        reportTypeKey: 'trial',
        title: 'Trial report producer pending',
        producerStatus: 'Waiting for completed trial result producer.',
        expectedSections: [
          'Trial outcome',
          'Reward summary',
          'Optional combat section',
        ],
      },
    });

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Trial report producer pending');
    expect(text).toContain('Trial outcome');
    expect(text).toContain('Reward summary');
    expect(text).not.toContain('trial_attempt');
    expect(text).not.toContain('exploration_graph');
  });

  it('does not show contextual readiness when report content exists', () => {
    fixture.componentRef.setInput('report', {
      participants: [
        {
          displayName: 'Hero One',
          participantRole: 'participant',
          sideLabel: null,
          levelSnapshot: 7,
          sortOrder: 10,
        },
      ],
      itemReferences: [],
      combatSection: null,
      contextualReadiness: {
        reportTypeKey: 'encounter',
        title: 'Encounter report producer pending',
        producerStatus: 'Waiting for completed encounter result producer.',
        expectedSections: ['Encounter outcome'],
      },
    });

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Hero One');
    expect(text).not.toContain('Encounter report producer pending');
  });

  it('renders PvP combat reports through the existing combat section renderer', () => {
    fixture.componentRef.setInput('report', {
      participants: [],
      itemReferences: [],
      combatSection: {
        sourceType: 'pvp',
        outcome: 'initiator_victory',
        winnerSide: 'attacker',
        loserSide: 'defender',
        turnsCompleted: 1,
        startedAt: null,
        completedAt: null,
        participants: [
          {
            side: 'attacker',
            participantKind: 'hero',
            displayName: 'Attacker',
            level: 10,
            healthStart: 30,
            healthEnd: 12,
            maxHealth: 30,
            defense: null,
            minDamage: null,
            maxDamage: null,
            luck: null,
            criticalChance: null,
            criticalDamage: null,
            evasionChance: null,
            stats: [],
          },
          {
            side: 'defender',
            participantKind: 'hero',
            displayName: 'Defender',
            level: 9,
            healthStart: 28,
            healthEnd: 0,
            maxHealth: 28,
            defense: null,
            minDamage: null,
            maxDamage: null,
            luck: null,
            criticalChance: null,
            criticalDamage: null,
            evasionChance: null,
            stats: [],
          },
        ],
        attacks: [
          {
            turnNumber: 1,
            attackOrder: 10,
            actorSide: 'attacker',
            targetSide: 'defender',
            sourceKind: 'item',
            sourceLabel: 'Bronze blade',
            timingHit: true,
            evaded: false,
            critical: false,
            criticalDamage: null,
            rolledDamage: 8,
            finalDamage: 8,
            targetHealthBefore: 28,
            targetHealthAfter: 20,
            displayText: 'Attacker strikes Defender.',
          },
        ],
      },
      contextualReadiness: {
        reportTypeKey: 'pvp_combat',
        title: 'PvP combat report content pending',
        producerStatus: 'Waiting for PvP combat report content.',
        expectedSections: ['Combat section'],
      },
    });

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('pvp');
    expect(text).toContain('initiator_victory');
    expect(text).toContain('Attacker');
    expect(text).toContain('Defender');
    expect(text).toContain('Attacker strikes Defender.');
    expect(text).not.toContain('PvP combat report content pending');
    expect(text).not.toContain('pvp_attack_results');
  });

  it('renders DB-owned Trial story sections before related combat reports', () => {
    fixture.componentRef.setInput('report', {
      participants: [],
      itemReferences: [],
      trialSection: {
        sectionKind: 'trial',
        title: 'Trial completed',
        summary: 'Hero One survived the arena.',
        badge: 'Success',
        facts: [{ label: 'Outcome', value: 'Victory' }],
        items: [],
      },
      encounterSection: null,
      effectSection: null,
      rewardSection: {
        sectionKind: 'reward',
        title: 'Reward',
        summary: 'The DB granted the trial reward.',
        badge: null,
        facts: [],
        items: [
          {
            label: 'Experience',
            value: '70 EXP',
            details: ['70 Character Points', 'Reward blade'],
          },
        ],
      },
      combatSection: {
        sourceType: 'trial',
        outcome: 'initiator_victory',
        winnerSide: 'hero',
        loserSide: 'opponent',
        turnsCompleted: 1,
        startedAt: null,
        completedAt: null,
        participants: [],
        attacks: [
          {
            turnNumber: 1,
            attackOrder: 10,
            actorSide: 'hero',
            targetSide: 'opponent',
            sourceKind: 'item',
            sourceLabel: null,
            timingHit: true,
            evaded: false,
            critical: false,
            criticalDamage: null,
            rolledDamage: 8,
            finalDamage: 8,
            targetHealthBefore: 8,
            targetHealthAfter: 0,
            displayText: 'Hero One ends the fight.',
          },
        ],
      },
      relatedReports: [
        {
          reportId: 'combat-report-1',
          publicToken: 'combat-token-1',
          reportTypeKey: 'combat',
          reportTypeLabel: 'Combat',
          title: 'Combat detail',
          summary: 'Technical combat report.',
          relationLabel: 'Embedded combat',
        },
      ],
      contextualReadiness: null,
    });

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Trial completed');
    expect(text).toContain('Hero One survived the arena.');
    expect(text).toContain('Outcome: Victory');
    expect(text).toContain('Reward');
    expect(text).toContain('70 EXP');
    expect(text).toContain('Hero One ends the fight.');
    expect(text).toContain('Combat detail');
    expect(text).not.toContain('No combat section for this report');
    expect(text).not.toContain('sourceLabel must be a non-empty string');
  });

  it('renders effect sections for Buff and Debuff encounters without requiring rewards', () => {
    fixture.componentRef.setInput('report', {
      participants: [],
      itemReferences: [],
      trialSection: null,
      encounterSection: {
        sectionKind: 'encounter',
        title: 'Buff Encounter resolved',
        summary: 'The encounter applied an exploration effect.',
        badge: 'Buff',
        facts: [],
        items: [],
      },
      effectSection: {
        sectionKind: 'effect',
        title: 'Applied effect',
        summary: 'Blessing remains active for this exploration.',
        badge: 'Active',
        facts: [{ label: 'Effect', value: 'Blessing' }],
        items: [],
      },
      rewardSection: null,
      combatSection: null,
      relatedReports: [],
      contextualReadiness: null,
    });

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Buff Encounter resolved');
    expect(text).toContain('Applied effect');
    expect(text).toContain('Effect: Blessing');
    expect(text).not.toContain('Reward assignment lookup');
  });
});
