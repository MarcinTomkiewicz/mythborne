import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BUILDING_RESOURCE_TYPE_OPTIONS } from '../../../core/config/forms/buildings-form.config';
import { REQUIREMENT_BOOLEAN_OPTIONS } from '../../../core/constants/requirement.const';
import {
  BuildingRequirementEntityType,
  BuildingRequirementImpactPreview,
} from '../../../core/domain/building/building.model';
import { BuildingRequirementsState } from '../../../core/services/buildings/building-requirements.state';
import { StatsService } from '../../../core/services/stats/stats';
import { BuildingRequirementValueFields } from '../buildings/building-requirement-value-fields';

interface SelectOption {
  label: string;
  value: string | boolean | null;
}

@Component({
  selector: 'app-item-generation-requirements-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    BuildingRequirementValueFields,
  ],
  providers: [BuildingRequirementsState],
  templateUrl: './item-generation-requirements-editor.html',
})
export class ItemGenerationRequirementsEditor {
  private readonly destroyRef = inject(DestroyRef);
  private readonly statsService = inject(StatsService);

  readonly requirements = inject(BuildingRequirementsState);
  readonly entityType = input.required<BuildingRequirementEntityType>();
  readonly entityId = input<string | null | undefined>(null);
  readonly title = input('Requirements');
  readonly emptyEntityMessage = input('Save this catalog entry before editing requirements.');
  readonly stats = signal<readonly { key: string; label: string }[]>([]);

  readonly booleanOptions = [...REQUIREMENT_BOOLEAN_OPTIONS];
  readonly resourceOptions = [...BUILDING_RESOURCE_TYPE_OPTIONS];
  readonly emptyOptions: SelectOption[] = [
    { label: 'No options loaded for this requirement type', value: null },
  ];
  readonly statOptions = () => [
    { label: 'Select stat', value: null },
    ...this.stats().map((stat) => ({ label: stat.label, value: stat.key })),
  ];

  constructor() {
    this.statsService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stats) => this.stats.set(stats));

    effect(() => {
      const entityType = this.entityType();
      const entityId = this.entityId() ?? null;

      untracked(() =>
        this.requirements.loadForEntity(
          entityType,
          entityId,
          'Failed to load item generation requirements.',
        ),
      );
    });
  }

  add(): void {
    this.requirements.add();
  }

  save(index: number): void {
    this.requirements.saveForEntity(
      index,
      this.entityType(),
      this.entityId(),
      this.emptyEntityMessage(),
    );
  }

  deactivate(index: number): void {
    this.requirements.deactivateForEntity(
      index,
      this.entityType(),
      this.entityId(),
      this.emptyEntityMessage(),
    );
  }

  reactivate(row: BuildingRequirementImpactPreview): void {
    this.requirements.reactivateForEntity(
      row,
      this.entityType(),
      this.entityId(),
      this.emptyEntityMessage(),
    );
  }
}
