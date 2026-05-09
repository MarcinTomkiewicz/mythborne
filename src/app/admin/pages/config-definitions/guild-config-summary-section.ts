import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { GuildConfigSummary } from '../../../core/domain/guild/guild.model';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { GuildConfigEditorState } from './guild-config-editor.state';

@Component({
  selector: 'app-guild-config-summary-section',
  standalone: true,
  imports: [
    ButtonModule,
    InputNumberModule,
    MessageModule,
    ReactiveFormsModule,
    RouterLink,
    TextareaModule,
    LoadingOverlay,
  ],
  providers: [GuildConfigEditorState],
  host: { class: 'd-block w-100' },
  templateUrl: './guild-config-summary-section.html',
})
export class GuildConfigSummarySection implements OnInit {
  readonly state = inject(GuildConfigEditorState);
  readonly form = this.state.form;
  readonly config = this.state.config;
  readonly error = this.state.error;
  readonly isApplying = this.state.isApplying;
  readonly isLoading = this.state.isLoading;

  ngOnInit(): void {
    this.state.load();
  }

  applyGuildConfigChanges(): void {
    this.state.applyGuildConfigChanges();
  }

  armoryCapacityLabel(config: GuildConfigSummary): string {
    return config.armoryCapacityIsUnlimited || config.armoryCapacity === 0
      ? 'Unlimited'
      : String(config.armoryCapacity);
  }

  memberLimitFormulaLabel(config: GuildConfigSummary): string {
    return `${config.memberBaseLimit} + leader level x ${config.memberLimitPerLeaderLevel}`;
  }

  durationLabel(minutes: number): string {
    return `${minutes} minutes`;
  }

  governanceQueryParams(): Record<string, string> {
    return { managedEntityKey: 'guild' };
  }
}
