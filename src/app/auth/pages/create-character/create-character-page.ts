import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { CREATE_CHARACTER_HERO_FIELDS } from '../../../core/config/forms/auth-form.config';
import { CreateCharacterPageFacade } from '../../../core/services/hero/create-character-page.facade';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
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
    LoadingOverlay,
    ReactiveFormsModule,
    FormFields,
  ],
  providers: [CreateCharacterPageFacade],
  templateUrl: './create-character-page.html',
})
export class CreateCharacterPage {
  readonly page = inject(CreateCharacterPageFacade);
  readonly heroFields = CREATE_CHARACTER_HERO_FIELDS;
}
