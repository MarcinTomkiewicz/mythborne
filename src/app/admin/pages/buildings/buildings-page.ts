import { Component, OnInit, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';
import { BuildingFormulaAdminFacade } from '../../../core/services/buildings/building-formula-admin.facade';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { BUILDINGS_PAGE_LINKS } from '../../admin-navigation.config';
import {
  BUILDING_BONUS_TYPE_OPTIONS,
  BUILDING_PROGRESSION_FIELDS,
  BUILDING_REQUIREMENT_TYPE_OPTIONS,
  BUILDING_RESOURCE_TYPE_OPTIONS,
  createBuildingFormulaFields,
  createBuildingPrimaryEditorFields,
  createBuildingSelectorFields,
} from '../../../core/config/forms/buildings-form.config';

@Component({
  selector: 'app-buildings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    LoadingOverlay,
    FormFields,
    AdminTagLinks,
    AdminServerSwitcher,
  ],
  providers: [BuildingFormulaAdminFacade, BuildingsPageFacade],
  templateUrl: './buildings-page.html',
})
export class BuildingsPage implements OnInit {
  readonly page = inject(BuildingsPageFacade);
  readonly links = BUILDINGS_PAGE_LINKS;
  readonly resourceTypeOptions = BUILDING_RESOURCE_TYPE_OPTIONS;
  readonly requirementTypeOptions = BUILDING_REQUIREMENT_TYPE_OPTIONS;
  readonly bonusTypeOptions = BUILDING_BONUS_TYPE_OPTIONS;
  readonly formulaFields = computed(() =>
    createBuildingFormulaFields(
      this.page.formulas.targets(),
      (targetKey) =>
        this.page.formulas.formulasFor(targetKey).map((formula) => ({
          value: formula.id,
          label: formula.label,
        })),
      (targetKey) => this.page.formulas.toControlName(targetKey)
    )
  );
  readonly selectorFields = computed(() =>
    createBuildingSelectorFields(this.page.building.items())
  );
  readonly primaryEditorFields = computed(() =>
    createBuildingPrimaryEditorFields(this.page.adminData())
  );
  readonly progressionFields = BUILDING_PROGRESSION_FIELDS;

  ngOnInit(): void {
    this.page.loadData();
  }
}

