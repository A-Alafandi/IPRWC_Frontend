import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastContainerComponent,
  ],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <app-header></app-header>

      <main class="flex-grow-1">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>
    </div>

    <app-toast-container></app-toast-container>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'IPWRWC_eCommerce';
}
