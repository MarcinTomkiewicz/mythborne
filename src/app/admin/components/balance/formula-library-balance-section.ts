import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';
import {
  createFormulaEditorMetaFields,
  createFormulaSelectorFields,
  FORMULA_DESCRIPTION_FIELD,
  FORMULA_EXPRESSION_FIELD,
} from '../../../core/config/forms/balance-form.config';
import { FormulaActionGroup, FormulaActionViewItem } from './formula-action-group';
import { FormulaExpressionPreview } from './formula-expression-preview';
import {
  FormulaBlock,
  FormulaTemplateGuide,
} from '../../../core/domain/formula/formula.model';
import {
  formulaBlockTooltip,
  formulaFunctionGuide,
  formulaFunctionGuideByKey,
  formulaFunctionGuideTooltip,
  formulaTemplateTooltip,
  humanizeFormulaScope,
  resolveFormulaTemplateExpression,
} from './formula-library-helpers';

interface FormulaActionSection {
  key: string;
  title: string;
  action: 'block' | 'variable' | 'function' | 'template';
  appearance: 'tag' | 'card';
  tone?: 'muted' | 'warn';
  items: readonly FormulaActionViewItem[];
}

@Component({
  selector: 'app-formula-library-balance-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    FormFields,
    FormulaActionGroup,
    FormulaExpressionPreview,
  ],
  templateUrl: './formula-library-balance-section.html',
  host: { class: 'd-block w-100' },
})
export class FormulaLibraryBalanceSection {
  readonly page = inject(ItemGenerationBalancePageFacade);
  readonly selectorFields = computed(() =>
    createFormulaSelectorFields(
      this.page.formulas.data(),
      (scope) => humanizeFormulaScope(scope)
    )
  );
  readonly editorMetaFields = computed(() =>
    createFormulaEditorMetaFields(
      this.page.formulas.availableScopes(),
      (scope) => humanizeFormulaScope(scope)
    )
  );
  readonly descriptionFields = [FORMULA_DESCRIPTION_FIELD] as const;
  readonly expressionField = FORMULA_EXPRESSION_FIELD;
  readonly operatorLiteralSections = computed(() =>
    [
      this.createBlockSection('operators', 'Operators'),
      this.createBlockSection('literals', 'Literals'),
    ].filter((section): section is FormulaActionSection => section !== null)
  );
  readonly helperSections = computed(() =>
    [
      this.createVariableSection(),
      this.createTesterVariableSection(),
      this.createFunctionSection(),
      this.createTemplateSection(),
    ].filter((section): section is FormulaActionSection => section !== null)
  );

  handleBlockAction(action: FormulaActionViewItem) {
    const block = this.findBlock(action.id);
    block && this.appendBlockTemplate(block);
  }

  handleVariableAction(action: FormulaActionViewItem) {
    this.appendBlock(action.id);
  }

  handleTemplateAction(action: FormulaActionViewItem) {
    const template = this.findTemplate(action.id);
    template && this.applyTemplate(template);
  }

  handleFunctionAction(action: FormulaActionViewItem) {
    const guide = formulaFunctionGuideByKey(this.page.formulas.functionGuides(), action.id);
    guide && this.appendBlock(guide.insertTemplate);
  }

  handleSectionAction(sectionKey: string, action: FormulaActionViewItem) {
    switch (sectionKey) {
      case 'variables':
      case 'tester-variables':
        this.handleVariableAction(action);
        return;
      case 'functions':
        this.handleFunctionAction(action);
        return;
      case 'templates':
        this.handleTemplateAction(action);
        return;
      default:
        this.handleBlockAction(action);
    }
  }

  private createBlockSection(category: string, title: string): FormulaActionSection | null {
    const items = this.blocksFor(category).map((block) => {
      const guide = formulaFunctionGuide(this.page.formulas.functionGuides(), block);

      return {
      id: block.id,
      label: block.label,
      tooltip: category === 'functions'
        ? formulaBlockTooltip({ block, guide })
        : block.helperText ?? '',
      secondaryLabel:
        category === 'functions'
          ? guide?.friendlySyntax ?? block.token
          : undefined,
      };
    });

    if (items.length === 0) {
      return null;
    }

    return {
      key: category,
      title,
      action: 'block',
      appearance: category === 'functions' ? 'card' : 'tag',
      tone: 'muted',
      items,
    };
  }

  private createVariableSection(): FormulaActionSection | null {
    const items = this.page.formulas.scopeVariables().map((variable) => ({
      id: variable.key,
      label: variable.label,
      tooltip: this.page.formulas.variableTooltip(variable.key, variable.helperText),
    }));

    if (items.length === 0) {
      return null;
    }

    return {
      key: 'variables',
      title: 'Scope variables',
      action: 'variable',
      appearance: 'tag',
      tone: 'muted',
      items,
    };
  }

  private createFunctionSection(): FormulaActionSection | null {
    const items = this.page.formulas.functionGuides().map((guide) => ({
      id: guide.key,
      label: guide.label,
      secondaryLabel: guide.friendlySyntax,
      tooltip: formulaFunctionGuideTooltip(guide),
    }));

    if (items.length === 0) {
      return null;
    }

    return {
      key: 'functions',
      title: 'Functions',
      action: 'function',
      appearance: 'card',
      tone: 'muted',
      items,
    };
  }

  private createTesterVariableSection(): FormulaActionSection | null {
    const items = this.page.formulas.previewVariableDefinitions().map((variable) => ({
      id: variable.key,
      label: this.page.formulas.variableDisplayText(variable.key),
      tooltip: this.page.formulas.variableTooltip(
        variable.key,
        `Default test value: ${variable.defaultValue}`
      ),
    }));

    if (items.length === 0) {
      return null;
    }

    return {
      key: 'tester-variables',
      title: 'Tester target variables',
      action: 'variable',
      appearance: 'tag',
      tone: 'muted',
      items,
    };
  }

  private createTemplateSection(): FormulaActionSection | null {
    const items = this.page.formulas.formulaTemplates().map((template) => ({
      id: template.key,
      label: template.label,
      tooltip: formulaTemplateTooltip({
        template,
        variable: this.page.formulas.templateVariable(),
      }),
    }));

    if (items.length === 0) {
      return null;
    }

    return {
      key: 'templates',
      title: 'Templates',
      action: 'template',
      appearance: 'tag',
      tone: 'warn',
      items,
    };
  }

  private findBlock(id: string): FormulaBlock | null {
    return this.page.formulas.blocks().find((block) => block.id === id) ?? null;
  }

  private findTemplate(key: string): FormulaTemplateGuide | null {
    return this.page.formulas.formulaTemplates().find((template) => template.key === key) ?? null;
  }

  private blocksFor(category: string): FormulaBlock[] {
    return this.page.formulas.blocks().filter((block) => block.category === category);
  }

  private appendBlock(token: string) {
    const control = this.page.formulas.editorForm.controls.expression;
    control.setValue(`${control.value ?? ''}${token}`.trim());
  }

  private appendBlockTemplate(block: FormulaBlock) {
    const guide = formulaFunctionGuide(this.page.formulas.functionGuides(), block);
    this.appendBlock(guide?.insertTemplate ?? block.token);
  }

  private applyTemplate(template: FormulaTemplateGuide) {
    this.page.formulas.editorForm.controls.expression.setValue(
      resolveFormulaTemplateExpression(template, this.page.formulas.templateVariable()),
    );
  }
}
