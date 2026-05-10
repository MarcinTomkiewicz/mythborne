import { Component, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { generatedItemExplanationRows } from './luck-lab-explanation-rows';
import { LuckLabExplanationList } from './luck-lab-explanation-list';
import { LuckLabGeneratedItemSectionState } from './luck-lab-generated-item-section.state';

@Component({
  selector: 'app-luck-lab-generated-item-section',
  standalone: true,
  imports: [MessageModule, LuckLabExplanationList],
  providers: [LuckLabGeneratedItemSectionState],
  templateUrl: './luck-lab-generated-item-section.html',
})
export class LuckLabGeneratedItemSection {
  readonly section = inject(LuckLabGeneratedItemSectionState);
  private readonly lab = inject(LuckLabState);

  explanationRows() {
    const preview = this.section.preview();

    return generatedItemExplanationRows({
      explanation: preview?.explanation ?? null,
      domainRows: this.lab.result().explanationRows,
      bucketMetadata: preview
        ? `Bucket ${preview.bucketProfileName} (${preview.bucketProfileKey})`
        : null,
    });
  }
}
