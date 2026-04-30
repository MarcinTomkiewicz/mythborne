import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { AntiAbuseCaseDetailReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseCaseDecision } from '../../../core/domain/anti-abuse/anti-abuse-decision.model';
import { AntiAbuseCaseDetails } from '../../../core/services/anti-abuse/anti-abuse-case-details';
import { ActiveServer } from '../../../core/services/server/active-server';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { ANTI_ABUSE_CASES_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminServerSwitcher } from '../../components/admin-server-switcher/admin-server-switcher';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import { AntiAbuseCaseDetailSections } from './anti-abuse-case-detail-sections';
import { AntiAbuseCaseSanctionCreateSection } from './anti-abuse-case-sanction-create-section';
import { AntiAbuseCaseStatusTransitionSection } from './anti-abuse-case-status-transition-section';
import { AntiAbuseCaseVerdictSection } from './anti-abuse-case-verdict-section';

@Component({
  selector: 'app-anti-abuse-case-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    MessageModule,
    LoadingOverlay,
    AdminServerSwitcher,
    AdminTagLinks,
    AntiAbuseCaseDetailSections,
    AntiAbuseCaseSanctionCreateSection,
    AntiAbuseCaseStatusTransitionSection,
    AntiAbuseCaseVerdictSection,
  ],
  templateUrl: './anti-abuse-case-detail-page.html',
})
export class AntiAbuseCaseDetailPage {
  private readonly activeServer = inject(ActiveServer);
  private readonly caseDetails = inject(AntiAbuseCaseDetails);
  private readonly route = inject(ActivatedRoute);
  private requestSequence = 0;

  readonly links = ANTI_ABUSE_CASES_PAGE_LINKS;
  readonly selectedServer = this.activeServer.selectedServer;
  readonly access = this.activeServer.access;
  readonly detail = signal<AntiAbuseCaseDetailReadModel | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly caseId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('caseId'))),
    { initialValue: this.route.snapshot.paramMap.get('caseId') },
  );
  readonly canTriageAntiAbuse = computed(
    () =>
      resolveStaffAccessPolicy({
        access: this.access(),
        selectedServer: this.selectedServer(),
      }).canTriageAntiAbuseSelectedServer,
  );

  constructor() {
    effect(() => {
      const serverId = this.selectedServer()?.id;
      const caseId = this.caseId();

      if (!serverId || !caseId || !this.canTriageAntiAbuse()) {
        this.requestSequence += 1;
        this.detail.set(null);
        this.error.set(null);
        return;
      }

      untracked(() => this.loadDetail(serverId, caseId));
    });
  }

  refresh(): void {
    const server = this.selectedServer();
    const caseId = this.caseId();

    if (server && caseId && this.canTriageAntiAbuse()) {
      this.loadDetail(server.id, caseId);
    }
  }

  applyCaseDecision(decision: AntiAbuseCaseDecision): void {
    this.detail.update((detail) =>
      this.canApplyCaseDecision(detail, decision)
        ? {
            ...detail,
            case: {
              ...detail.case,
              status: decision.status,
              statusReason: decision.statusReason,
              verdict: decision.verdict,
              verdictReason: decision.verdictReason,
              sanctionRequired: decision.sanctionRequired,
              noSanctionReason: decision.noSanctionReason,
              operatorNotes: decision.operatorNotes,
              resolvedAt: decision.resolvedAt,
              resolvedByUserId: decision.resolvedByUserId,
              cancelledAt: decision.cancelledAt,
              updatedAt: decision.updatedAt,
            },
          }
        : detail,
    );
  }

  private loadDetail(serverId: string, caseId: string): void {
    const requestId = ++this.requestSequence;
    const currentDetail = this.detail();

    if (
      currentDetail &&
      (currentDetail.case.serverId !== serverId || currentDetail.case.id !== caseId)
    ) {
      this.detail.set(null);
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.caseDetails
      .getCaseDetail({ serverId, caseId })
      .pipe(
        finalize(() => {
          if (requestId === this.requestSequence) {
            this.isLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (detail) => {
          if (!this.isCurrentRequest(requestId, serverId, caseId)) {
            return;
          }

          this.detail.set(detail);
        },
        error: (error: unknown) => {
          if (!this.isCurrentRequest(requestId, serverId, caseId)) {
            return;
          }

          this.error.set(
            error instanceof Error ? error.message : 'Failed to load anti-abuse case.',
          );
        },
      });
  }

  private isCurrentRequest(requestId: number, serverId: string, caseId: string): boolean {
    return (
      requestId === this.requestSequence &&
      this.selectedServer()?.id === serverId &&
      this.caseId() === caseId &&
      this.canTriageAntiAbuse()
    );
  }

  private canApplyCaseDecision(
    detail: AntiAbuseCaseDetailReadModel | null,
    decision: AntiAbuseCaseDecision,
  ): detail is AntiAbuseCaseDetailReadModel {
    return (
      detail !== null &&
      decision.id === detail.case.id &&
      decision.serverId === detail.case.serverId &&
      this.selectedServer()?.id === detail.case.serverId &&
      this.caseId() === detail.case.id
    );
  }
}
