import {
  FormControl,
  FormRecord,
} from '@angular/forms';
import { PlayerArmoryStorageSlotReadModel } from '../../domain/item/player-armory-page-context.model';
import { armoryShelfControlName } from './armory-inventory-shelf-rows';

export function syncArmoryShelfNameForms(
  form: FormRecord<FormControl<string>>,
  shelves: readonly PlayerArmoryStorageSlotReadModel[],
): void {
  const editableShelves = shelves.filter((shelf) =>
    shelf.isPersisted && !shelf.isUnsortedDropArea,
  );
  const controlNames = new Set(
    editableShelves.map((shelf) => armoryShelfControlName(shelf.position)),
  );

  for (const shelf of editableShelves) {
    ensureArmoryShelfNameControl(form, shelf);
  }

  for (const controlName of Object.keys(form.controls)) {
    if (!controlNames.has(controlName)) {
      form.removeControl(controlName, { emitEvent: false });
    }
  }
}

function ensureArmoryShelfNameControl(
  form: FormRecord<FormControl<string>>,
  shelf: PlayerArmoryStorageSlotReadModel,
): void {
  const controlName = armoryShelfControlName(shelf.position);
  const currentControl = form.controls[controlName];

  if (currentControl) {
    if (!currentControl.dirty && currentControl.value !== shelf.displayName) {
      currentControl.setValue(shelf.displayName, { emitEvent: false });
    }
    return;
  }

  form.addControl(
    controlName,
    new FormControl<string>(shelf.displayName, { nonNullable: true }),
    { emitEvent: false },
  );
}
