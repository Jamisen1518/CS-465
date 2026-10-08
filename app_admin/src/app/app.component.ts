import { Component } from '@angular/core';
import { TripListComponent } from './trip-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TripListComponent],
  template: '<app-trip-list></app-trip-list>'
})
export class AppComponent {}
