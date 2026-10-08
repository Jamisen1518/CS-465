import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from './trip.model';

@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/trips';

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl);
  }

  addTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl, trip);
  }

  updateTrip(code: string, trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/${encodeURIComponent(code)}`, trip);
  }

  deleteTrip(code: string): Observable<{ message: string; code: string }> {
    return this.http.delete<{ message: string; code: string }>(`${this.apiUrl}/${encodeURIComponent(code)}`);
  }
}
