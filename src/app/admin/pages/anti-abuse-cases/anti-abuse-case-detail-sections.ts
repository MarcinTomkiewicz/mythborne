import { Component, input } from '@angular/core';
import { AntiAbuseCaseDetailReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseCaseAuditSection } from './anti-abuse-case-audit-section';
import { AntiAbuseCaseOverviewSection } from './anti-abuse-case-overview-section';
import { AntiAbuseCaseParticipantsSection } from './anti-abuse-case-participants-section';
import { AntiAbuseCaseReportsDeclarationsSection } from './anti-abuse-case-reports-declarations-section';
import { AntiAbuseCaseSanctionItemsSection } from './anti-abuse-case-sanction-items-section';
import { AntiAbuseCaseSanctionsSection } from './anti-abuse-case-sanctions-section';
import { AntiAbuseCaseSignalsSection } from './anti-abuse-case-signals-section';

@Component({
  selector: 'app-anti-abuse-case-detail-sections',
  standalone: true,
  imports: [
    AntiAbuseCaseOverviewSection,
    AntiAbuseCaseParticipantsSection,
    AntiAbuseCaseSignalsSection,
    AntiAbuseCaseReportsDeclarationsSection,
    AntiAbuseCaseSanctionsSection,
    AntiAbuseCaseSanctionItemsSection,
    AntiAbuseCaseAuditSection,
  ],
  templateUrl: './anti-abuse-case-detail-sections.html',
})
export class AntiAbuseCaseDetailSections {
  readonly detail = input.required<AntiAbuseCaseDetailReadModel>();
}
