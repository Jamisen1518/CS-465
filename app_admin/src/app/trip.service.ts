import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from './trip.model';

@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/trips';

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl);
  }
  private authHeaders(): HttpHeaders {
  const token = localStorage.getItem('travlr-token');
  return token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();
}

  addTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl, trip, { headers: this.authHeaders() });
  }

  updateTrip(code: string, trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/${encodeURIComponent(code)}`, trip, { headers: this.authHeaders() });
  }

  deleteTrip(code: string): Observable<{ message: string; code: string }> {
    return this.http.delete<{ message: string; code: string }>(`${this.apiUrl}/${encodeURIComponent(code)}`, { headers: this.authHeaders() });
  }
}
