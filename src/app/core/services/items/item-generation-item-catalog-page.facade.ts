import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray } from '@angular/forms';
import { finalize, take } from 'rxjs';
import {
  CatalogSection,
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  ItemGenerationAdminCatalogData,
} from '../../domain/item/item-generation-admin.model';
import { ItemGenerationItemCatalogFormFactory } from '../../factories/forms/item-generation-item-catalog-form.factory';
import {
  AffixEditorForm,
  BaseEditorForm,
  BonusForm,
  CatalogEntitySelectorForm,
} from '../../types/forms/item-generation-item-catalog-form.types';
import { ItemGenerationAdminService } from './item-generation-admin';
import {
  catalogEntities,
  catalogEntityLabel,
  findCatalogEntityById,
  findCatalogEntityByKey,
  firstCatalogEntity,
  resolveCatalogBonusTemplates,
} from '../../utils/item-catalog-admin';
import { CatalogEntity } from '../../types/item-catalog-admin.types';

@Injectable()
export class ItemGenerationItemCatalogPageFacade {
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

    return catalogEntities(data, this.activeSection());
  });

  readonly activeEditorTitle = computed(() => {
    const labels: Record<CatalogSection, string> = {
      base: 'Base items',
      prefix: 'Prefixes',
      suffix: 'Suffixes',
    };
    return labels[this.activeSection()];
  });

  constructor() {
    this.selectorForm.controls.selectedId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        this.applySelection(id);
        this.successMessage.set(null);
      });
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

          const nextEntity =
            findCatalogEntityByKey(data, section, preferred?.key) ??
            firstCatalogEntity(data, section);

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

    const entity = firstCatalogEntity(this.catalogData(), section);
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
      const draft = resolveCatalogBonusTemplates(
        this.catalogData(),
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

    const draft = resolveCatalogBonusTemplates(
      this.catalogData(),
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

  optionLabel(entity: CatalogEntity): string {
    return catalogEntityLabel(this.activeSection(), entity);
  }

  private applySelection(id: string) {
    if (!id) {
      this.resetEditorForSection(this.activeSection());
      return;
    }

    const entity = findCatalogEntityById(this.catalogData(), this.activeSection(), id);

    if (entity) {
      this.applyEntity(this.activeSection(), entity);
    }
  }

  private applyEntity(section: CatalogSection, entity: CatalogEntity) {
    if (section === 'base') {
      this.formFactory.patchBase(this.baseEditorForm, entity as EditableItemGenerationBase);
      return;
    }

    this.formFactory.patchAffix(this.affixEditorForm, entity as EditableItemGenerationAffix);
  }

  private resetEditorForSection(section: CatalogSection) {
    if (section === 'base') {
      this.formFactory.patchBase(this.baseEditorForm, this.formFactory.createBaseDraft());
      return;
    }

    this.formFactory.patchAffix(this.affixEditorForm, this.formFactory.createAffixDraft(section));
  }
}

