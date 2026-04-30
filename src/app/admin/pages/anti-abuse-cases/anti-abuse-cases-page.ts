import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import {
  ANTI_ABUSE_CASE_SOURCE_OPTIONS,
  ANTI_ABUSE_CASE_STATUS_FALLBACK_LABELS,
  ANTI_ABUSE_CASE_VERDICT_OPTIONS,
} from '../../../core/constants/anti-abuse-display.const';
import {
  AntiAbuseCaseReadModel,
  AntiAbuseCaseSource,
} from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import {
  AntiAbuseCaseStatus,
  AntiAbuseCaseVerdict,
} from '../../../core/domain/anti-abuse/anti-abuse-decision.model';
import {
  ModerationHeroTarget,
  ModerationUserTarget,
} from '../../../core/domain/moderation/moderation-action.model';
import { AntiAbuseCases } from '../../../core/services/anti-abuse/anti-abuse-cases';
import { AntiAbuseCaseTargetSearchState } from '../../../core/services/anti-abuse/anti-abuse-case-target-search.state';
import { ActiveServer } from '../../../core/services/server/active-server';
import { ModerationActions } from '../../../core/services/moderation/moderation-actions';
import { AntiAbuseCaseTargetSearchEvent } from '../../../core/types/anti-abuse-case-target-search.types';
import { AntiAbuseCaseListFilterForm } from '../../../core/types/forms/anti-abuse-case-list-form.types';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { ANTI_ABUSE_CASES_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { AntiAbuseCaseListCard } from './anti-abuse-case-list-card';

@Component({
  selector: 'app-anti-abuse-cases-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    LoadingOverlay,
    AdminServerSwitcher,
    AdminTagLinks,
    AntiAbuseCaseListCard,
  ],
  templateUrl: './anti-abuse-cases-page.html',
})
export class AntiAbuseCasesPage {
  private readonly activeServer = inject(ActiveServer);
  private readonly antiAbuseCases = inject(AntiAbuseCases);
  private readonly moderationActions = inject(ModerationActions);
  private readonly destroyRef = inject(DestroyRef);
  private caseListRequestId = 0;
  private targetContextKey: string | null = null;

  readonly links = ANTI_ABUSE_CASES_PAGE_LINKS;
  readonly selectedServer = this.activeServer.selectedServer;
  readonly access = this.activeServer.access;
  readonly cases = signal<AntiAbuseCaseReadModel[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly targetSearch = new AntiAbuseCaseTargetSearchState(
    this.moderationActions,
    this.destroyRef,
    {
      setParticipantHeroId: (heroId) =>
        this.filterForm.controls.participantHeroId.setValue(heroId),
      setParticipantUserId: (userId) =>
        this.filterForm.controls.participantUserId.setValue(userId),
      setError: (message) => this.error.set(message),
    },
  );
  readonly appliedFilters = signal(createEmptyFilters());
  readonly filterForm: AntiAbuseCaseListFilterForm = new FormGroup({
    status: new FormControl<AntiAbuseCaseStatus | null>(null),
    verdict: new FormControl<AntiAbuseCaseVerdict | null>(null),
    source: new FormControl<AntiAbuseCaseSource | null>(null),
    participantHeroId: new FormControl<string | null>(null),
    participantUserId: new FormControl<string | null>(null),
    createdFrom: new FormControl<string | null>(null),
    createdTo: new FormControl<string | null>(null),
  });
  readonly canTriageAntiAbuse = computed(
    () =>
      resolveStaffAccessPolicy({
        access: this.access(),
        selectedServer: this.selectedServer(),
      }).canTriageAntiAbuseSelectedServer,
  );
  readonly statusOptions = Object.entries(ANTI_ABUSE_CASE_STATUS_FALLBACK_LABELS).map(
    ([value, label]) => ({ label, value: value as AntiAbuseCaseStatus }),
  );
  readonly sourceOptions = ANTI_ABUSE_CASE_SOURCE_OPTIONS;
  readonly verdictOptions = ANTI_ABUSE_CASE_VERDICT_OPTIONS;

  constructor() {
    effect(() => {
      const serverId = this.selectedServer()?.id ?? null;
      const canTriage = this.canTriageAntiAbuse();

      untracked(() => {
        this.resetTargetFiltersWhenContextChanges(serverId, canTriage);
        this.targetSearch.loadAccess(serverId, canTriage);
        this.loadCases();
      });
    });
  }

  refresh(): void {
    this.loadCases();
  }

  applyFilters(): void {
    this.appliedFilters.set(this.filterForm.getRawValue());
    this.loadCases();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.targetSearch.reset();
    this.appliedFilters.set(createEmptyFilters());
    this.loadCases();
  }

  searchUserTargets(event: AntiAbuseCaseTargetSearchEvent): void {
    this.targetSearch.searchUserTargets(
      event,
      this.selectedServer()?.id ?? null,
      this.canTriageAntiAbuse(),
    );
  }

  searchHeroTargets(event: AntiAbuseCaseTargetSearchEvent): void {
    this.targetSearch.searchHeroTargets(
      event,
      this.selectedServer()?.id ?? null,
      this.canTriageAntiAbuse(),
    );
  }

  selectUserTarget(target: ModerationUserTarget): void {
    this.targetSearch.selectUserTarget(target);
  }

  selectHeroTarget(target: ModerationHeroTarget): void {
    this.targetSearch.selectHeroTarget(target);
  }

  clearUserTarget(): void {
    this.targetSearch.clearUserTarget();
  }

  clearHeroTarget(): void {
    this.targetSearch.clearHeroTarget();
  }

  private loadCases(): void {
    const server = this.selectedServer();
    const requestId = ++this.caseListRequestId;

    if (!server) {
      this.cases.set([]);
      this.error.set(null);
      this.isLoading.set(false);
      return;
    }

    if (!this.canTriageAntiAbuse()) {
      this.cases.set([]);
      this.error.set(null);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const filters = this.appliedFilters();

    this.antiAbuseCases
      .getCasesForServer({
        serverId: server.id,
        status: filters.status,
        verdict: filters.verdict,
        source: filters.source,
        participantHeroId: filters.participantHeroId,
        participantUserId: filters.participantUserId,
        createdFrom: toIsoDateTime(filters.createdFrom),
        createdTo: toIsoDateTime(filters.createdTo),
      })
      .pipe(
        finalize(() => {
          if (requestId === this.caseListRequestId) {
            this.isLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (cases) => {
          if (requestId === this.caseListRequestId) {
            this.cases.set(cases);
          }
        },
        error: (error: unknown) => {
          if (requestId === this.caseListRequestId) {
            this.error.set(
              error instanceof Error ? error.message : 'Failed to load anti-abuse cases.',
            );
          }
        },
      });
  }

  private resetTargetFiltersWhenContextChanges(
    serverId: string | null,
    canTriage: boolean,
  ): void {
    const contextKey = canTriage && serverId ? serverId : null;

    if (contextKey === this.targetContextKey) {
      return;
    }

    this.targetContextKey = contextKey;
    this.clearParticipantTargets();
  }

  private clearParticipantTargets(): void {
    this.targetSearch.reset();
    this.filterForm.patchValue({
      participantHeroId: null,
      participantUserId: null,
    });
    this.appliedFilters.update((filters) => ({
      ...filters,
      participantHeroId: null,
      participantUserId: null,
    }));
  }
}

function createEmptyFilters(): AntiAbuseCaseListFilterForm['value'] {
  return {
    status: null,
    verdict: null,
    source: null,
    participantHeroId: null,
    participantUserId: null,
    createdFrom: null,
    createdTo: null,
  };
}

function toIsoDateTime(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
