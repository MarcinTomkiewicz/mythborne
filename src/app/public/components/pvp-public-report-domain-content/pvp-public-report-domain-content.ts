import { Component, input } from '@angular/core';
import { PvpPublicReportCopy } from '../../../core/domain/pvp/pvp-public-report-copy.model';

@Component({
  selector: 'app-pvp-public-report-domain-content',
  standalone: true,
  templateUrl: './pvp-public-report-domain-content.html',
  host: { class: 'd-block w-100' },
})
export class PvpPublicReportDomainContent {
  readonly copy = input.required<PvpPublicReportCopy>();

  notFoundLabel(): string | null {
    const access = this.copy().access;

    return access.isAvailable ? null : access.notFoundLabel;
  }
}
