import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TripListComponent } from './trip-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, TripListComponent],
  template: `
    @if (loggedIn) {
      <button (click)="logout()">Log out</button>
      <app-trip-list></app-trip-list>
    } @else {
      <h2>Admin Login</h2>
      <form (ngSubmit)="login()">
        <label>Email</label>
        <input type="email" name="email" [(ngModel)]="email" required>

        <label>Password</label>
        <input type="password" name="password" [(ngModel)]="password" required>

        <button type="submit">Log in</button>
        <p>{{ message }}</p>
      </form>
    }
  `
})
export class AppComponent {
  private http = inject(HttpClient);
  email = '';
  password = '';
  loggedIn = !!localStorage.getItem('travlr-token');
  message = '';

  login() {
    this.http.post<{ token: string }>('/api/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('travlr-token', response.token);
        this.loggedIn = true;
      },
      error: () => this.message = 'Login failed. Check your email and password.'
    });
  }

  logout() {
    localStorage.removeItem('travlr-token');
    this.loggedIn = false;
  }
}