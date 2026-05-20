import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { LoadoutPreset } from '../../../core/domain/item/item-equipment.model';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { HeroLoadoutPresetsState } from '../../../core/services/items/hero-loadout-presets.state';
import {
  buildLoadoutPresetPreviewRows,
  isLoadoutPresetPreviewItemRow,
  previewItemName,
  previewSlotFallbackIconClass,
  previewStatusLabel,
} from './loadout-preset-preview-display';

@Component({
  selector: 'app-loadout-preset-management',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InplaceModule,
    InputTextModule,
    Popover,
  ],
  templateUrl: './loadout-preset-management.html',
  host: { class: 'd-block w-100' },
})
export class LoadoutPresetManagement implements OnInit {
  readonly presets = inject(HeroLoadoutPresetsState);
  readonly equipment = inject(CurrentEquipmentState);
  private readonly armory = inject(ArmoryShelfState);
  private readonly page = inject(ArmoryPageFacade);
  private hidePreviewTimeout: ReturnType<typeof setTimeout> | null = null;
  private loadingPreviewPresetNumber: number | null = null;
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
  readonly previewItemRows = computed(() =>
    this.previewRows().filter(isLoadoutPresetPreviewItemRow),
  );
  readonly previewStatusLabel = previewStatusLabel;
  readonly previewItemName = previewItemName;
  readonly previewSlotFallbackIconClass = previewSlotFallbackIconClass;
  private readonly syncPresetForms = effect(() =>
    this.syncLoadoutPresetForms(this.presets.presets()),
  );

  ngOnInit(): void {
    this.presets.load();
  }

  renamePreset(preset: LoadoutPreset): void {
    const controlName = presetControlName(preset.presetNumber);
    const name = this.presetNameForm.controls[controlName]?.value.trim() ?? '';

    this.presets.renamePreset({
      presetNumber: preset.presetNumber,
      name,
    });
  }

  saveCurrentLoadout(preset: LoadoutPreset): void {
    const controlName = presetControlName(preset.presetNumber);
    const name =
      this.presetNameForm.controls[controlName]?.value.trim()
      || this.presetDisplayName(preset);

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

  openPresetPreview(event: Event, popover: Popover, preset: LoadoutPreset): void {
    if (!this.isPresetSaved(preset)) {
      return;
    }

    this.keepPresetPreviewOpen();

    if (this.shouldLoadPreview(preset)) {
      this.previewPreset(preset);
    }

    popover.show(event);
  }

  schedulePresetPreviewClose(popover: Popover): void {
    this.clearPreviewTimeout();
    this.hidePreviewTimeout = setTimeout(() => popover.hide(), 160);
  }

  keepPresetPreviewOpen(): void {
    this.clearPreviewTimeout();
  }

  previewPreset(preset: LoadoutPreset): void {
    this.loadingPreviewPresetNumber = preset.presetNumber;
    this.presets.previewPreset({
      presetNumber: preset.presetNumber,
    });
  }

  applyPreset(preset: LoadoutPreset): void {
    this.equipment.applyLoadoutPreset({
      presetNumber: preset.presetNumber,
    }, () => this.refreshArmoryAndDerivedStats());
  }

  presetDisplayName(preset: Pick<LoadoutPreset, 'name' | 'presetNumber'>): string {
    const name = preset.name.trim();

    return name.length ? name : `Preset ${preset.presetNumber}`;
  }

  isPresetSaved(preset: LoadoutPreset): boolean {
    return preset.savedAt !== null;
  }

  renamePresetActionIsCancel(control: FormControl<string>): boolean {
    return control.pristine || control.value.trim().length === 0;
  }

  renamePresetActionIcon(control: FormControl<string>): string {
    return this.renamePresetActionIsCancel(control)
      ? 'pi pi-interdiction'
      : 'pi pi-scroll-quill';
  }

  renamePresetActionSeverity(control: FormControl<string>): 'danger' | 'secondary' {
    return this.renamePresetActionIsCancel(control) ? 'danger' : 'secondary';
  }

  renamePresetActionLabel(control: FormControl<string>): string {
    return this.renamePresetActionIsCancel(control) ? 'Cancel' : 'Rename preset';
  }

  handleRenamePresetInplaceAction(
    preset: LoadoutPreset,
    control: FormControl<string>,
    closeCallback: (event?: Event) => void,
    event: Event,
  ): void {
    if (this.renamePresetActionIsCancel(control)) {
      this.resetPresetNameControl(preset, control);
      closeCallback(event);
      return;
    }

    this.renamePreset(preset);
    control.markAsPristine();
    closeCallback(event);
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
    const displayName = this.presetDisplayName(preset);

    if (currentControl) {
      if (!currentControl.dirty && currentControl.value !== displayName) {
        currentControl.setValue(displayName, { emitEvent: false });
      }
      return;
    }

    this.presetNameForm.addControl(
      controlName,
      new FormControl<string>(displayName, { nonNullable: true }),
      { emitEvent: false },
    );
  }

  private refreshArmoryAndDerivedStats(): void {
    this.armory.refresh();
    this.page.loadData();
  }

  private resetPresetNameControl(
    preset: LoadoutPreset,
    control: FormControl<string>,
  ): void {
    control.setValue(this.presetDisplayName(preset), { emitEvent: false });
    control.markAsPristine();
  }

  private shouldLoadPreview(preset: LoadoutPreset): boolean {
    const preview = this.presets.preview();

    if (preview?.preset.presetNumber === preset.presetNumber) {
      return false;
    }

    return !(
      this.presets.isPreviewLoading()
      && this.loadingPreviewPresetNumber === preset.presetNumber
    );
  }

  private clearPreviewTimeout(): void {
    if (this.hidePreviewTimeout) {
      clearTimeout(this.hidePreviewTimeout);
      this.hidePreviewTimeout = null;
    }
  }
}

function presetControlName(presetNumber: number): string {
  return `preset_${presetNumber}`;
}
