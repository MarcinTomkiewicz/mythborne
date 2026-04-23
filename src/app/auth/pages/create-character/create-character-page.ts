import { Component, inject } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { CreateCharacterPageFacade } from '../../../core/services/hero/create-character-page.facade';
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
  ],
  providers: [CreateCharacterPageFacade],
  templateUrl: './create-character-page.html',
})
export class CreateCharacterPage {
  readonly page = inject(CreateCharacterPageFacade);
}
