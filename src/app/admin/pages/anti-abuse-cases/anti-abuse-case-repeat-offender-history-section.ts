import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { AntiAbuseCaseDetailReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseRepeatOffenderHistory,
  AntiAbuseRepeatOffenderHistoryTargetOption,
} from '../../../core/domain/anti-abuse/anti-abuse-repeat-offender-history.model';
import { AntiAbuseSanctionDecision } from '../../../core/domain/anti-abuse/anti-abuse-sanction.model';
import { AntiAbuseRepeatOffenderHistoryService } from '../../../core/services/anti-abuse/anti-abuse-repeat-offender-history';
import { antiAbuseCaseStatusLabel, antiAbuseSanctionStatusLabel } from '../../../core/utils/anti-abuse-decision-display';
import { displayValue } from '../../../core/utils/display-value';

@Component({
  selector: 'app-anti-abuse-case-repeat-offender-history-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, MessageModule, SelectModule],
  templateUrl: './anti-abuse-case-repeat-offender-history-section.html',
})
export class AntiAbuseCaseRepeatOffenderHistorySection {
  private readonly historyService = inject(AntiAbuseRepeatOffenderHistoryService);
  private readonly destroyRef = inject(DestroyRef);
  private requestSequence = 0;
  private activeContextKey: string | null = null;

  readonly detail = input.required<AntiAbuseCaseDetailReadModel>();
  readonly targetControl =
    new FormControl<AntiAbuseRepeatOffenderHistoryTargetOption | null>(null);
  readonly history = signal<AntiAbuseRepeatOffenderHistory | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const detail = this.detail();
      const contextKey = `${detail.case.serverId}:${detail.case.id}`;

      if (contextKey !== this.activeContextKey) {
        this.activeContextKey = contextKey;
        this.requestSequence += 1;
        this.history.set(null);
        this.error.set(null);
        this.targetControl.setValue(this.targetOptions()[0] ?? null);
      }

      this.syncSelectedTarget();
    });
  }

  targetOptions(): AntiAbuseRepeatOffenderHistoryTargetOption[] {
    const detail = this.detail();
    const entries: AntiAbuseRepeatOffenderHistoryTargetOption[] = [];

    for (const participant of detail.participants) {
      addTarget(entries, participant.roleKey, participant.heroId, participant.userId);
    }

    addTarget(entries, 'Primary', detail.case.primaryHeroId, detail.case.primaryUserId);

    for (const sanction of detail.sanctions) {
      addTarget(entries, 'Sanction target', sanction.targetHeroId, sanction.targetUserId);
    }

    for (const penalty of detail.characterPointPenalties) {
      addTarget(entries, 'CP penalty target', penalty.heroId, penalty.userId);
    }

    return uniqueTargets(entries);
  }

  loadHistory(): void {
    const detail = this.detail();
    const target = this.targetControl.value;

    this.error.set(null);

    if (!target || !this.hasTarget(target)) {
      this.history.set(null);
      this.error.set('Select a hero/account target before loading history.');
      return;
    }

    const requestId = ++this.requestSequence;
    const serverId = detail.case.serverId;
    const caseId = detail.case.id;

    this.isLoading.set(true);
    this.historyService
      .getHistory({
        serverId,
        heroId: target.heroId,
        userId: target.userId,
        excludeCaseId: caseId,
      })
      .pipe(
        finalize(() => {
          if (requestId === this.requestSequence) {
            this.isLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (history) => {
          if (!this.isCurrentRequest(requestId, serverId, caseId, target)) {
            return;
          }

          this.history.set(history);
        },
        error: (error: unknown) => {
          if (!this.isCurrentRequest(requestId, serverId, caseId, target)) {
            return;
          }

          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load anti-abuse history.',
          );
        },
      });
  }

  onTargetChange(): void {
    this.requestSequence += 1;
    this.history.set(null);
    this.error.set(null);
  }

  caseStatus(status: AntiAbuseRepeatOffenderHistory['cases'][number]['status']): string {
    return antiAbuseCaseStatusLabel(status);
  }

  sanctionStatus(status: AntiAbuseRepeatOffenderHistory['sanctions'][number]['status']): string {
    return antiAbuseSanctionStatusLabel(status);
  }

  sanctionTypeLabel(sanction: AntiAbuseSanctionDecision): string {
    return (
      this.history()?.dictionaries.sanctionTypes.find(
        (entry) => entry.key === sanction.sanctionTypeKey,
      )?.label ??
      this.detail().dictionaries.sanctionTypes.find(
        (entry) => entry.key === sanction.sanctionTypeKey,
      )?.label ??
      sanction.sanctionTypeKey
    );
  }

  value(value: string | number | null | undefined): string {
    return displayValue(value);
  }

  private isCurrentRequest(
    requestId: number,
    serverId: string,
    caseId: string,
    target: AntiAbuseRepeatOffenderHistoryTargetOption,
  ): boolean {
    const currentDetail = this.detail();
    const currentTarget = this.targetControl.value;

    return (
      requestId === this.requestSequence &&
      currentDetail.case.serverId === serverId &&
      currentDetail.case.id === caseId &&
      currentTarget?.heroId === target.heroId &&
      currentTarget?.userId === target.userId
    );
  }

  private syncSelectedTarget(): void {
    const target = this.targetControl.value;

    if (!target || this.hasTarget(target)) {
      return;
    }

    this.requestSequence += 1;
    this.history.set(null);
    this.error.set(null);
    this.targetControl.setValue(this.targetOptions()[0] ?? null);
  }

  private hasTarget(target: AntiAbuseRepeatOffenderHistoryTargetOption): boolean {
    return this.targetOptions().some(
      (entry) => entry.heroId === target.heroId && entry.userId === target.userId,
    );
  }
}

function addTarget(
  entries: AntiAbuseRepeatOffenderHistoryTargetOption[],
  labelPrefix: string,
  heroId: string | null | undefined,
  userId: string | null | undefined,
): void {
  if (!heroId && !userId) {
    return;
  }

  entries.push({
    heroId: heroId ?? null,
    userId: userId ?? null,
    label: targetLabel(labelPrefix, heroId ?? null, userId ?? null),
  });
}

function targetLabel(
  role: string,
  heroId: string | null,
  userId: string | null,
): string {
  return `${role} - hero ${displayValue(heroId)} - account ${displayValue(userId)}`;
}

function uniqueTargets(
  entries: readonly AntiAbuseRepeatOffenderHistoryTargetOption[],
): AntiAbuseRepeatOffenderHistoryTargetOption[] {
  const targets = new Map<string, AntiAbuseRepeatOffenderHistoryTargetOption>();

  for (const entry of entries) {
    const key = `${entry.heroId ?? ''}:${entry.userId ?? ''}`;

    if (!targets.has(key)) {
      targets.set(key, entry);
    }
  }

  return [...targets.values()];
}
