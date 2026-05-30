import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalToast } from './layout/components/global-toast/global-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalToast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Mythsworn';
}
