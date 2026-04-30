import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { AntiAbuseCaseReadModel } from '../../../core/domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseSanctionTypeEntry } from '../../../core/domain/anti-abuse/anti-abuse-dictionary.model';
import { CreatedSanctionWorkflowResult } from '../../../core/domain/anti-abuse/anti-abuse-sanction-create.model';
import { AntiAbuseCaseSanctionCreateState } from '../../../core/services/anti-abuse/anti-abuse-case-sanction-create.state';
import { AntiAbuseSanctionCreateWorkflow } from '../../../core/services/anti-abuse/anti-abuse-sanction-create-workflow';
import { ModerationActions } from '../../../core/services/moderation/moderation-actions';
import { AntiAbuseCaseTargetSearchEvent } from '../../../core/types/anti-abuse-case-target-search.types';
import {
  ModerationHeroTarget,
  ModerationItemTarget,
} from '../../../core/domain/moderation/moderation-action.model';
import { MetadataDisplay } from '../../../shared/metadata-display/metadata-display';

@Component({
  selector: 'app-anti-abuse-case-sanction-create-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    MetadataDisplay,
  ],
  templateUrl: './anti-abuse-case-sanction-create-section.html',
})
export class AntiAbuseCaseSanctionCreateSection {
  private readonly workflow = inject(AntiAbuseSanctionCreateWorkflow);
  private readonly moderationActions = inject(ModerationActions);
  private readonly destroyRef = inject(DestroyRef);

  readonly caseItem = input.required<AntiAbuseCaseReadModel>();
  readonly sanctionTypes = input.required<AntiAbuseSanctionTypeEntry[]>();
  readonly canTriageAntiAbuse = input.required<boolean>();
  readonly sanctionCreated = output<CreatedSanctionWorkflowResult>();
  readonly state = new AntiAbuseCaseSanctionCreateState(
    this.workflow,
    this.moderationActions,
    this.destroyRef,
    () => this.caseItem(),
    (result) => this.sanctionCreated.emit(result),
  );

  constructor() {
    effect(() => {
      this.state.syncContext(
        this.caseItem(),
        this.sanctionTypes(),
        this.canTriageAntiAbuse(),
      );
    });
  }

  onSanctionTypeChange(): void {
    this.state.onSanctionTypeChange(this.sanctionTypes());
  }

  searchTargetHeroes(event: AntiAbuseCaseTargetSearchEvent): void {
    this.state.searchTargetHeroes(event);
  }

  searchSourceHeroes(event: AntiAbuseCaseTargetSearchEvent): void {
    this.state.searchSourceHeroes(event);
  }

  searchItems(event: AntiAbuseCaseTargetSearchEvent): void {
    this.state.searchItems(event);
  }

  selectTargetHero(target: ModerationHeroTarget): void {
    this.state.selectTargetHero(target);
  }

  selectSourceHero(target: ModerationHeroTarget): void {
    this.state.selectSourceHero(target);
  }

  selectItem(target: ModerationItemTarget): void {
    this.state.selectItem(target);
  }
}
