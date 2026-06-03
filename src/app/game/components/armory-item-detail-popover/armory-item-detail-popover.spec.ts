import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArmoryItemSummary } from '../../../core/domain/item/item-equipment.model';
import { ArmoryItemDetailPopover } from './armory-item-detail-popover';

describe('ArmoryItemDetailPopover', () => {
  let fixture: ComponentFixture<ArmoryItemDetailPopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArmoryItemDetailPopover],
    }).compileComponents();

    fixture = TestBed.createComponent(ArmoryItemDetailPopover);
    fixture.componentRef.setInput('item', armoryItem());
    fixture.detectChanges();
  });

  it('passes armory item identity into the shared item detail popover', () => {
    const popover = (fixture.nativeElement as HTMLElement)
      .querySelector('app-item-detail-popover');

    expect(popover).not.toBeNull();
    expect(fixture.componentInstance.itemName()).toBe('Demonic Dagger');
  });

  it('keeps DB-owned guild armory context for shared detail display', () => {
    fixture.componentRef.setInput('guildContextLabel', 'Deposited in guild armory');
    fixture.componentRef.setInput(
      'guildContextDetail',
      'Withdraw from guild armory before equipping privately.',
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.contextSourceLabel())
      .toBe('Withdraw from guild armory before equipping privately.');
  });
});

function armoryItem(overrides: Partial<ArmoryItemSummary> = {}): ArmoryItemSummary {
  return {
    itemId: 'item-1',
    ownerHeroId: 'hero-1',
    serverId: 'server-1',
    name: 'Demonic Dagger',
    description: null,
    lifecycleStatus: 'active',
    generationBaseId: 'base-1',
    generationQualityKey: 'normal',
    prefixAffixId: 'prefix-1',
    suffixAffixId: null,
    armoryShelfPosition: 1,
    drachmaValue: 300,
    shelfPosition: 1,
    shelfName: 'Vlad\'s items',
    requirementPreview: null,
    ...overrides,
  };
}
