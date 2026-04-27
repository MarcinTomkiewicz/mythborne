import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { EMPTY_AUDIT_DICTIONARY_DATA } from '../../../core/constants/audit-dictionary.const';
import { AuditDictionaries } from '../../../core/services/audit/audit-dictionaries';
import { AuditDictionaryData } from '../../../core/domain/audit/audit-dictionary.model';
import { AUDIT_DICTIONARIES_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

@Component({
  selector: 'app-audit-dictionaries-page',
  standalone: true,
  imports: [LoadingOverlay, AdminTagLinks],
  templateUrl: './audit-dictionaries-page.html',
})
export class AuditDictionariesPage implements OnInit {
  private readonly auditDictionaries = inject(AuditDictionaries);

  readonly links = AUDIT_DICTIONARIES_PAGE_LINKS;
  readonly data = signal<AuditDictionaryData>(EMPTY_AUDIT_DICTIONARY_DATA);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDictionaries();
  }

  private loadDictionaries(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.auditDictionaries
      .getActiveDictionaries()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.data.set(data),
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load audit dictionaries.',
          ),
      });
  }
}
