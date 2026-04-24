import { Component, OnInit, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';
import { BuildingFormulaAdminFacade } from '../../../core/services/buildings/building-formula-admin.facade';
import { AdminFormFieldsComponent } from '../../components/admin-form-fields/admin-form-fields';
import { AdminTagLinksComponent } from '../../components/admin-tag-links/admin-tag-links';
import { BUILDINGS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminFormFieldType } from '../../../core/enums/admin-form-field-type';
import { AdminFormFieldConfig } from '../../../core/types/admin-ui.types';

const RESOURCE_TYPE_OPTIONS = [
  { label: 'Drachma', value: 'drachma' },
  { label: 'Materials', value: 'materials' },
  { label: 'Workforce', value: 'workforce' },
] as const;

const REQUIREMENT_TYPE_OPTIONS = [
  { label: 'Hero level', value: 'hero_level' },
  { label: 'Hero stat', value: 'hero_stat' },
] as const;

const BONUS_TYPE_OPTIONS = [
  { label: 'flat', value: 'flat' },
  { label: 'percent', value: 'percent' },
] as const;

@Component({
  selector: 'app-buildings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    LoadingOverlay,
    AdminFormFieldsComponent,
    AdminTagLinksComponent,
  ],
  providers: [BuildingFormulaAdminFacade, BuildingsPageFacade],
  templateUrl: './buildings-page.html',
})
export class BuildingsPage implements OnInit {
  readonly page = inject(BuildingsPageFacade);
  readonly links = BUILDINGS_PAGE_LINKS;
  readonly resourceTypeOptions = RESOURCE_TYPE_OPTIONS;
  readonly requirementTypeOptions = REQUIREMENT_TYPE_OPTIONS;
  readonly bonusTypeOptions = BONUS_TYPE_OPTIONS;
  readonly formulaFields = computed<readonly AdminFormFieldConfig[]>(() =>
    this.page.formulas.targets().map((target) => ({
      type: AdminFormFieldType.Select,
      controlName: this.page.formulas.toControlName(target.key),
      label: target.label,
      options: [
        { label: 'Choose formula', value: '' },
        ...this.page.formulas.formulasFor(target.key).map((formula) => ({
          label: formula.label,
          value: formula.id,
        })),
      ],
    }))
  );
  readonly selectorFields = computed<readonly AdminFormFieldConfig[]>(() => [
    {
      type: AdminFormFieldType.Select,
      controlName: 'selectedId',
      label: 'Building',
      options: [
        { label: 'Create new building', value: '' },
        ...this.page.building.items().map((building) => ({
          label: `${building.name} (${building.key})`,
          value: building.id ?? '',
        })),
      ],
    },
  ]);
  readonly primaryEditorFields = computed<readonly AdminFormFieldConfig[]>(() => [
    {
      type: AdminFormFieldType.Text,
      controlName: 'key',
      label: 'Key',
    },
    {
      type: AdminFormFieldType.Text,
      controlName: 'name',
      label: 'Name',
    },
    {
      type: AdminFormFieldType.Textarea,
      controlName: 'description',
      label: 'Description',
      className: 'grid-col-span-2',
      rows: 3,
    },
    {
      type: AdminFormFieldType.Select,
      controlName: 'districtCode',
      label: 'District',
      options: this.page.adminData().districts.map((district) => ({
        label: `${district.code} - ${district.name}`,
        value: district.code,
      })),
    },
  ]);
  readonly progressionFields: readonly AdminFormFieldConfig[] = [
    {
      type: AdminFormFieldType.Number,
      controlName: 'rankRequired',
      label: 'District unlock rank',
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'sortOrder',
      label: 'Sort order',
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'baseBuildTimeMinutes',
      label: 'Base build time (min)',
    },
    {
      type: AdminFormFieldType.Number,
      controlName: 'maxLevel',
      label: 'Max level',
    },
  ];

  ngOnInit(): void {
    this.page.loadData();
  }
}

