import { Component, DestroyRef, effect, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { CREATE_CHARACTER_HERO_FIELDS } from '../../../core/config/forms/auth-form.config';
import { CreateCharacterPageFacade } from '../../../core/services/hero/create-character-page.facade';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { AccountEntryServerSelector } from './account-entry-server-selector';
import { StepAccount } from './components/steps/step-account';
import { StepHero } from './components/steps/step-hero';
import { StepOrigin } from './components/steps/step-origin';
import { StepUser } from './components/steps/step-user';

@Component({
  selector: 'app-create-character-page',
  standalone: true,
  imports: [
    StepperModule,
    StepAccount,
    StepHero,
    StepOrigin,
    StepUser,
    AccountEntryServerSelector,
    LoadingOverlay,
    ReactiveFormsModule,
    FormFields,
    NgTemplateOutlet,
  ],
  providers: [CreateCharacterPageFacade],
  templateUrl: './create-character-page.html',
})
export class CreateCharacterPage {
  readonly page = inject(CreateCharacterPageFacade);
  private readonly destroyRef = inject(DestroyRef);
  readonly heroFields = CREATE_CHARACTER_HERO_FIELDS;
  readonly serverForm = new FormGroup({
    selectedServerId: new FormControl<string | null>(null),
  });
  readonly selectedServerControl = this.serverForm.controls.selectedServerId;

  private readonly selectedServerSync = effect(() => {
    const serverId = this.page.selectedServerAvailability()?.serverId ??
      this.page.creationServerOptions()[0]?.id ??
      null;

    if (this.selectedServerControl.value !== serverId) {
      this.selectedServerControl.setValue(serverId, { emitEvent: false });
    }
  });

  private readonly selectedServerChanges = this.selectedServerControl.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((serverId) => this.page.selectCreationServer(serverId));
}
