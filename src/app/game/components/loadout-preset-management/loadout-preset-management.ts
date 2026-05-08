import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LoadoutPreset } from '../../../core/domain/item/item-equipment.model';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { HeroLoadoutPresetsState } from '../../../core/services/items/hero-loadout-presets.state';
import {
  buildLoadoutPresetPreviewRows,
  loadoutPresetUpdateSuggestion,
  previewItemName,
  previewStatusClass,
  previewStatusLabel,
} from './loadout-preset-preview-display';

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
  private readonly dismissedUpdateSuggestionKey = signal<string | null>(null);
  readonly presetNameForm = new FormRecord<FormControl<string>>({});
  readonly presetRows = computed(() =>
    this.presets.presets().map((preset) => ({
      ...preset,
      controlName: presetControlName(preset.presetNumber),
    })),
  );
  readonly previewRows = computed(() =>
    buildLoadoutPresetPreviewRows(
      this.presets.preview(),
      this.presets.previewSlots(),
    ),
  );
  readonly updateSuggestion = computed(() =>
    loadoutPresetUpdateSuggestion(
      this.presets.preview(),
      this.previewRows(),
      (slotKey) => this.equipment.slot(slotKey)?.itemId ?? null,
      this.canComparePreviewWithCurrentLoadout(),
      this.dismissedUpdateSuggestionKey(),
    ),
  );
  readonly previewStatusLabel = previewStatusLabel;
  readonly previewStatusClass = previewStatusClass;
  readonly previewItemName = previewItemName;
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

  dismissUpdateSuggestion(key: string): void {
    this.dismissedUpdateSuggestionKey.set(key);
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

  private canComparePreviewWithCurrentLoadout(): boolean {
    const status = this.equipment.status();

    return status === 'loaded' || status === 'empty';
  }
}

function presetControlName(presetNumber: number): string {
  return `preset_${presetNumber}`;
}
