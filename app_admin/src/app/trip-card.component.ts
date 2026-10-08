import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from './trip.model';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="card trip-card">
      <img class="card-img-top trip-image" [src]="imageUrl" [alt]="trip.name" (error)="useFallback($event)">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div><span class="eyebrow">{{ trip.code }}</span><h2 class="h5 mt-1 mb-1">{{ trip.name }}</h2></div>
          <span class="badge text-bg-info">{{ trip.length }}</span>
        </div>
        <p class="text-secondary small mt-3 mb-2">{{ trip.resort }}</p>
        <p class="card-text flex-grow-1">{{ trip.description }}</p>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <strong class="text-primary">\${{ trip.perPerson }} <span class="small text-secondary fw-normal">per person</span></strong>
          <span class="small text-secondary">Starts {{ trip.start | date:'mediumDate' }}</span>
        </div>
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-outline-primary btn-sm" type="button" (click)="edit.emit(trip)">Edit</button>
          <button class="btn btn-outline-danger btn-sm" type="button" (click)="remove.emit(trip)">Delete</button>
        </div>
      </div>
    </article>
  `
})
export class TripCardComponent {
  @Input({ required: true }) trip!: Trip;
  @Output() edit = new EventEmitter<Trip>();
  @Output() remove = new EventEmitter<Trip>();

  get imageUrl(): string {
    return this.trip.image.startsWith('http') ? this.trip.image : `/images/${this.trip.image}`;
  }

  useFallback(event: Event): void {
    (event.target as HTMLImageElement).src = '/images/reef1.jpg';
  }
}
