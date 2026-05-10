import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { LuckLabGeneratedItemSectionState } from './luck-lab-generated-item-section.state';

@Component({
  selector: 'app-luck-lab-generated-item-section',
  standalone: true,
  imports: [MessageModule],
  providers: [LuckLabGeneratedItemSectionState],
  templateUrl: './luck-lab-generated-item-section.html',
})
export class LuckLabGeneratedItemSection {
  readonly section = inject(LuckLabGeneratedItemSectionState);
}
