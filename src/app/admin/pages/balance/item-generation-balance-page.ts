import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../../../core/domain/item/item-generation-admin.model';
import { ItemGenerationBucketsFactory } from '../../../core/factories/item-generation/item-generation-buckets.factory';
import {
  BucketProfileEditorForm,
  BucketProfileSelectorForm,
  ItemGenerationBalanceFormFactory,
  QualityEditorForm,
  QualitySelectorForm,
} from '../../../core/factories/forms/item-generation-balance-form.factory';
import { ItemGenerationAdminService } from '../../../core/services/items/item-generation-admin';

@Component({
  selector: 'app-item-generation-balance-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './item-generation-balance-page.html',
})
export class ItemGenerationBalancePage implements OnInit {
  private readonly adminService = inject(ItemGenerationAdminService);
  private readonly bucketFactory = inject(ItemGenerationBucketsFactory);
  private readonly formFactory = inject(ItemGenerationBalanceFormFactory);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly qualities = signal<EditableItemGenerationQuality[]>([]);
  readonly bucketProfiles = signal<EditableItemGenerationBucketProfile[]>([]);

  readonly qualitySelectorForm: QualitySelectorForm =
    this.formFactory.createQualitySelectorForm();
  readonly qualityEditorForm: QualityEditorForm =
    this.formFactory.createQualityEditorForm();
  readonly profileSelectorForm: BucketProfileSelectorForm =
    this.formFactory.createBucketProfileSelectorForm();
  readonly profileEditorForm: BucketProfileEditorForm =
    this.formFactory.createBucketProfileEditorForm();

  readonly bucketPreview = computed(() => {
    const profile = this.formFactory.toBucketProfile(this.profileEditorForm);

    if (profile.bucketCount <= 0 || profile.baseValue <= 0 || profile.roundingStep <= 0) {
      return [];
    }

    return this.bucketFactory.buildBuckets(profile);
  });

  constructor() {
    this.qualitySelectorForm.controls.selectedId.valueChanges.subscribe((id) => {
      const selected =
        this.qualities().find((quality) => quality.id === id) ?? this.createQualityDraft();
      this.formFactory.patchQuality(this.qualityEditorForm, selected);
      this.successMessage.set(null);
    });

    this.profileSelectorForm.controls.selectedId.valueChanges.subscribe((id) => {
      const selected =
        this.bucketProfiles().find((profile) => profile.id === id) ??
        this.createBucketProfileDraft();
      this.formFactory.patchBucketProfile(this.profileEditorForm, selected);
      this.successMessage.set(null);
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(preferred?: { qualityKey?: string; profileKey?: string }) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService
      .getBalanceData()
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.qualities.set(data.qualities);
          this.bucketProfiles.set(data.bucketProfiles);

          const nextQuality =
            data.qualities.find((quality) => quality.key === preferred?.qualityKey) ??
            data.qualities[0] ??
            this.createQualityDraft();
          const nextProfile =
            data.bucketProfiles.find((profile) => profile.key === preferred?.profileKey) ??
            data.bucketProfiles[0] ??
            this.createBucketProfileDraft();

          this.qualitySelectorForm.controls.selectedId.setValue(nextQuality.id ?? '', {
            emitEvent: false,
          });
          this.profileSelectorForm.controls.selectedId.setValue(nextProfile.id ?? '', {
            emitEvent: false,
          });
          this.formFactory.patchQuality(this.qualityEditorForm, nextQuality);
          this.formFactory.patchBucketProfile(this.profileEditorForm, nextProfile);
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof Error ? error.message : 'Failed to load item generation balance.'
          );
        },
      });
  }

  newQuality() {
    const draft = this.createQualityDraft();
    this.qualitySelectorForm.controls.selectedId.setValue('', { emitEvent: false });
    this.formFactory.patchQuality(this.qualityEditorForm, draft);
    this.successMessage.set(null);
  }

  newProfile() {
    const draft = this.createBucketProfileDraft();
    this.profileSelectorForm.controls.selectedId.setValue('', { emitEvent: false });
    this.formFactory.patchBucketProfile(this.profileEditorForm, draft);
    this.successMessage.set(null);
  }

  saveQuality() {
    const draft = this.formFactory.toQuality(this.qualityEditorForm);

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService
      .saveQuality(draft)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Quality saved.');
          this.loadData({
            qualityKey: draft.key,
            profileKey: this.formFactory.toBucketProfile(this.profileEditorForm).key,
          });
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof Error ? error.message : 'Failed to save quality.'
          );
        },
      });
  }

  deleteQuality() {
    const id = this.qualityEditorForm.controls.id.value;

    if (!id) {
      this.newQuality();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService
      .deleteQuality(id)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Quality deleted.');
          this.loadData({
            profileKey: this.formFactory.toBucketProfile(this.profileEditorForm).key,
          });
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof Error ? error.message : 'Failed to delete quality.'
          );
        },
      });
  }

  saveProfile() {
    const draft = this.formFactory.toBucketProfile(this.profileEditorForm);

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService
      .saveBucketProfile(draft)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Bucket profile saved.');
          this.loadData({
            qualityKey: this.formFactory.toQuality(this.qualityEditorForm).key,
            profileKey: draft.key,
          });
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof Error ? error.message : 'Failed to save bucket profile.'
          );
        },
      });
  }

  deleteProfile() {
    const id = this.profileEditorForm.controls.id.value;

    if (!id) {
      this.newProfile();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService
      .deleteBucketProfile(id)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Bucket profile deleted.');
          this.loadData({
            qualityKey: this.formFactory.toQuality(this.qualityEditorForm).key,
          });
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof Error ? error.message : 'Failed to delete bucket profile.'
          );
        },
      });
  }

  private createQualityDraft(): EditableItemGenerationQuality {
    return {
      id: null,
      key: 'normal',
      label: 'Normal',
      multiplier: 1,
      weight: 10,
      sortOrder: 10,
      isEnabled: true,
    };
  }

  private createBucketProfileDraft(): EditableItemGenerationBucketProfile {
    return {
      id: null,
      key: '',
      name: '',
      description: '',
      bucketCount: 6,
      baseValue: 300,
      linearGrowth: 120,
      growthFactor: 1.43,
      roundingStep: 50,
      minIncrement: 50,
      isActive: false,
    };
  }
}
