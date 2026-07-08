import { Component, inject, input } from '@angular/core';
import { GameCopyEditAdmin } from '../../core/services/game-copy-edit/game-copy-edit-admin';
import { GameCopyRegistryKind } from '../../core/types/game-copy-registry.types';
import { GameCopyEditTrigger } from '../game-copy-edit-trigger/game-copy-edit-trigger';

@Component({
  selector: 'app-game-copy-editable-text',
  standalone: true,
  imports: [GameCopyEditTrigger],
  templateUrl: './game-copy-editable-text.html',
  host: {
    '[class.d-contents]': '!canManage()',
    '[class.flex-row-start-center]': 'canManage()',
    '[class.gap-xs]': 'canManage()',
  },
})
export class GameCopyEditableText {
  private readonly admin = inject(GameCopyEditAdmin);

  readonly gameCopyKind = input.required<GameCopyRegistryKind>();
  readonly copyPath = input.required<string>();
  readonly locale = input.required<string>();
  readonly canManage = this.admin.canManage;
}
