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
});
