import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ArmoryItemDetailReadModel } from '../../core/domain/item/item-equipment.model';
import { ItemDetailReader } from '../../core/services/items/item-detail-reader';
import { ItemDetailPopover } from './item-detail-popover';

describe('ItemDetailPopover', () => {
  let fixture: ComponentFixture<ItemDetailPopover>;
  let reader: jasmine.SpyObj<ItemDetailReader>;

  beforeEach(async () => {
    reader = jasmine.createSpyObj<ItemDetailReader>('ItemDetailReader', [
      'readItemDetail',
    ]);
    reader.readItemDetail.and.returnValue(of(demonicDaggerDetail()));

    await TestBed.configureTestingModule({
      imports: [ItemDetailPopover],
      providers: [
        { provide: ItemDetailReader, useValue: reader },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailPopover);
    fixture.componentRef.setInput('itemId', 'item-1');
    fixture.componentRef.setInput('fallbackName', 'Demonic Dagger');
    fixture.detectChanges();
  });

  it('loads full DB-backed item detail through the global reader', () => {
    fixture.componentInstance.openFromPointer(
      new MouseEvent('click'),
      { show: jasmine.createSpy('show') } as never,
    );
    fixture.detectChanges();

    expect(reader.readItemDetail).toHaveBeenCalledWith('item-1');
    expect(fixture.componentInstance.item()).toEqual(jasmine.objectContaining({
      name: 'Demonic Dagger',
      drachmaValue: 300,
      qualityLabel: 'Normal',
      kindLabel: 'One Handed',
      slotLabel: 'Hands',
      nativeStats: [jasmine.objectContaining({
        label: 'Damage',
        displayValue: '4-14',
        valueParts: [
          { text: '4', tone: 'neutral' },
          { text: '-', tone: 'neutral' },
          { text: '14', tone: 'positive' },
        ],
      })],
      bonusRows: [
        jasmine.objectContaining({ label: 'Critical chance' }),
        jasmine.objectContaining({ label: 'Maximum damage' }),
      ],
      requirementState: jasmine.objectContaining({ kind: 'not_met' }),
    }));
  });

  it('reuses loaded full detail across repeated hover opens', () => {
    const popover = { show: jasmine.createSpy('show') } as never;

    fixture.componentInstance.openFromPointer(new MouseEvent('mouseenter'), popover);
    fixture.componentInstance.openFromPointer(new MouseEvent('mouseenter'), popover);
    fixture.detectChanges();

    expect(reader.readItemDetail).toHaveBeenCalledTimes(1);
  });

  it('shows a full-detail error when the reader cannot load the item', () => {
    reader.readItemDetail.and.returnValue(throwError(() => new Error('No detail row.')));

    fixture.componentInstance.openFromClick(
      new MouseEvent('click'),
      { show: jasmine.createSpy('show') } as never,
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.item().error).toBe('Full item detail unavailable.');
  });

  it('uses safe partial data for snapshot contexts without reading current detail', () => {
    fixture.componentRef.setInput('contextKind', 'auction_snapshot');
    fixture.componentRef.setInput('detailMode', 'partial');
    fixture.componentRef.setInput('qualityLabel', 'Fine');
    fixture.componentRef.setInput('detailLines', ['Base: Bronze blade']);
    fixture.detectChanges();

    fixture.componentInstance.openFromClick(
      new MouseEvent('click'),
      { show: jasmine.createSpy('show') } as never,
    );
    fixture.detectChanges();

    expect(reader.readItemDetail).not.toHaveBeenCalled();
    expect(fixture.componentInstance.item()).toEqual(jasmine.objectContaining({
      name: 'Demonic Dagger',
      qualityLabel: 'Fine',
      nativeStats: [jasmine.objectContaining({ label: 'Base: Bronze blade' })],
      requirementState: jasmine.objectContaining({ kind: 'unknown' }),
      context: jasmine.objectContaining({ kind: 'auction_snapshot' }),
      error: null,
    }));
  });
});

function demonicDaggerDetail(
  overrides: Partial<ArmoryItemDetailReadModel> = {},
): ArmoryItemDetailReadModel {
  return {
    itemId: 'item-1',
    heroId: 'hero-1',
    serverId: 'server-1',
    name: 'Demonic Dagger',
    lifecycleStatus: 'active',
    qualityLabel: 'Normal',
    baseLabel: 'Dagger',
    baseTypeKey: 'one_handed_weapon',
    prefixLabel: 'Demonic',
    suffixLabel: null,
    shelfName: 'Vlad\'s items',
    shelfPosition: 1,
    drachmaValue: 300,
    itemStats: [{ statKey: 'damage', label: 'Damage', displayValue: '4-14' }],
    requirementPreview: {
      itemId: 'item-1',
      heroId: 'hero-1',
      meetsRequirements: false,
      requirementCount: 1,
      unmetCount: 1,
      failedRequirementKeys: [],
      effectiveRequirements: [{
        requirementDefinitionKey: 'hero_level',
        valueType: null,
        displayLabel: 'Hero level',
        displayValue: 'Level 5',
        requiredKey: null,
        requiredStatKey: null,
        requiredValue: 5,
        finalDecimalValue: 5,
        highestComponentValue: 5,
        additionalComponentValue: 0,
        additionalRequirementFraction: 0,
        preQualityValue: 5,
        qualityRequirementMultiplier: 1,
        roundingMode: 'ceil',
        componentCount: 1,
      }],
      components: [],
    },
    bonuses: [{
      label: 'Critical chance',
      displayValue: '+2%',
      targetKey: 'critical_chance',
      numericValue: 2,
      rowKind: 'modifier_bonus',
      displaySection: 'bonuses',
      sourceKey: 'demonic',
      sourceLabel: 'Demonic',
      sortOrder: 20,
    }, {
      label: 'Maximum damage',
      displayValue: '+4',
      targetKey: 'max_damage',
      numericValue: 4,
      rowKind: 'modifier_bonus',
      displaySection: 'bonuses',
      sourceKey: 'demonic',
      sourceLabel: 'Demonic',
      sortOrder: 30,
    }],
    ...overrides,
  };
}
