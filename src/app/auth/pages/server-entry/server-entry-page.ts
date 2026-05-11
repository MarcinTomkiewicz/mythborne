import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { StartFlowEntryState } from '../../../core/services/start-flow/start-flow-entry.state';

@Component({
  selector: 'app-server-entry-page',
  standalone: true,
  imports: [ButtonModule, RouterLink],
  providers: [StartFlowEntryState],
  templateUrl: './server-entry-page.html',
})
export class ServerEntryPage implements OnInit {
  readonly state = inject(StartFlowEntryState);

  ngOnInit(): void {
    this.state.load();
  }
}
