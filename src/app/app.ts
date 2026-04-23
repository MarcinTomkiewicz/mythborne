import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { GameSidebar } from './layout/components/game-sidebar/game-sidebar';
import { GameTopbar } from './layout/components/game-topbar/game-topbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameSidebar, GameTopbar, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'mythos-hunter-2-0';
}
