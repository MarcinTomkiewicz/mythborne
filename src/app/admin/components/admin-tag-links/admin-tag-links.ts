import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminTagLink } from '../../../core/types/admin-ui.types';

@Component({
  selector: 'app-admin-tag-links',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-tag-links.html',
})
export class AdminTagLinks {
  readonly links = input.required<readonly AdminTagLink[]>();
}
