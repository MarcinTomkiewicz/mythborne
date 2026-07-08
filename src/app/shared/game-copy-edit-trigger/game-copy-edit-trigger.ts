import { Component, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { GameCopyEditAdmin } from '../../core/services/game-copy-edit/game-copy-edit-admin';
import { GameCopyRegistryKind } from '../../core/types/game-copy-registry.types';
import { GameCopyEditState } from '../game-copy-edit/game-copy-edit.state';

@Component({
  selector: 'app-game-copy-edit-trigger',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  templateUrl: './game-copy-edit-trigger.html',
  host: { class: 'd-contents' },
})
export class GameCopyEditTrigger {
  private readonly admin = inject(GameCopyEditAdmin);

  readonly state = inject(GameCopyEditState);
  readonly gameCopyKind = input.required<GameCopyRegistryKind>();
  readonly copyPath = input.required<string>();
  readonly locale = input.required<string>();
  readonly canManage = this.admin.canManage;

  open(): void {
    this.state.open({
      gameCopyKind: this.gameCopyKind(),
      copyPath: this.copyPath(),
      locale: this.locale(),
    });
  }
}
