import { Injectable, inject, signal } from '@angular/core';
import { ConfigChangeVisibilityKey } from '../../../core/enums/config-governance.enum';
import { ConfigChangeSetsFormFactory } from '../../../core/factories/forms/config-change-sets-form.factory';
import { ConfigChangeSet } from '../../../core/types/config-governance.types';
import { toSelectOptions } from '../../../core/utils/collection';
import { trimText, trimToNull } from '../../../core/utils/normalize-text';
import { runRequest } from '../../../core/utils/request-state';
import { ConfigChangeSets } from '../../../core/services/config/config-change-sets';
import { ToastService } from '../../../core/services/ui/toast';

@Injectable()
export class ConfigChangeSetDraftActions {
  private readonly configChangeSets = inject(ConfigChangeSets);
  private readonly formFactory = inject(ConfigChangeSetsFormFactory);
  private readonly toast = inject(ToastService);

  readonly form = this.formFactory.createDraftForm();
  readonly visibilityOptions = toSelectOptions(
    Object.values(ConfigChangeVisibilityKey),
  );
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  create(onCreated: (changeSet: ConfigChangeSet) => void): void {
    this.error.set(null);
    this.message.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const draft = this.form.getRawValue();

    runRequest({
      request$: this.configChangeSets.createDraftChangeSet({
        title: trimText(draft.title),
        reason: trimText(draft.reason),
        changelogVisibility: draft.changelogVisibility,
        changelogTitle: trimToNull(draft.changelogTitle),
        changelogBody: trimToNull(draft.changelogBody),
      }),
      loading: this.isSaving,
      error: this.error,
      message: this.message,
      successMessage: 'Draft change set created.',
      errorMessage: 'Failed to create draft change set.',
      onSuccessMessage: (message) => this.toast.show('success', 'Draft created', message),
      onError: (message) =>
        this.toast.show('error', 'Cannot create draft', message),
      onSuccess: (changeSet) => {
        this.form.reset({
          title: '',
          reason: '',
          changelogVisibility: ConfigChangeVisibilityKey.None,
          changelogTitle: '',
          changelogBody: '',
        });
        onCreated(changeSet);
      },
    });
  }
}
