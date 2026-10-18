import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { of } from 'rxjs';
import { TripListComponent } from './trip-list.component';
import { Trip } from './trip.model';
import { TripService } from './trip.service';

describe('TripListComponent', () => {
  let fixture: ComponentFixture<TripListComponent>;
  let component: TripListComponent;
  let service: jasmine.SpyObj<TripService>;

  const trip: Trip = {
    code: 'TEST101', name: 'Test Reef', length: '3 nights / 4 days',
    start: '2026-11-15T08:00:00Z', resort: 'Blue Cove, 4 stars',
    perPerson: '899.00', image: 'reef1.jpg', description: 'A test trip.', description2: ''
  };

  beforeEach(async () => {
    service = jasmine.createSpyObj<TripService>('TripService', [
      'getTrips', 'addTrip', 'updateTrip', 'deleteTrip'
    ]);
    service.getTrips.and.returnValue(of([trip]));
    service.addTrip.and.returnValue(of(trip));
    service.updateTrip.and.returnValue(of(trip));
    service.deleteTrip.and.returnValue(of({ message: 'Trip deleted.', code: trip.code }));

    await TestBed.configureTestingModule({
      imports: [TripListComponent],
      providers: [{ provide: TripService, useValue: service }]
    }).compileComponents();

    fixture = TestBed.createComponent(TripListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads mock trips and renders reusable trip cards', () => {
    expect(service.getTrips).toHaveBeenCalled();
    expect(component.trips).toEqual([trip]);
    expect(fixture.nativeElement.querySelector('app-trip-card')).not.toBeNull();
  });

  it('opens the selected trip in the edit form', () => {
    component.startEdit(trip);
    fixture.detectChanges();

    expect(component.mode).toBe('edit');
    expect(component.draft.code).toBe(trip.code);
    expect(component.draft.name).toBe(trip.name);
    expect(fixture.nativeElement.querySelector('#editor-title').textContent).toContain('Edit trip details');
  });

  it('sends add and update form submissions to the matching service method', () => {
    component.startAdd();
    component.draft = { ...trip, code: 'NEW101', name: 'New Reef', start: '2026-11-15' };
    component.saveTrip({ invalid: false } as NgForm);
    expect(service.addTrip).toHaveBeenCalledWith(jasmine.objectContaining({ code: 'NEW101', name: 'New Reef' }));

    component.startEdit(trip);
    component.draft.name = 'Updated Reef';
    service.updateTrip.and.returnValue(of({ ...trip, name: 'Updated Reef' }));
    component.saveTrip({ invalid: false } as NgForm);
    expect(service.updateTrip).toHaveBeenCalledWith(trip.code, jasmine.objectContaining({ name: 'Updated Reef' }));
  });

  it('deletes a trip after the admin confirms', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteTrip(trip);

    expect(service.deleteTrip).toHaveBeenCalledWith(trip.code);
    expect(component.notice).toContain('deleted');
  });
});
