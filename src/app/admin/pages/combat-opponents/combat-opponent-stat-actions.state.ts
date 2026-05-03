import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { concatMap, from, toArray } from 'rxjs';
import { CombatOpponentStatGridRow } from '../../../core/domain/combat/combat-opponent.model';
import { CombatOpponentAdmin } from '../../../core/services/combat/combat-opponent-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { UpsertCombatOpponentStatValueInput } from '../../../core/types/combat-opponent-admin-rpc.types';
import { RequestToken } from '../../../core/utils/request-token';
import { trimRequiredValidator } from '../../../core/validators/form.validators';
import { CombatOpponentsPageState } from './combat-opponents-page.state';
import {
  markCombatOpponentReasonInvalid,
  runCombatOpponentWorkflowAction,
} from './combat-opponents-workflow-actions';

@Injectable()
export class CombatOpponentStatActionsState {
  private readonly page = inject(CombatOpponentsPageState);
  private readonly admin = inject(CombatOpponentAdmin);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly token = new RequestToken();

  readonly reason = new FormControl<string>('', {
    nonNullable: true,
    validators: [trimRequiredValidator()],
  });
  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);
  private readonly draftValues = signal<Record<string, string>>({});

  syncRows(rows: CombatOpponentStatGridRow[]): void {
    this.draftValues.update((current) => {
      const next: Record<string, string> = {};

      for (const row of rows) {
        next[row.statKey] = current[row.statKey] ?? String(row.baseValue);
      }

      return next;
    });
  }

  statDraftValue(row: CombatOpponentStatGridRow): string {
    return this.draftValues()[row.statKey] ?? String(row.baseValue);
  }

  setStatDraftValue(statKey: string, value: string): void {
    this.draftValues.update((current) => ({ ...current, [statKey]: value }));
  }

  save(row: CombatOpponentStatGridRow, rawBaseValue: string | number | null): void {
    const opponentDefinitionId = this.page.selectedOpponentId();
    const baseValue = Number(rawBaseValue);

    if (!opponentDefinitionId) {
      this.page.setError('Save an opponent definition before editing stat baselines.');
      return;
    }

    this.reason.markAsTouched();

    if (!Number.isFinite(baseValue) || baseValue < 0) {
      this.page.setError('Stat baseline must be a non-negative number.');
      return;
    }

    if (markCombatOpponentReasonInvalid(this.reasonError, this.reason)) {
      return;
    }

    runCombatOpponentWorkflowAction({
      token: this.token,
      destroyRef: this.destroyRef,
      toast: this.toast,
      isSaving: this.isSaving,
      setError: (message) => this.page.setError(message),
      call: () => this.admin.saveStatValue({
        statValueId: row.statValueId,
        opponentDefinitionId,
        statKey: row.statKey,
        baseValue,
        sortOrder: row.sortOrder,
        reason: this.reason.value,
      }),
      successMessage: 'Stat baseline saved.',
      failureMessage: 'Failed to save combat opponent stat baseline.',
      onSuccess: () => this.page.loadInitialData(),
    });
  }

  saveAll(rows: CombatOpponentStatGridRow[]): void {
    const opponentDefinitionId = this.page.selectedOpponentId();

    if (!opponentDefinitionId) {
      this.page.setError('Save an opponent definition before editing stat baselines.');
      return;
    }

    if (markCombatOpponentReasonInvalid(this.reasonError, this.reason)) {
      return;
    }

    const payloads: UpsertCombatOpponentStatValueInput[] = [];

    for (const row of rows) {
      const baseValue = Number(this.statDraftValue(row));

      if (!Number.isFinite(baseValue) || baseValue < 0) {
        this.page.setError(`${row.statLabel} baseline must be a non-negative number.`);
        return;
      }

      payloads.push({
        statValueId: row.statValueId,
        opponentDefinitionId,
        statKey: row.statKey,
        baseValue,
        sortOrder: row.sortOrder,
        reason: this.reason.value,
      });
    }

    if (payloads.length === 0) {
      this.page.setError('No stat baselines are available to save.');
      return;
    }

    runCombatOpponentWorkflowAction({
      token: this.token,
      destroyRef: this.destroyRef,
      toast: this.toast,
      isSaving: this.isSaving,
      setError: (message) => this.page.setError(message),
      call: () => from(payloads).pipe(
        concatMap((payload) => this.admin.saveStatValue(payload)),
        toArray(),
      ),
      successMessage: 'All stat baselines saved.',
      failureMessage: 'Failed to save all combat opponent stat baselines. Some earlier rows may already have been saved.',
      onSuccess: () => this.page.loadInitialData(),
    });
  }

  delete(row: CombatOpponentStatGridRow): void {
    const statValueId = row.statValueId;

    if (!statValueId) {
      return;
    }

    if (markCombatOpponentReasonInvalid(this.reasonError, this.reason)) {
      return;
    }

    runCombatOpponentWorkflowAction({
      token: this.token,
      destroyRef: this.destroyRef,
      toast: this.toast,
      isSaving: this.isSaving,
      setError: (message) => this.page.setError(message),
      call: () => this.admin.deleteStatValue(statValueId, this.reason.value),
      successMessage: 'Stat baseline deleted.',
      failureMessage: 'Failed to delete combat opponent stat baseline.',
      onSuccess: () => this.page.loadInitialData(),
    });
  }
}
