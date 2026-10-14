import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedListings, SearchFilters } from './listing.models';

@Injectable({ providedIn: 'root' })
export class ListingSearchService {
  constructor(private readonly http: HttpClient) {}

  search(filters: SearchFilters, page: number, pageSize: number): Observable<PagedListings> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) {
        params = params.set(key, value);
      }
    }

    return this.http.get<PagedListings>('/api/Search', { params });
  }
}
