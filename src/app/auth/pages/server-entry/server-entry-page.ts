import { Component, OnInit, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { StartFlowEntryState } from '../../../core/services/start-flow/start-flow-entry.state';
import { SessionLogoutButton } from '../../../shared/session-logout-button/session-logout-button';

@Component({
  selector: 'app-server-entry-page',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule, RouterLink, SelectModule, SessionLogoutButton],
  providers: [StartFlowEntryState],
  templateUrl: './server-entry-page.html',
})
export class ServerEntryPage implements OnInit {
  readonly state = inject(StartFlowEntryState);
  readonly selectedSandboxHeroControl = new FormControl<string | null>(null);

  private readonly selectedHeroSync = effect(() => {
    const selectedHeroId =
      this.state.activeHeroOption()?.heroId ??
      this.state.selectedDefaultHeroOption()?.heroId ??
      null;

    if (this.selectedSandboxHeroControl.value !== selectedHeroId) {
      this.selectedSandboxHeroControl.setValue(selectedHeroId, { emitEvent: false });
    }
  });

  ngOnInit(): void {
    this.state.load();
  }

  switchSelectedSandboxHero(): void {
    const heroId = this.selectedSandboxHeroControl.value;

    if (!heroId) {
      return;
    }

    this.state.selectHero(heroId);
  }
}
