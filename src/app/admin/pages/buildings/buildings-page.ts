import { Component, OnInit, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';
import { BuildingFormulaPreviewCalculator } from '../../../core/services/buildings/building-formula-preview-calculator';
import { BuildingFormulaAdminFacade } from '../../../core/services/buildings/building-formula-admin.facade';
import { BuildingImpactPreviewState } from '../../../core/services/buildings/building-impact-preview.state';
import { BuildingProgressionPreviewState } from '../../../core/services/buildings/building-progression-preview.state';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { BuildingBonusesSection } from '../../components/buildings/building-bonuses-section';
import { BuildingLocalFormulasSection } from '../../components/buildings/building-local-formulas-section';
import { BuildingPreviewSection } from '../../components/buildings/building-preview-section';
import { BuildingRequirementsSection } from '../../components/buildings/building-requirements-section';
import { BuildingResourceCostsSection } from '../../components/buildings/building-resource-costs-section';
import { BUILDINGS_PAGE_LINKS } from '../../admin-navigation.config';
import {
  BUILDING_PROGRESSION_FIELDS,
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
    BuildingBonusesSection,
    BuildingLocalFormulasSection,
    BuildingPreviewSection,
    BuildingRequirementsSection,
    BuildingResourceCostsSection,
  ],
  providers: [
    BuildingFormulaAdminFacade,
    BuildingFormulaPreviewCalculator,
    BuildingImpactPreviewState,
    BuildingProgressionPreviewState,
    BuildingsPageFacade,
  ],
  templateUrl: './buildings-page.html',
})
export class BuildingsPage implements OnInit {
  readonly page = inject(BuildingsPageFacade);
  readonly links = BUILDINGS_PAGE_LINKS;
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

