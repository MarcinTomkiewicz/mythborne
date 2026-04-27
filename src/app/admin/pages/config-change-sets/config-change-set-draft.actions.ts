import { Injectable, inject, signal } from '@angular/core';
import { ConfigChangeVisibilityKey } from '../../../core/enums/config-governance.enum';
import { ConfigChangeSetsFormFactory } from '../../../core/factories/forms/config-change-sets-form.factory';
import { ConfigChangeSet } from '../../../core/types/config-governance.types';
import { toSelectOptions } from '../../../core/utils/collection';
import { trimText, trimToNull } from '../../../core/utils/normalize-text';
import { runRequest } from '../../../core/utils/request-state';
import { AuthState } from '../../../core/services/auth/auth-state';
import { ConfigChangeSets } from '../../../core/services/config/config-change-sets';

@Injectable()
export class ConfigChangeSetDraftActions {
  private readonly authState = inject(AuthState);
  private readonly configChangeSets = inject(ConfigChangeSets);
  private readonly formFactory = inject(ConfigChangeSetsFormFactory);

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
        requestedBy: this.authState.user()?.id ?? null,
      }),
      loading: this.isSaving,
      error: this.error,
      message: this.message,
      successMessage: 'Draft change set created.',
      errorMessage: 'Failed to create draft change set.',
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
