import { DestroyRef, WritableSignal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

export type EntitySelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export interface EntityEditorStateConfig<T, TForm extends FormGroup> {
  destroyRef: DestroyRef;
  selectorForm: EntitySelectorForm;
  editorForm: TForm;
  createDraft: () => T;
  patch: (form: TForm, draft: T) => void;
  toDraft: (form: TForm) => T;
  idOf: (item: T) => string | null;
  keyOf: (item: T) => string;
}

export interface EntityEditorState<T, TForm extends FormGroup> {
  items: WritableSignal<T[]>;
  selectorForm: EntitySelectorForm;
  editorForm: TForm;
  setItems: (items: T[], preferredKey?: string) => void;
  new: () => void;
  draft: () => T;
  id: () => string | null;
}
