import { computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs';
import {
  EntityEditorState,
  EntityEditorStateConfig,
} from '../types/entity-editor-state.types';

export function createEntityEditorState<T, TForm extends FormGroup>(
  config: EntityEditorStateConfig<T, TForm>
): EntityEditorState<T, TForm> {
  const items = signal<T[]>([]);
  const draft = toSignal(
    config.editorForm.valueChanges.pipe(
      startWith(config.editorForm.getRawValue()),
      map(() => config.toDraft(config.editorForm))
    ),
    { initialValue: config.toDraft(config.editorForm) }
  );
  const id = computed(() => config.idOf(draft()));
  const patchDraft = (draft: T) => config.patch(config.editorForm, draft);
  const select = (draft: T) => {
    config.selectorForm.controls.selectedId.setValue(config.idOf(draft) ?? '', {
      emitEvent: false,
    });
    patchDraft(draft);
  };

  config.selectorForm.controls.selectedId.valueChanges
    .pipe(takeUntilDestroyed(config.destroyRef))
    .subscribe((id) => {
      patchDraft(items().find((item) => config.idOf(item) === id) ?? config.createDraft());
    });

  return {
    items,
    selectorForm: config.selectorForm,
    editorForm: config.editorForm,
    setItems: (nextItems, preferredKey) => {
      items.set(nextItems);
      select(
        nextItems.find((item) => config.keyOf(item) === preferredKey) ??
          nextItems[0] ??
          config.createDraft()
      );
    },
    new: () => select(config.createDraft()),
    draft,
    id,
  };
}
