import { Injectable } from '@angular/core';
import {
  ExplorationTrialAdminData,
  TrialCombatCandidateAdminView,
  TrialRewardAssignmentAdminView,
} from '../../../core/domain/exploration/exploration-trial-admin.model';
import {
  assignmentFormValue,
  candidateFormValue,
  createTrialCombatCandidateForm,
  createTrialDefinitionForm,
  createTrialRewardAssignmentForm,
  trialFormValue,
} from './exploration-trials-forms';

@Injectable({ providedIn: 'root' })
export class ExplorationTrialFormFactory {
  createTrialDefinitionForm() {
    return createTrialDefinitionForm();
  }

  createTrialCombatCandidateForm() {
    return createTrialCombatCandidateForm();
  }

  createTrialRewardAssignmentForm() {
    return createTrialRewardAssignmentForm();
  }

  trialValue(data: ExplorationTrialAdminData | null, trialId: string | null) {
    return trialFormValue(data, trialId);
  }

  candidateValue(row: TrialCombatCandidateAdminView | null) {
    return candidateFormValue(row);
  }

  assignmentValue(row: TrialRewardAssignmentAdminView | null) {
    return assignmentFormValue(row);
  }
}
