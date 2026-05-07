import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import {
  ArmoryItemDetailReadModel,
  ArmoryItemSummary,
} from '../../../core/domain/item/item-equipment.model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerArmory } from '../../../core/services/items/player-armory';
import { ArmoryItemDetailPopover } from './armory-item-detail-popover';

describe('ArmoryItemDetailPopover', () => {
  let fixture: ComponentFixture<ArmoryItemDetailPopover>;
  let armory: jasmine.SpyObj<PlayerArmory>;
  let detail$: Subject<ArmoryItemDetailReadModel>;

  beforeEach(async () => {
    detail$ = new Subject<ArmoryItemDetailReadModel>();
    armory = jasmine.createSpyObj<PlayerArmory>('PlayerArmory', [
      'getArmoryItemDetail',
    ]);
    armory.getArmoryItemDetail.and.returnValue(detail$);

    await TestBed.configureTestingModule({
      imports: [ArmoryItemDetailPopover],
      providers: [
        { provide: PlayerArmory, useValue: armory },
        {
          provide: ActiveHero,
          useValue: {
            state: signal({
              heroId: 'hero-1',
              serverId: 'server-1',
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArmoryItemDetailPopover);
    fixture.componentRef.setInput('item', armoryItem());
    fixture.detectChanges();
  });

  it('loads canonical detail and exposes hardened player-facing values', () => {
    fixture.componentInstance.open(
      new MouseEvent('click'),
      { toggle: jasmine.createSpy('toggle') } as never,
    );
    detail$.next(demonicDaggerDetail());
    fixture.detectChanges();

    expect(armory.getArmoryItemDetail).toHaveBeenCalledWith('item-1');
    expect(fixture.componentInstance.currentDetail()).toEqual(jasmine.objectContaining({
      drachmaValue: 300,
      itemStats: [{ label: 'Damage', displayValue: '2-9' }],
      bonuses: [
        jasmine.objectContaining({ label: 'Maximum damage', displayValue: '+4' }),
        jasmine.objectContaining({ label: 'Critical chance', displayValue: '+2%' }),
      ],
    }));
    expect(fixture.componentInstance.drachmaValue()).toBe(300);
    expect(JSON.stringify(fixture.componentInstance.currentDetail())).not.toContain('Flat');
  });

  it('ignores stale detail responses after the item changes', () => {
    fixture.componentInstance.open(
      new MouseEvent('click'),
      { toggle: jasmine.createSpy('toggle') } as never,
    );
    fixture.componentRef.setInput('item', armoryItem({
      itemId: 'item-2',
      name: 'Other item',
    }));
    detail$.next(demonicDaggerDetail({ itemId: 'item-1' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.itemName()).toBe('Other item');
    expect(fixture.componentInstance.currentDetail()).toBeNull();
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
    itemStats: [{ label: 'Damage', displayValue: '2-9' }],
    bonuses: [{
      label: 'Maximum damage',
      displayValue: '+4',
      numericValue: 4,
      rowKind: 'modifier_bonus',
      displaySection: 'bonuses',
      sourceKey: 'demonic',
      sourceLabel: 'Demonic',
      sortOrder: 10,
    }, {
      label: 'Critical chance',
      displayValue: '+2%',
      numericValue: 2,
      rowKind: 'modifier_bonus',
      displaySection: 'bonuses',
      sourceKey: 'demonic',
      sourceLabel: 'Demonic',
      sortOrder: 20,
    }],
    ...overrides,
  };
}
