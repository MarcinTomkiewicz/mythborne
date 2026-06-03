import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-global-toast',
  imports: [ToastModule],
  template: `<p-toast key="global" position="top-right" />`,
})
export class GlobalToast {}
