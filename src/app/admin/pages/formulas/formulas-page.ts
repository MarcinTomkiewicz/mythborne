import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize, forkJoin, map, switchMap } from 'rxjs';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { FormulaService } from '../../../core/services/formula/formula';
import { FormulaEntityLabels } from '../../../core/services/formula/formula-entity-labels';
import { ProgressionExplainabilityMetadata } from '../../../core/services/progression/progression-explainability-metadata';
import { FORMULAS_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';
import {
  EMPTY_FORMULA_ADMIN_DATA,
  EntityFormulaInspectionRow,
  FormulaEntityReference,
  FormulaScopeInspectionRow,
  FormulaTargetAssignmentRow,
} from '../../../core/types/formula-admin-view.types';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  toEntityFormulaInspectionRow,
  toFormulaTargetAssignmentRow,
} from '../../../core/utils/formula-assignment-view';
import { FormulaAssignmentViewer } from '../../components/formulas/formula-assignment-viewer';
import { FormulaImpactCalculator } from '../../components/formulas/formula-impact-calculator';
import {
  missingProgressionFormulaTargetKeys,
  progressionFormulaRows,
  ProgressionFormulaExplainability,
} from './progression-formula-explainability';
import {
  ProgressionFormulaExplainabilitySection,
} from './progression-formula-explainability-section';

@Component({
  selector: 'app-formulas-page',
  standalone: true,
  imports: [
    LoadingOverlay,
    AdminTagLinks,
    FormulaAssignmentViewer,
    FormulaImpactCalculator,
    ProgressionFormulaExplainabilitySection,
  ],
  templateUrl: './formulas-page.html',
})
export class FormulasPage implements OnInit {
  private readonly formulaService = inject(FormulaService);
  private readonly formulaEntityLabels = inject(FormulaEntityLabels);
  private readonly progressionMetadata = inject(ProgressionExplainabilityMetadata);

  readonly links = FORMULAS_PAGE_LINKS;
  readonly data = signal(EMPTY_FORMULA_ADMIN_DATA);
  readonly entityReferences = signal(new Map<string, FormulaEntityReference>());
  readonly progressionMetadataEntries = signal<UiMetadataEntryReadModel[]>([]);
  readonly progressionExplainability = new ProgressionFormulaExplainability(
    () => this.progressionMetadataEntries(),
  );
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly formulaById = computed(
    () => new Map(this.data().formulas.map((formula) => [formula.id, formula])),
  );
  readonly targetById = computed(
    () => new Map(this.data().targets.map((target) => [target.id, target])),
  );
  readonly assignmentByTargetId = computed(
    () =>
      new Map(
        this.data().assignments.map((assignment) => [
          assignment.targetId,
          assignment,
        ]),
      ),
  );
  readonly entityReferenceByKey = computed(() => this.entityReferences());
  readonly targetRows = computed<FormulaTargetAssignmentRow[]>(() =>
    this.data().targets.map((target) => {
      const assignment = this.assignmentByTargetId().get(target.id) ?? null;
      const formula = assignment
        ? this.formulaById().get(assignment.formulaId) ?? null
        : null;
      return toFormulaTargetAssignmentRow(target, assignment, formula);
    }),
  );
  readonly progressionFormulaRows = computed<FormulaTargetAssignmentRow[]>(() =>
    progressionFormulaRows(this.targetRows()),
  );
  readonly missingProgressionFormulaTargetKeys = computed<string[]>(() =>
    missingProgressionFormulaTargetKeys(this.targetRows()),
  );
  readonly progressionExplainabilityRows = computed(() =>
    this.progressionExplainability.explanationRows(),
  );
  readonly progressionMetadataGaps = computed(() =>
    this.progressionExplainability.missingGaps(),
  );
  readonly entityAssignmentRows = computed<EntityFormulaInspectionRow[]>(() =>
    this.data().entityAssignments.map((assignment) => {
      const target = this.targetById().get(assignment.targetId) ?? null;
      const localFormula = this.formulaById().get(assignment.formulaId) ?? null;
      const globalAssignment =
        this.assignmentByTargetId().get(assignment.targetId) ?? null;
      const globalFormula = globalAssignment
        ? this.formulaById().get(globalAssignment.formulaId) ?? null
        : null;
      const entityReference =
        this.entityReferenceByKey().get(
          this.formulaEntityLabels.referenceKey(
            assignment.entityKind,
            assignment.entityId,
          ),
        ) ?? null;

      return toEntityFormulaInspectionRow({
        assignment,
        target,
        localFormula,
        globalAssignment,
        globalFormula,
        entityReference,
      });
    }),
  );
  readonly scopes = computed(() =>
    Array.from(
      new Set([
        ...this.data().targets.map((target) => target.scopeKey),
        ...this.data().formulas.map((formula) => formula.scopeKey),
        ...this.data().blocks.map((block) => block.scopeKey),
      ]),
    ).sort((left, right) => left.localeCompare(right)),
  );
  readonly formulasByScope = computed(() =>
    this.groupByScope(this.data().formulas),
  );
  readonly blocksByScope = computed(() => this.groupByScope(this.data().blocks));
  readonly scopeRows = computed<FormulaScopeInspectionRow[]>(() =>
    this.scopes().map((scopeKey) => ({
      scopeKey,
      formulas: this.formulasByScope().get(scopeKey) ?? [],
      blocks: this.blocksByScope().get(scopeKey) ?? [],
    })),
  );

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.formulaService
      .getAdminData()
      .pipe(
        switchMap((data) =>
          forkJoin({
            entityReferences:
              this.formulaEntityLabels.getEntityLabels(data.entityAssignments),
            progressionMetadata: this.progressionMetadata.getEntries(),
          }).pipe(map((loaded) => ({ data, ...loaded }))),
        ),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: ({ data, entityReferences, progressionMetadata }) => {
          this.data.set(data);
          this.entityReferences.set(entityReferences);
          this.progressionMetadataEntries.set(progressionMetadata);
        },
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load formula governance data.',
          ),
      });
  }

  private groupByScope<T extends { scopeKey: string }>(
    entries: readonly T[],
  ): Map<string, T[]> {
    return entries.reduce((acc, entry) => {
      acc.set(entry.scopeKey, [...(acc.get(entry.scopeKey) ?? []), entry]);
      return acc;
    }, new Map<string, T[]>());
  }
}
