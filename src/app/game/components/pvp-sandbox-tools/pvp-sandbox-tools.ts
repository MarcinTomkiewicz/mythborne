import { Component, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ActivePvpActionOffer } from '../../../core/domain/pvp/pvp.model';
import { PvpSandboxToolState } from '../../features/pvp/state/pvp-sandbox-tool.state';
import { SandboxTestToolsStrip } from '../sandbox-test-tools-strip/sandbox-test-tools-strip';

@Component({
  selector: 'app-pvp-sandbox-tools',
  standalone: true,
  imports: [ButtonModule, SandboxTestToolsStrip],
  templateUrl: './pvp-sandbox-tools.html',
  host: { class: 'd-block w-100' },
})
export class PvpSandboxTools {
  readonly offer = input<ActivePvpActionOffer | null>(null);
  readonly refreshActiveOffer = output<void>();
  readonly refreshAttackCounters = output<void>();
  readonly sandbox = inject(PvpSandboxToolState);

  skipAttackTravel(): void {
    this.sandbox.skipSandboxAttackTravel(
      this.offer(),
      () => this.refreshActiveOffer.emit(),
    );
  }

  addAttacks(): void {
    this.sandbox.addSandboxAttacks(() => {
      this.refreshAttackCounters.emit();
      this.refreshActiveOffer.emit();
    });
  }
}
