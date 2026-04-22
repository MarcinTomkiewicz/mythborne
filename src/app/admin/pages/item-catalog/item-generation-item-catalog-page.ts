import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
  ItemGenerationAdminCatalogData,
} from '../../../core/domain/item/item-generation-admin.model';
import {
  AffixEditorForm,
  BaseEditorForm,
  BonusForm,
  CatalogEntitySelectorForm,
  ItemGenerationItemCatalogFormFactory,
} from '../../../core/factories/forms/item-generation-item-catalog-form.factory';
import { ItemGenerationAdminService } from '../../../core/services/items/item-generation-admin';

type CatalogSection = 'base' | 'prefix' | 'suffix';

@Component({
  selector: 'app-item-generation-item-catalog-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './item-generation-item-catalog-page.html',
})
export class ItemGenerationItemCatalogPage implements OnInit {
  private readonly adminService = inject(ItemGenerationAdminService);
  private readonly formFactory = inject(ItemGenerationItemCatalogFormFactory);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly activeSection = signal<CatalogSection>('base');
  readonly catalogData = signal<ItemGenerationAdminCatalogData>({
    bases: [],
    prefixes: [],
    suffixes: [],
    bonusTemplates: [],
  });

  readonly selectorForm: CatalogEntitySelectorForm =
    this.formFactory.createSelectorForm();
  readonly baseEditorForm: BaseEditorForm =
    this.formFactory.createBaseEditorForm();
  readonly affixEditorForm: AffixEditorForm =
    this.formFactory.createAffixEditorForm();

  readonly activeEntities = computed(() => {
    const data = this.catalogData();

    switch (this.activeSection()) {
      case 'base':
        return data.bases;
      case 'prefix':
        return data.prefixes;
      case 'suffix':
        return data.suffixes;
    }
  });

  readonly activeEditorTitle = computed(() => {
    switch (this.activeSection()) {
      case 'base':
        return 'Base items';
      case 'prefix':
        return 'Prefixes';
      case 'suffix':
        return 'Suffixes';
    }
  });

  constructor() {
    this.selectorForm.controls.selectedId.valueChanges.subscribe((id) => {
      this.applySelection(id);
      this.successMessage.set(null);
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  get baseBonuses(): FormArray<BonusForm> {
    return this.baseEditorForm.controls.bonuses;
  }

  get affixBonuses(): FormArray<BonusForm> {
    return this.affixEditorForm.controls.bonuses;
  }

  loadData(preferred?: { section?: CatalogSection; key?: string }) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService
      .getCatalogData()
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.catalogData.set(data);

          const section = preferred?.section ?? this.activeSection();
          this.activeSection.set(section);

          const nextEntity = this.findEntityByKey(section, preferred?.key) ?? this.firstEntity(section);

          this.selectorForm.controls.selectedId.setValue(nextEntity?.id ?? '', {
            emitEvent: false,
          });

          if (nextEntity) {
            this.applyEntity(section, nextEntity);
          } else {
            this.resetEditorForSection(section);
          }
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof Error ? error.message : 'Failed to load item generation catalog.'
          );
        },
      });
  }

  setSection(section: CatalogSection) {
    this.activeSection.set(section);
    this.successMessage.set(null);

    const entity = this.firstEntity(section);
    this.selectorForm.controls.selectedId.setValue(entity?.id ?? '', {
      emitEvent: false,
    });

    if (entity) {
      this.applyEntity(section, entity);
    } else {
      this.resetEditorForSection(section);
    }
  }

  createNewEntity() {
    this.successMessage.set(null);
    this.selectorForm.controls.selectedId.setValue('', { emitEvent: false });
    this.resetEditorForSection(this.activeSection());
  }

  addBonus() {
    if (this.activeSection() === 'base') {
      this.baseBonuses.push(this.formFactory.createBonusForm());
      return;
    }

    this.affixBonuses.push(this.formFactory.createBonusForm());
  }

  removeBonus(index: number) {
    if (this.activeSection() === 'base') {
      this.baseBonuses.removeAt(index);
      return;
    }

    this.affixBonuses.removeAt(index);
  }

  saveCurrent() {
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const section = this.activeSection();

    if (section === 'base') {
      const draft = this.resolveBonusTemplatesForBase(
        this.formFactory.toBase(this.baseEditorForm)
      );

      this.adminService
        .saveBase(draft)
        .pipe(
          take(1),
          finalize(() => this.isSaving.set(false))
        )
        .subscribe({
          next: () => {
            this.successMessage.set('Catalog entry saved.');
            this.loadData({ section, key: draft.key });
          },
          error: (error: unknown) => {
            this.errorMessage.set(
              error instanceof Error ? error.message : 'Failed to save catalog entry.'
            );
          },
        });

      return;
    }

    const draft = this.resolveBonusTemplatesForAffix(
      this.formFactory.toAffix(this.affixEditorForm)
    );

    this.adminService
      .saveAffix(draft)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Catalog entry saved.');
          this.loadData({ section, key: draft.key });
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof Error ? error.message : 'Failed to save catalog entry.'
          );
        },
      });
  }

  deleteCurrent() {
    const section = this.activeSection();
    const id =
      section === 'base'
        ? this.baseEditorForm.controls.id.value
        : this.affixEditorForm.controls.id.value;

    if (!id) {
      this.createNewEntity();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const request =
      section === 'base'
        ? this.adminService.deleteBase(id)
        : this.adminService.deleteAffix(id);

    request
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Catalog entry deleted.');
          this.loadData({ section });
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof Error ? error.message : 'Failed to delete catalog entry.'
          );
        },
      });
  }

  optionLabel(entity: EditableItemGenerationBase | EditableItemGenerationAffix): string {
    if (this.activeSection() === 'base') {
      const base = entity as EditableItemGenerationBase;
      return `${base.name} (${base.key}) - ${base.slot} - ${base.baseValue}`;
    }

    const affix = entity as EditableItemGenerationAffix;
    return `${affix.name} (${affix.key}) - ${affix.kind} - ${affix.goldValue}`;
  }

  private applySelection(id: string) {
    if (!id) {
      this.resetEditorForSection(this.activeSection());
      return;
    }

    const entity = this.findEntityById(this.activeSection(), id);

    if (entity) {
      this.applyEntity(this.activeSection(), entity);
    }
  }

  private applyEntity(
    section: CatalogSection,
    entity: EditableItemGenerationBase | EditableItemGenerationAffix
  ) {
    if (section === 'base') {
      this.formFactory.patchBase(this.baseEditorForm, entity as EditableItemGenerationBase);
      return;
    }

    this.formFactory.patchAffix(this.affixEditorForm, entity as EditableItemGenerationAffix);
  }

  private resetEditorForSection(section: CatalogSection) {
    if (section === 'base') {
      this.formFactory.patchBase(this.baseEditorForm, this.createBaseDraft());
      return;
    }

    this.formFactory.patchAffix(this.affixEditorForm, this.createAffixDraft(section));
  }

  private firstEntity(section: CatalogSection) {
    switch (section) {
      case 'base':
        return this.catalogData().bases[0] ?? null;
      case 'prefix':
        return this.catalogData().prefixes[0] ?? null;
      case 'suffix':
        return this.catalogData().suffixes[0] ?? null;
    }
  }

  private findEntityById(section: CatalogSection, id: string) {
    switch (section) {
      case 'base':
        return this.catalogData().bases.find((entry) => entry.id === id) ?? null;
      case 'prefix':
        return this.catalogData().prefixes.find((entry) => entry.id === id) ?? null;
      case 'suffix':
        return this.catalogData().suffixes.find((entry) => entry.id === id) ?? null;
    }
  }

  private findEntityByKey(section: CatalogSection, key?: string) {
    if (!key) {
      return null;
    }

    switch (section) {
      case 'base':
        return this.catalogData().bases.find((entry) => entry.key === key) ?? null;
      case 'prefix':
        return this.catalogData().prefixes.find((entry) => entry.key === key) ?? null;
      case 'suffix':
        return this.catalogData().suffixes.find((entry) => entry.key === key) ?? null;
    }
  }

  private resolveBonusTemplatesForBase(
    entity: EditableItemGenerationBase
  ): EditableItemGenerationBase {
    return {
      ...entity,
      bonuses: entity.bonuses.map((bonus) => this.resolveBonusTemplate(bonus)),
    };
  }

  private resolveBonusTemplatesForAffix(
    entity: EditableItemGenerationAffix
  ): EditableItemGenerationAffix {
    return {
      ...entity,
      bonuses: entity.bonuses.map((bonus) => this.resolveBonusTemplate(bonus)),
    };
  }

  private resolveBonusTemplate(
    bonus: EditableItemGenerationBonus
  ): EditableItemGenerationBonus {
    const templateMatch = this.catalogData().bonusTemplates.find(
      (template) =>
        template.target === bonus.target.trim() && template.type === bonus.type
    );

    return {
      ...bonus,
      templateId: templateMatch?.id ?? bonus.templateId,
    };
  }

  private createBaseDraft(): EditableItemGenerationBase {
    return {
      id: null,
      key: '',
      name: '',
      slot: 'weapon',
      baseValue: 100,
      description: '',
      bonuses: [],
    };
  }

  private createAffixDraft(kind: 'prefix' | 'suffix'): EditableItemGenerationAffix {
    return {
      id: null,
      key: '',
      kind,
      name: '',
      goldValue: 100,
      description: '',
      bonuses: [],
    };
  }
}
