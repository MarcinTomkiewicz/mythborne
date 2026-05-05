import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { EstateVicinityPageState } from './estate-vicinity-page.state';
import { VicinityRelocationRunner } from './vicinity-relocation-runner';

@Component({
  selector: 'app-estate-vicinity-page',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    LoadingOverlay,
    RouterLink,
  ],
  providers: [EstateVicinityPageState, VicinityRelocationRunner],
  templateUrl: './estate-vicinity-page.html',
})
export class EstateVicinityPage implements OnInit {
  readonly page = inject(EstateVicinityPageState);

  ngOnInit(): void {
    this.page.loadData();
  }
}
