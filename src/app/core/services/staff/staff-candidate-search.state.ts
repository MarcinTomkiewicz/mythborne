import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs';
import { STAFF_CANDIDATE_MIN_QUERY_LENGTH } from '../../constants/staff-management.const';
import { StaffUserCandidate } from '../../domain/staff/staff-management.model';
import { ToastService } from '../ui/toast';
import { StaffManagement } from './staff-management';

@Injectable()
export class StaffCandidateSearchState {
  private readonly staffManagement = inject(StaffManagement);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchForm = this.formBuilder.nonNullable.group({
    query: '',
  });
  readonly candidates = signal<StaffUserCandidate[]>([]);
  readonly selectedCandidate = signal<StaffUserCandidate | null>(null);
  readonly isSearching = signal(false);
  readonly searchMessage = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  searchCandidates(serverId: string | null, canManageStaff: boolean): void {
    const query = this.searchForm.controls.query.value.trim();

    this.searchMessage.set(null);
    this.selectedCandidate.set(null);
    this.error.set(null);

    if (!serverId) {
      this.searchMessage.set('Select a server before searching staff candidates.');
      return;
    }

    if (!canManageStaff) {
      this.searchMessage.set('This account cannot manage staff for the selected server.');
      return;
    }

    if (query.length < STAFF_CANDIDATE_MIN_QUERY_LENGTH) {
      this.candidates.set([]);
      this.searchMessage.set(
        `Enter at least ${STAFF_CANDIDATE_MIN_QUERY_LENGTH} characters to search.`,
      );
      return;
    }

    this.isSearching.set(true);
    this.staffManagement
      .searchUserCandidates(serverId, query)
      .pipe(
        finalize(() => this.isSearching.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (candidates) => {
          this.candidates.set(candidates);
          this.searchMessage.set(candidates.length ? null : 'No candidates matched this query.');
        },
        error: (error) => this.handleError('Candidate search failed', error),
      });
  }

  selectCandidate(candidate: StaffUserCandidate): void {
    this.selectedCandidate.set(candidate);
  }

  reset(): void {
    this.candidates.set([]);
    this.selectedCandidate.set(null);
    this.searchMessage.set(null);
    this.error.set(null);
  }

  private handleError(summary: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.error.set(message);
    this.toast.show('error', summary, message);
  }
}
