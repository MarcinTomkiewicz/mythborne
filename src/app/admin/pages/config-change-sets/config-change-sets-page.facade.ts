import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigChangeStatusKey } from '../../../core/enums/config-governance.enum';
import {
  ConfigChangeEntry,
  ConfigChangeSet,
  ConfigDefinition,
} from '../../../core/types/config-governance.types';
import { formatConfigJsonPreview } from '../../../core/utils/config-governance';
import { ConfigDefinitions } from '../../../core/services/config/config-definitions';
import { ConfigChangeSetDraftActions } from './config-change-set-draft.actions';
import { ConfigChangeSetListDetailState } from './config-change-set-list-detail.state';
import { ConfigChangeSetWorkflowActions } from './config-change-set-workflow.actions';
import { ConfigEffectiveValuesState } from './config-effective-values.state';
import { ConfigValueEntryDraftState } from './config-value-entry-draft.state';

@Injectable()
export class ConfigChangeSetsPageFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly configDefinitions = inject(ConfigDefinitions);
  private readonly draft = inject(ConfigChangeSetDraftActions);
  private readonly effectiveValues = inject(ConfigEffectiveValuesState);
  private readonly entryDraft = inject(ConfigValueEntryDraftState);
  private readonly listDetail = inject(ConfigChangeSetListDetailState);
  private readonly workflow = inject(ConfigChangeSetWorkflowActions);

  readonly filterForm = this.listDetail.filterForm;
  readonly draftForm = this.draft.form;
  readonly entryForm = this.entryDraft.form;
  readonly cancelForm = this.workflow.cancelForm;
  readonly changeSets = this.listDetail.changeSets;
  readonly entries = this.listDetail.entries;
  readonly definitions = signal<ConfigDefinition[]>([]);
  readonly isLoading = this.listDetail.isLoading;
  readonly isDetailLoading = this.listDetail.isDetailLoading;
  readonly isSavingDraft = this.draft.isSaving;
  readonly isSavingEntry = this.entryDraft.isSaving;
  readonly isRunningWorkflow = this.workflow.isRunning;
  readonly error = this.listDetail.error;
  readonly detailError = this.listDetail.detailError;
  readonly editorError = computed(
    () =>
      this.draft.error() ?? this.entryDraft.error() ?? this.effectiveValues.error(),
  );
  readonly workflowError = this.workflow.error;
  readonly filteredChangeSets = this.listDetail.filteredChangeSets;
  readonly selectedChangeSet = this.listDetail.selectedChangeSet;
  readonly definitionById = computed(
    () =>
      new Map(this.definitions().map((definition) => [definition.id, definition])),
  );
  readonly canEditSelectedChangeSet = computed(
    () => this.selectedChangeSet()?.status === ConfigChangeStatusKey.Draft,
  );
  readonly canMarkSelectedChangeSetReady = computed(
    () =>
      this.selectedChangeSet()?.status === ConfigChangeStatusKey.Draft &&
      this.entries().length > 0,
  );
  readonly canApplySelectedChangeSet = computed(
    () => this.selectedChangeSet()?.status === ConfigChangeStatusKey.Ready,
  );
  readonly canCancelSelectedChangeSet = computed(() => {
    const status = this.selectedChangeSet()?.status;

    return (
      status === ConfigChangeStatusKey.Draft ||
      status === ConfigChangeStatusKey.Ready
    );
  });
  readonly statusOptions = this.listDetail.statusOptions;
  readonly visibilityOptions = this.listDetail.visibilityOptions;
  readonly draftVisibilityOptions = this.draft.visibilityOptions;
  readonly canSubmitConfigValueEntry = this.entryDraft.canSubmitEntry;
  readonly valueTargetMessage = this.entryDraft.valueTargetMessage;
  readonly definitionOptions = this.entryDraft.definitionOptions;
  readonly selectedEntryDefinition = this.entryDraft.selectedDefinition;
  readonly selectedEntryDefinitionExplainability =
    this.entryDraft.selectedDefinitionExplainability;
  readonly selectedEffectiveValue = this.entryDraft.selectedEffectiveValue;
  readonly selectedServerContext = this.entryDraft.selectedServerContext;
  readonly entryDefinitionScopeLabel = computed(() => {
    const managedEntityKey = this.entryManagedEntityKey();

    return managedEntityKey
      ? `Draft editor definitions filtered by managed entity: ${managedEntityKey}.`
      : null;
  });

  loadData(): void {
    this.loadDefinitions();
    this.listDetail.loadChangeSets();
  }

  selectChangeSet(changeSet: ConfigChangeSet): void {
    this.listDetail.selectChangeSet(changeSet);
  }

  isSelected(changeSet: ConfigChangeSet): boolean {
    return this.listDetail.isSelected(changeSet);
  }

  createDraftChangeSet(): void {
    this.draft.create((changeSet) =>
      this.listDetail.loadChangeSets(changeSet.id),
    );
  }

  addConfigValueEntry(): void {
    this.entryDraft.addEntry(
      this.selectedChangeSet(),
      this.canEditSelectedChangeSet(),
      (entries) => this.listDetail.entries.set(entries),
    );
  }

  markSelectedChangeSetReady(): void {
    const changeSet = this.selectedChangeSet();

    if (changeSet) {
      this.workflow.markReady(changeSet, (updatedChangeSet) =>
        this.listDetail.loadChangeSets(updatedChangeSet.id),
      );
    }
  }

  applySelectedChangeSet(): void {
    const changeSet = this.selectedChangeSet();

    if (changeSet) {
      this.workflow.apply(changeSet, (updatedChangeSet) => {
        this.effectiveValues.refresh();
        this.listDetail.loadChangeSets(updatedChangeSet.id);
      });
    }
  }

  cancelSelectedChangeSet(): void {
    const changeSet = this.selectedChangeSet();

    if (changeSet) {
      this.workflow.cancel(changeSet, (updatedChangeSet) =>
        this.listDetail.loadChangeSets(updatedChangeSet.id),
      );
    }
  }

  definitionLabel(entry: ConfigChangeEntry): string {
    const definitionId = entry.configDefinitionId;

    if (!definitionId) {
      return '-';
    }

    const definition = this.definitionById().get(definitionId);
    return definition ? `${definition.key} (${definition.label})` : definitionId;
  }

  jsonPreview(
    value: ConfigChangeEntry['oldValue'] | ConfigChangeEntry['metadata'],
  ): string {
    return formatConfigJsonPreview(value);
  }

  private loadDefinitions(): void {
    this.configDefinitions.getDefinitions().subscribe({
      next: (definitions) => {
        const entryDefinitions = this.filterEntryDefinitions(definitions);

        this.definitions.set(definitions);
        this.effectiveValues.setDefinitions(definitions);
        this.entryDraft.setDefinitions(entryDefinitions, this.entryManagedEntityKey());
      },
      error: (error: unknown) =>
        this.error.set(
          error instanceof Error
            ? error.message
            : 'Failed to load config definitions.',
        ),
    });
  }

  private entryManagedEntityKey(): string | null {
    return this.route.snapshot.queryParamMap.get('managedEntityKey');
  }

  private filterEntryDefinitions(
    definitions: readonly ConfigDefinition[],
  ): ConfigDefinition[] {
    const managedEntityKey = this.entryManagedEntityKey();

    return managedEntityKey
      ? definitions.filter(
          (definition) => definition.managedEntityKey === managedEntityKey,
        )
      : [...definitions];
  }
}
