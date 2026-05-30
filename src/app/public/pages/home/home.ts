import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-public-home-page',
  imports: [ButtonModule, RouterLink],
  templateUrl: './home.html',
})
export class PublicHomePage {}
