import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LoadoutPreset } from '../../../core/domain/item/item-equipment.model';
import { HeroLoadoutPresetsState } from '../../../core/services/items/hero-loadout-presets.state';
import { LoadoutPresetManagement } from './loadout-preset-management';

describe('LoadoutPresetManagement', () => {
  let fixture: ComponentFixture<LoadoutPresetManagement>;
  let presets: FakeHeroLoadoutPresetsState;

  beforeEach(async () => {
    presets = new FakeHeroLoadoutPresetsState();

    await TestBed.configureTestingModule({
      imports: [LoadoutPresetManagement],
    })
      .overrideComponent(LoadoutPresetManagement, {
        set: {
          imports: [
            ReactiveFormsModule,
            ButtonModule,
            InputTextModule,
          ],
          providers: [
            { provide: HeroLoadoutPresetsState, useValue: presets },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LoadoutPresetManagement);
    fixture.detectChanges();
  });

  it('loads preset headers on init', () => {
    expect(presets.load).toHaveBeenCalled();
  });

  it('renders preset management without apply or preview actions', () => {
    presets.setPresets([
      loadoutPreset({ presetNumber: 1, name: 'Travel', slotCount: 2 }),
      loadoutPreset({ presetNumber: 2, name: 'Trials', slotCount: 5 }),
    ]);
    fixture.detectChanges();
    const text = textContent(fixture);
    const firstInput = (fixture.nativeElement as HTMLElement)
      .querySelector('input[aria-label="Preset 1 name"]') as HTMLInputElement;

    expect(text).toContain('Loadout presets');
    expect(text).toContain('Preset 1');
    expect(firstInput.value).toBe('Travel');
    expect(text).toContain('2 slots');
    expect(text).toContain('Rename');
    expect(text).toContain('Save current loadout');
    expect(text).toContain('Clear');
    expect(text).not.toContain('Apply preset');
    expect(text).not.toContain('Preview preset');
  });

  it('renames, saves and clears presets through preset state', () => {
    presets.setPresets([loadoutPreset({ presetNumber: 2, name: 'Trials' })]);
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement)
      .querySelector('input[aria-label="Preset 2 name"]') as HTMLInputElement;
    input.value = 'Boss loadout';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const preset = component.presetRows()[0];
    component.renamePreset(preset);
    component.saveCurrentLoadout(preset);
    component.clearPreset(preset);

    expect(presets.renamePreset).toHaveBeenCalledWith({
      presetNumber: 2,
      name: 'Boss loadout',
    });
    expect(presets.saveCurrentLoadout).toHaveBeenCalledWith({
      presetNumber: 2,
      name: 'Boss loadout',
    });
    expect(presets.clearPreset).toHaveBeenCalledWith({
      presetNumber: 2,
    });
  });

  it('shows controlled preset feedback', () => {
    presets.actionError.set('Preset name is required.');
    presets.actionMessage.set('Preset 1 renamed.');
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Preset name is required.');
    expect(text).toContain('Preset 1 renamed.');
  });
});

class FakeHeroLoadoutPresetsState {
  readonly presets = signal<LoadoutPreset[]>([]);
  readonly status = signal<'empty' | 'loaded'>('empty');
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionMessage = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly isEmpty = signal(true);
  readonly isMutating = signal(false);
  readonly load = jasmine.createSpy('load');
  readonly renamePreset = jasmine.createSpy('renamePreset');
  readonly saveCurrentLoadout = jasmine.createSpy('saveCurrentLoadout');
  readonly clearPreset = jasmine.createSpy('clearPreset');

  setPresets(presets: LoadoutPreset[]): void {
    this.presets.set(presets);
    this.status.set(presets.length ? 'loaded' : 'empty');
    this.isEmpty.set(presets.length === 0);
  }
}

function textContent(fixture: ComponentFixture<LoadoutPresetManagement>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

function loadoutPreset(overrides: Partial<LoadoutPreset> = {}): LoadoutPreset {
  return {
    presetId: 'preset-1',
    heroId: 'hero-1',
    presetNumber: 1,
    name: 'Preset 1',
    slotCount: 0,
    savedAt: null,
    clearedAt: null,
    updatedAt: '2026-05-08T10:00:00.000Z',
    ...overrides,
  };
}
