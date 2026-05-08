import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  LoadoutPreset,
  LoadoutPresetSlotItem,
} from '../../../core/domain/item/item-equipment.model';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { HeroLoadoutPresetsState } from '../../../core/services/items/hero-loadout-presets.state';

@Component({
  selector: 'app-loadout-preset-management',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
  ],
  providers: [HeroLoadoutPresetsState],
  templateUrl: './loadout-preset-management.html',
})
export class LoadoutPresetManagement implements OnInit {
  readonly presets = inject(HeroLoadoutPresetsState);
  readonly equipment = inject(CurrentEquipmentState);
  private readonly armory = inject(ArmoryShelfState);
  private readonly page = inject(ArmoryPageFacade);
  readonly presetNameForm = new FormRecord<FormControl<string>>({});
  readonly presetRows = computed(() =>
    this.presets.presets().map((preset) => ({
      ...preset,
      controlName: presetControlName(preset.presetNumber),
    })),
  );
  readonly previewRows = computed(() => {
    const preview = this.presets.preview();
    if (!preview) {
      return [];
    }

    const itemsBySlot = new Map(
      preview.slotItems.map((item) => [item.slotKey, item]),
    );
    const slots = this.presets.previewSlots();

    return slots.length
      ? slots.map((slot) => ({
          slotKey: slot.slotKey,
          slotLabel: slot.label,
          slotSortOrder: slot.sortOrder,
          item: itemsBySlot.get(slot.slotKey) ?? null,
        }))
      : preview.slotItems.map((item) => ({
          slotKey: item.slotKey,
          slotLabel: item.slotLabel,
          slotSortOrder: item.slotSortOrder,
          item,
        }));
  });
  private readonly syncPresetForms = effect(() =>
    this.syncLoadoutPresetForms(this.presets.presets()),
  );

  ngOnInit(): void {
    this.presets.load();
  }

  renamePreset(preset: LoadoutPreset): void {
    const controlName = presetControlName(preset.presetNumber);
    const name = this.presetNameForm.controls[controlName]?.value ?? '';

    this.presets.renamePreset({
      presetNumber: preset.presetNumber,
      name,
    });
  }

  saveCurrentLoadout(preset: LoadoutPreset): void {
    const controlName = presetControlName(preset.presetNumber);
    const name = this.presetNameForm.controls[controlName]?.value ?? preset.name;

    this.presets.saveCurrentLoadout({
      presetNumber: preset.presetNumber,
      name,
    });
  }

  clearPreset(preset: LoadoutPreset): void {
    this.presets.clearPreset({
      presetNumber: preset.presetNumber,
    });
  }

  previewPreset(preset: LoadoutPreset): void {
    this.presets.previewPreset({
      presetNumber: preset.presetNumber,
    });
  }

  applyPreset(preset: LoadoutPreset): void {
    this.equipment.applyLoadoutPreset({
      presetNumber: preset.presetNumber,
    }, () => this.refreshArmoryAndDerivedStats());
  }

  previewStatusLabel(item: LoadoutPresetSlotItem | null): string {
    if (!item) {
      return 'Empty slot';
    }

    switch (item.previewStatus) {
      case 'available':
        return 'Owned and available';
      case 'missing':
        return 'Item missing';
      case 'no_longer_owned':
        return 'No longer owned';
      case 'scrapped':
        return 'Scrapped';
      default:
        return humanizeKey(item.previewStatus);
    }
  }

  previewStatusClass(item: LoadoutPresetSlotItem | null): string {
    if (!item) {
      return 'tag-badge tag-badge--muted';
    }

    return item.previewStatus === 'available'
      ? 'tag-badge tag-badge--success'
      : 'tag-badge tag-badge--warn';
  }

  previewItemName(item: LoadoutPresetSlotItem): string {
    return item.currentItemName
      ?? item.savedItemNameSnapshot
      ?? item.savedItemId;
  }

  private syncLoadoutPresetForms(presets: readonly LoadoutPreset[]): void {
    const controlNames = new Set(
      presets.map((preset) => presetControlName(preset.presetNumber)),
    );

    for (const preset of presets) {
      this.ensurePresetNameControl(preset);
    }

    for (const controlName of Object.keys(this.presetNameForm.controls)) {
      if (!controlNames.has(controlName)) {
        this.presetNameForm.removeControl(controlName, { emitEvent: false });
      }
    }
  }

  private ensurePresetNameControl(preset: LoadoutPreset): void {
    const controlName = presetControlName(preset.presetNumber);
    const currentControl = this.presetNameForm.controls[controlName];

    if (currentControl) {
      if (!currentControl.dirty && currentControl.value !== preset.name) {
        currentControl.setValue(preset.name, { emitEvent: false });
      }
      return;
    }

    this.presetNameForm.addControl(
      controlName,
      new FormControl<string>(preset.name, { nonNullable: true }),
      { emitEvent: false },
    );
  }

  private refreshArmoryAndDerivedStats(): void {
    this.armory.refresh();
    this.page.loadData();
  }
}

function presetControlName(presetNumber: number): string {
  return `preset_${presetNumber}`;
}

function humanizeKey(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || 'Status';
}
