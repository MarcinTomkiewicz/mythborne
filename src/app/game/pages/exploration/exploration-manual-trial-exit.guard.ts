import { CanDeactivateFn } from '@angular/router';
import type { ExplorationPage } from './exploration-page';

export const explorationManualTrialExitGuard: CanDeactivateFn<ExplorationPage> =
  (component) => component.canDeactivate();
