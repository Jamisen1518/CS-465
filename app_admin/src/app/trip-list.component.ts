import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Trip } from './trip.model';
import { TripService } from './trip.service';
import { TripCardComponent } from './trip-card.component';

type EditorMode = 'add' | 'edit';

const blankTrip = (): Trip => ({
  code: '', name: '', length: '', start: '', resort: '', perPerson: '', image: 'reef1.jpg',
  description: '', description2: ''
});

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TripCardComponent],
  template: `
    <div class="admin-shell">
      <header class="hero py-4 py-lg-5">
        <div class="container d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div><div class="brand-mark small">TRAVLR GETAWAYS</div><h1 class="display-6 fw-bold mt-2 mb-1">Trip Administration</h1><p class="mb-0 text-white-50">Manage the travel packages shown to guests.</p></div>
          <button class="btn btn-light btn-lg" type="button" (click)="startAdd()">＋ Add trip</button>
        </div>
      </header>
      <main class="container py-4 py-lg-5">
        <div *ngIf="notice" class="alert alert-success" role="status">{{ notice }}</div>
        <div *ngIf="error" class="alert alert-danger" role="alert">{{ error }}</div>

        <section *ngIf="editorOpen" class="card form-panel mb-5" aria-labelledby="editor-title">
          <div class="card-body p-4 p-lg-5">
            <div class="d-flex justify-content-between align-items-start mb-4">
              <div><div class="eyebrow">{{ mode === 'add' ? 'New package' : 'Edit package' }}</div><h2 id="editor-title" class="h3 mt-1">{{ mode === 'add' ? 'Add a trip' : 'Edit trip details' }}</h2></div>
              <button class="btn-close" type="button" aria-label="Close form" (click)="cancelEdit()"></button>
            </div>
            <form #tripForm="ngForm" (ngSubmit)="saveTrip(tripForm)" novalidate>
              <div class="row g-3">
                <div class="col-md-4"><label class="form-label" for="code">Trip code</label><input id="code" class="form-control" name="code" [(ngModel)]="draft.code" required minlength="2" maxlength="32" pattern="[A-Za-z0-9_-]+" [readonly]="mode === 'edit'"></div>
                <div class="col-md-8"><label class="form-label" for="name">Trip name</label><input id="name" class="form-control" name="name" [(ngModel)]="draft.name" required></div>
                <div class="col-md-4"><label class="form-label" for="length">Length</label><input id="length" class="form-control" name="length" [(ngModel)]="draft.length" placeholder="4 nights / 5 days" required></div>
                <div class="col-md-4"><label class="form-label" for="start">Start date</label><input id="start" class="form-control" type="date" name="start" [(ngModel)]="draft.start" required></div>
                <div class="col-md-4"><label class="form-label" for="perPerson">Price per person</label><input id="perPerson" class="form-control" name="perPerson" [(ngModel)]="draft.perPerson" required></div>
                <div class="col-md-6"><label class="form-label" for="resort">Resort and rating</label><input id="resort" class="form-control" name="resort" [(ngModel)]="draft.resort" required></div>
                <div class="col-md-6"><label class="form-label" for="image">Image filename</label><input id="image" class="form-control" name="image" [(ngModel)]="draft.image" required></div>
                <div class="col-12"><label class="form-label" for="description">Description</label><textarea id="description" class="form-control" name="description" rows="3" [(ngModel)]="draft.description" required></textarea></div>
                <div class="col-12"><label class="form-label" for="description2">Additional description</label><textarea id="description2" class="form-control" name="description2" rows="2" [(ngModel)]="draft.description2"></textarea></div>
              </div>
              <div class="d-flex gap-2 mt-4">
                <button class="btn btn-primary px-4" type="submit" [disabled]="saving || tripForm.invalid">{{ saving ? 'Saving…' : (mode === 'add' ? 'Add trip' : 'Save changes') }}</button>
                <button class="btn btn-outline-secondary" type="button" (click)="cancelEdit()">Cancel</button>
              </div>
            </form>
          </div>
        </section>

        <div class="d-flex flex-wrap justify-content-between align-items-end mb-3 gap-2">
          <div><div class="eyebrow">Current packages</div><h2 class="h3 mb-0">Trip cards <span class="badge rounded-pill text-bg-secondary">{{ trips.length }}</span></h2></div>
          <button class="btn btn-outline-primary" type="button" (click)="loadTrips()" [disabled]="loading">{{ loading ? 'Loading…' : 'Refresh list' }}</button>
        </div>
        <div *ngIf="loading && trips.length === 0" class="text-secondary py-5 text-center">Loading trips from the database…</div>
        <div *ngIf="!loading && trips.length === 0" class="alert alert-info">No trips are available. Add the first package above.</div>
        <div class="row g-4">
          <div class="col-md-6 col-xl-4" *ngFor="let trip of trips; trackBy: trackTrip">
            <app-trip-card [trip]="trip" (edit)="startEdit($event)" (remove)="deleteTrip($event)"></app-trip-card>
          </div>
        </div>
      </main>
    </div>
  `
})
export class TripListComponent implements OnInit {
  private readonly tripService = inject(TripService);
  trips: Trip[] = [];
  draft = blankTrip();
  mode: EditorMode = 'add';
  editorOpen = false;
  loading = false;
  saving = false;
  error = '';
  notice = '';

  ngOnInit(): void { this.loadTrips(); }

  loadTrips(): void {
    this.loading = true;
    this.error = '';
    this.tripService.getTrips().subscribe({
      next: trips => { this.trips = trips; this.loading = false; },
      error: () => { this.error = 'Could not load trips. Check that the Express API and MongoDB are running.'; this.loading = false; }
    });
  }

  startAdd(): void {
    this.clearMessages(); this.mode = 'add'; this.draft = blankTrip(); this.editorOpen = true;
  }

  startEdit(trip: Trip): void {
    this.clearMessages(); this.mode = 'edit';
    this.draft = { ...trip, start: trip.start.slice(0, 10) };
    this.editorOpen = true;
  }

  saveTrip(form: NgForm): void {
    if (form.invalid || this.saving) return;
    this.saving = true; this.clearMessages();
    const payload: Trip = { ...this.draft, start: new Date(`${this.draft.start}T08:00:00Z`).toISOString() };
    const request = this.mode === 'add'
      ? this.tripService.addTrip(payload)
      : this.tripService.updateTrip(this.draft.code, payload);
    request.subscribe({
      next: trip => {
        this.notice = this.mode === 'add' ? `${trip.name} was added.` : `${trip.name} was updated.`;
        this.editorOpen = false; this.saving = false; this.loadTrips();
      },
      error: response => {
        this.error = response.error?.message || 'The trip could not be saved.';
        this.saving = false;
      }
    });
  }

  deleteTrip(trip: Trip): void {
    if (!window.confirm(`Delete ${trip.name}?`)) return;
    this.clearMessages();
    this.tripService.deleteTrip(trip.code).subscribe({
      next: () => { this.notice = `${trip.name} was deleted.`; this.loadTrips(); },
      error: response => { this.error = response.error?.message || 'The trip could not be deleted.'; }
    });
  }

  cancelEdit(): void { this.editorOpen = false; }
  trackTrip(_index: number, trip: Trip): string { return trip.code; }
  private clearMessages(): void { this.error = ''; this.notice = ''; }
}
