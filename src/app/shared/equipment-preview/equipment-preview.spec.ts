import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { equipmentPreviewRegionFor } from './equipment-preview.config';
import { EquipmentPreview } from './equipment-preview';
import {
  EquipmentPreviewItemDisplay,
  EquipmentPreviewSlotRow,
} from '../../core/domain/equipment/equipment-preview.model';
import { ItemDetailReader } from '../../core/services/items/item-detail-reader';

describe('EquipmentPreview', () => {
  let fixture: ComponentFixture<EquipmentPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentPreview],
      providers: [
        provideRouter([]),
        {
          provide: ItemDetailReader,
          useValue: {
            readItemDetail: jasmine.createSpy('readItemDetail').and.returnValue(of(null)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EquipmentPreview);
    fixture.componentRef.setInput('rows', []);
  });

  it('renders each confirmed slot exactly once around the paperdoll image', () => {
    const rows: EquipmentPreviewSlotRow[] = [
      slot({ slotKey: 'helmet', label: 'Helmet' }),
      slot({
        slotKey: 'main_hand',
        label: 'Main hand',
        item: item({
          name: 'Quality Spear of Fire',
          metadata: 'Main hand \u00b7 Quality',
        }),
      }),
      slot({
        slotKey: 'off_hand',
        label: 'Off hand',
      }),
      slot({
        slotKey: 'amulet',
        label: 'Amulet',
        item: item({
          name: 'Outstanding Amulet',
          metadata: 'Amulet \u00b7 Outstanding',
        }),
      }),
    ];
    fixture.componentRef.setInput('rows', rows);

    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.equipment-preview')).not.toBeNull();
    expect(host.querySelector<HTMLImageElement>('.equipment-preview__figure-image')?.src)
      .toContain('/images/warrior.png');
    expect(host.querySelectorAll('.equipment-preview__slot-card').length)
      .toBe(rows.length);
    expect(host.querySelectorAll('app-item-detail-popover').length)
      .toBe(2);
    expect(host.querySelectorAll('.equipment-preview__slot-icon .pi').length)
      .toBe(rows.length);
    expect(textContent(host)).toContain('Main hand \u00b7 Quality');
    expect(textContent(host)).not.toContain('Usable');
    expect(textContent(host)).not.toContain('Runtime usable');
  });

  it('renders a provided origin-specific paperdoll image', () => {
    fixture.componentRef.setInput('rows', [slot({ slotKey: 'helmet' })]);
    fixture.componentRef.setInput('paperdollImageUrl', '/images/paperdolls/spartan.png');

    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const image = host.querySelector<HTMLImageElement>('.equipment-preview__figure-image');

    expect(image?.src).toContain('/images/paperdolls/spartan.png');
  });

  it('maps canonical slot keys to intended paperdoll regions', () => {
    expect(equipmentPreviewRegionFor(slot({ slotKey: 'helmet' }))).toBe('head');
    expect(equipmentPreviewRegionFor(slot({ slotKey: 'armor' }))).toBe('torso');
    expect(equipmentPreviewRegionFor(slot({ slotKey: 'ring_1' }))).toBe('ring1');
    expect(equipmentPreviewRegionFor(slot({ slotKey: 'main_hand' }))).toBe('mainHand');
    expect(equipmentPreviewRegionFor(slot({ slotKey: 'boots' }))).toBe('feet');
    expect(equipmentPreviewRegionFor(slot({ slotKey: 'amulet' }))).toBe('neck');
    expect(equipmentPreviewRegionFor(slot({ slotKey: 'ring_2' }))).toBe('ring2');
    expect(equipmentPreviewRegionFor(slot({ slotKey: 'off_hand' }))).toBe('offHand');
    expect(equipmentPreviewRegionFor(slot({ slotKey: 'pants' }))).toBe('legs');
    expect(equipmentPreviewRegionFor(slot({ slotKey: 'unknown_slot' }))).toBe('other');
  });

  it('hides the Armory CTA in armory mode', () => {
    fixture.componentRef.setInput('isArmory', true);

    fixture.detectChanges();

    expect(textContent(fixture.nativeElement)).not.toContain('Open Armory');
  });

  it('applies the compact board class when compact mode is enabled', () => {
    fixture.componentRef.setInput('rows', [slot({ slotKey: 'helmet' })]);
    fixture.componentRef.setInput('compact', true);

    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.equipment-preview__board--compact'),
    ).not.toBeNull();
  });

  it('hides metadata and empty helper copy in compact mode', () => {
    fixture.componentRef.setInput('compact', true);
    fixture.componentRef.setInput('rows', [
      slot({
        slotKey: 'main_hand',
        label: 'Main hand',
        item: item({
          name: 'Quality Spear of Fire',
          metadata: 'Main hand \u00b7 Quality',
        }),
      }),
      slot({ slotKey: 'off_hand', label: 'Off hand' }),
    ]);

    fixture.detectChanges();

    const text = textContent(fixture.nativeElement);
    expect(text).toContain('Quality Spear of Fire');
    expect(text).toContain('Empty slot');
    expect(text).not.toContain('Main hand \u00b7 Quality');
    expect(text).not.toContain('No item equipped');
  });

  it('hides slot labels when requested by a dashboard compact variant', () => {
    fixture.componentRef.setInput('compact', true);
    fixture.componentRef.setInput('showSlotLabels', false);
    fixture.componentRef.setInput('rows', [
      slot({
        slotKey: 'main_hand',
        label: 'Main hand',
        item: item({ name: 'Quality Spear of Fire' }),
      }),
    ]);

    fixture.detectChanges();

    const text = textContent(fixture.nativeElement);
    expect(text).toContain('Quality Spear of Fire');
    expect(text).not.toContain('Main hand');
  });
});

function slot(overrides: Partial<EquipmentPreviewSlotRow>): EquipmentPreviewSlotRow {
  return {
    slotKey: 'slot',
    label: 'Slot',
    sortOrder: 1,
    iconClass: 'pi pi-chest',
    item: null,
    ...overrides,
  };
}

function item(
  overrides: Partial<EquipmentPreviewItemDisplay>,
): EquipmentPreviewItemDisplay {
  return {
    itemId: 'item-1',
    name: 'Item',
    metadata: 'Slot \u00b7 Normal',
    statusLabel: 'active',
    qualityLabel: 'Normal',
    kindLabel: 'Item',
    slotLabel: 'Slot',
    ...overrides,
  };
}

function textContent(element: HTMLElement): string {
  return element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}
