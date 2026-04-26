import { Component, OnInit, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { ITEM_CATALOG_PAGE_LINKS } from '../../admin-navigation.config';
import { ItemGenerationItemCatalogPageFacade } from '../../../core/services/items/item-generation-item-catalog-page.facade';
import {
  createItemCatalogSelectorFields,
  ITEM_CATALOG_AFFIX_EDITOR_FIELDS,
  ITEM_CATALOG_BASE_EDITOR_FIELDS,
  ITEM_CATALOG_SECTION_BUTTONS,
} from '../../../core/config/forms/item-catalog-form.config';

@Component({
  selector: 'app-item-generation-item-catalog-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FormFields,
    AdminTagLinks,
  ],
  providers: [ItemGenerationItemCatalogPageFacade],
  templateUrl: './item-generation-item-catalog-page.html',
})
export class ItemGenerationItemCatalogPage implements OnInit {
  readonly page = inject(ItemGenerationItemCatalogPageFacade);
  readonly links = ITEM_CATALOG_PAGE_LINKS;
  readonly sectionButtons = ITEM_CATALOG_SECTION_BUTTONS;
  readonly selectorFields = computed(() =>
    createItemCatalogSelectorFields(
      this.page.activeSection(),
      this.page.activeEntities(),
      (entity) => this.page.optionLabel(entity)
    )
  );
  readonly baseEditorFields = ITEM_CATALOG_BASE_EDITOR_FIELDS;
  readonly affixEditorFields = ITEM_CATALOG_AFFIX_EDITOR_FIELDS;

  ngOnInit(): void {
    this.page.loadData();
  }
}
