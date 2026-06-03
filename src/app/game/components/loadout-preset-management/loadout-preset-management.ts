import { Component, computed, effect, inject, input } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
  PlayerArmoryLoadoutPresetReadModel,
  PlayerArmoryPageCopyActions,
  PlayerArmoryPageCopyLoadoutPresets,
} from '../../../core/domain/item/player-armory-page-context.model';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { HeroLoadoutPresetsState } from '../../../core/services/items/hero-loadout-presets.state';
import { InlineTextEdit } from '../../../shared/inline-text-edit/inline-text-edit';

@Component({
  selector: 'app-loadout-preset-management',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InlineTextEdit,
  ],
  templateUrl: './loadout-preset-management.html',
  host: { class: 'd-block w-100' },
  providers: [CurrentEquipmentState, HeroLoadoutPresetsState],
})
export class LoadoutPresetManagement {
  private readonly presetsState = inject(HeroLoadoutPresetsState);
  readonly equipment = inject(CurrentEquipmentState);
  private readonly page = inject(ArmoryPageFacade);

  readonly presets = input.required<readonly PlayerArmoryLoadoutPresetReadModel[]>();
  readonly title = input.required<string>();
  readonly copy = input.required<PlayerArmoryPageCopyLoadoutPresets>();
  readonly actionsCopy = input.required<PlayerArmoryPageCopyActions>();
  readonly cancelLabel = input.required<string>();
  readonly presetNameForm = new FormRecord<FormControl<string>>({});
  readonly isMutating = computed(() =>
    this.presetsState.isMutating() || this.equipment.isMutating(),
  );
  readonly presetRows = computed(() =>
    this.presets().map((preset) => ({
      ...preset,
      controlName: presetControlName(preset.presetNumber),
    })),
  );
  private readonly syncPresetForms = effect(() =>
    this.syncLoadoutPresetForms(this.presets()),
  );

  renamePreset(preset: PlayerArmoryLoadoutPresetReadModel, name: string): void {
    this.presetsState.renamePreset({
      presetNumber: preset.presetNumber,
      name,
    }, () => this.page.loadData());
  }

  saveCurrentLoadout(preset: PlayerArmoryLoadoutPresetReadModel): void {
    const controlName = presetControlName(preset.presetNumber);
    const name = this.presetNameForm.controls[controlName]?.value.trim() || preset.name;

    this.presetsState.saveCurrentLoadout({
      presetNumber: preset.presetNumber,
      name,
    }, () => this.page.loadData());
  }

  clearPreset(preset: PlayerArmoryLoadoutPresetReadModel): void {
    this.presetsState.clearPreset({
      presetNumber: preset.presetNumber,
    }, () => this.page.loadData());
  }

  applyPreset(preset: PlayerArmoryLoadoutPresetReadModel): void {
    this.equipment.applyLoadoutPreset({
      presetNumber: preset.presetNumber,
    }, () => this.page.loadData());
  }

  isPresetSaved(preset: PlayerArmoryLoadoutPresetReadModel): boolean {
    return preset.savedAt !== null;
  }

  private syncLoadoutPresetForms(
    presets: readonly PlayerArmoryLoadoutPresetReadModel[],
  ): void {
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

  private ensurePresetNameControl(preset: PlayerArmoryLoadoutPresetReadModel): void {
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

}

function presetControlName(presetNumber: number): string {
  return `preset_${presetNumber}`;
}
