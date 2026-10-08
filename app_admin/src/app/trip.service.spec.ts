import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TripService } from './trip.service';
import { Trip } from './trip.model';

describe('TripService', () => {
  let service: TripService;
  let http: HttpTestingController;
  const trip: Trip = {
    code: 'TEST101', name: 'Test Reef', length: '3 nights / 4 days', start: '2026-11-15T08:00:00Z',
    resort: 'Blue Cove, 4 stars', perPerson: '899.00', image: 'reef1.jpg', description: 'A test trip.', description2: ''
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TripService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TripService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('retrieves trip cards from the API', () => {
    service.getTrips().subscribe(trips => expect(trips).toEqual([trip]));
    http.expectOne('/api/trips').flush([trip]);
  });

  it('sends POST, PUT, and DELETE requests for trip maintenance', () => {
    service.addTrip(trip).subscribe(result => expect(result).toEqual(trip));
    const create = http.expectOne('/api/trips');
    expect(create.request.method).toBe('POST'); create.flush(trip);

    service.updateTrip(trip.code, trip).subscribe(result => expect(result).toEqual(trip));
    const update = http.expectOne(`/api/trips/${trip.code}`);
    expect(update.request.method).toBe('PUT'); update.flush(trip);

    service.deleteTrip(trip.code).subscribe(result => expect(result.code).toBe(trip.code));
    const remove = http.expectOne(`/api/trips/${trip.code}`);
    expect(remove.request.method).toBe('DELETE'); remove.flush({ message: 'Trip deleted.', code: trip.code });
  });
});
