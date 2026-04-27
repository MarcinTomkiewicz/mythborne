import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigChangeSetsFormFactory } from '../../../core/factories/forms/config-change-sets-form.factory';
import { ConfigChangeSet } from '../../../core/types/config-governance.types';
import { trimText } from '../../../core/utils/normalize-text';
import { runRequest } from '../../../core/utils/request-state';
import { ConfigChangeSetWorkflow } from '../../../core/services/config/config-change-set-workflow';

@Injectable()
export class ConfigChangeSetWorkflowActions {
  private readonly workflow = inject(ConfigChangeSetWorkflow);
  private readonly formFactory = inject(ConfigChangeSetsFormFactory);

  readonly cancelForm = this.formFactory.createCancelForm();
  readonly isRunning = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  markReady(
    changeSet: ConfigChangeSet,
    onSuccess: (changeSet: ConfigChangeSet) => void,
  ): void {
    this.runWorkflow(
      this.workflow.markReady(changeSet.id),
      'Change set marked ready.',
      onSuccess,
    );
  }

  apply(
    changeSet: ConfigChangeSet,
    onSuccess: (changeSet: ConfigChangeSet) => void,
  ): void {
    this.runWorkflow(
      this.workflow.apply(changeSet.id),
      'Change set applied.',
      onSuccess,
    );
  }

  cancel(
    changeSet: ConfigChangeSet,
    onSuccess: (changeSet: ConfigChangeSet) => void,
  ): void {
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    this.runWorkflow(
      this.workflow.cancel(
        changeSet.id,
        trimText(this.cancelForm.getRawValue().cancelledReason),
      ),
      'Change set cancelled.',
      (updatedChangeSet) => {
        this.cancelForm.reset({ cancelledReason: '' });
        onSuccess(updatedChangeSet);
      },
    );
  }

  private runWorkflow(
    request$: Observable<ConfigChangeSet>,
    successMessage: string,
    onSuccess: (changeSet: ConfigChangeSet) => void,
  ): void {
    runRequest({
      request$,
      loading: this.isRunning,
      error: this.error,
      message: this.message,
      successMessage,
      errorMessage: 'Failed to update config change set.',
      onSuccess,
    });
  }
}
