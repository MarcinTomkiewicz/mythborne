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
});
