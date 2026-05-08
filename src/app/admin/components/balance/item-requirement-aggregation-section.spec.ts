import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  EditableItemGenerationQuality,
  ItemRequirementAggregationSettings,
} from '../../../core/domain/item/item-generation-admin.model';
import { ItemRequirementAggregationSection } from './item-requirement-aggregation-section';

describe('ItemRequirementAggregationSection', () => {
  let fixture: ComponentFixture<ItemRequirementAggregationSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemRequirementAggregationSection],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemRequirementAggregationSection);
    fixture.componentRef.setInput('aggregationSettings', aggregationSettings());
    fixture.componentRef.setInput('qualities', qualities());
    fixture.detectChanges();
  });

  it('renders DB-owned aggregation settings and separates quality multipliers', () => {
    const text = textContent(fixture);

    expect(text).toContain('Item requirement aggregation');
    expect(text).toContain('Highest component + additional fraction');
    expect(text).toContain('0.5');
    expect(text).toContain('Base contribution');
    expect(text).toContain('Prefix contribution');
    expect(text).toContain('Suffix contribution');
    expect(text).toContain('Value/bonus multiplier');
    expect(text).toContain('x1.5');
    expect(text).toContain('Requirement multiplier');
    expect(text).toContain('x1.25');
    expect(text).toContain('does not create per-item instance requirements');
  });
});

function aggregationSettings(): ItemRequirementAggregationSettings {
  return {
    additionalRequirementFraction: 0.5,
    minRequiredValue: 1,
    roundingMode: 'ceil',
    isActive: true,
    updatedAt: '2026-05-08T10:00:00.000Z',
    updatedBy: 'user-1',
  };
}

function qualities(): EditableItemGenerationQuality[] {
  return [{
    id: 'quality-1',
    key: 'quality',
    label: 'Quality',
    multiplier: 1.5,
    requirementMultiplier: 1.25,
    weight: 25,
    sortOrder: 20,
    isEnabled: true,
  }];
}

function textContent(fixture: ComponentFixture<ItemRequirementAggregationSection>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}
