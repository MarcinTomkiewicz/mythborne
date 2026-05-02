import { Injectable } from '@angular/core';
import {
  EncounterCombatCandidateAdminView,
  EncounterEffectPayloadAdminView,
  EncounterResourcePayloadAdminView,
  EncounterRewardAssignmentAdminView,
  ExplorationEncounterAdminData,
  ExplorationEffectDefinitionAdminView,
} from '../../../core/domain/exploration/exploration-encounter-admin.model';
import {
  assignmentFormValue,
  candidateFormValue,
  createEncounterCombatCandidateForm,
  createEncounterDefinitionForm,
  createEncounterEffectPayloadForm,
  createEncounterResourcePayloadForm,
  createEncounterRewardAssignmentForm,
  createExplorationEffectDefinitionForm,
  effectDefinitionFormValue,
  effectPayloadFormValue,
  encounterFormValue,
  resourcePayloadFormValue,
} from './exploration-encounters-forms';

@Injectable({ providedIn: 'root' })
export class ExplorationEncounterFormFactory {
  createEncounterDefinitionForm() {
    return createEncounterDefinitionForm();
  }

  createEncounterCombatCandidateForm() {
    return createEncounterCombatCandidateForm();
  }

  createEncounterRewardAssignmentForm() {
    return createEncounterRewardAssignmentForm();
  }

  createEncounterResourcePayloadForm() {
    return createEncounterResourcePayloadForm();
  }

  createExplorationEffectDefinitionForm() {
    return createExplorationEffectDefinitionForm();
  }

  createEncounterEffectPayloadForm() {
    return createEncounterEffectPayloadForm();
  }

  encounterValue(data: ExplorationEncounterAdminData | null, encounterId: string | null) {
    return encounterFormValue(data, encounterId);
  }

  candidateValue(row: EncounterCombatCandidateAdminView | null) {
    return candidateFormValue(row);
  }

  assignmentValue(row: EncounterRewardAssignmentAdminView | null) {
    return assignmentFormValue(row);
  }

  resourcePayloadValue(row: EncounterResourcePayloadAdminView | null) {
    return resourcePayloadFormValue(row);
  }

  effectDefinitionValue(row: ExplorationEffectDefinitionAdminView | null) {
    return effectDefinitionFormValue(row);
  }

  effectPayloadValue(row: EncounterEffectPayloadAdminView | null) {
    return effectPayloadFormValue(row);
  }
}
