import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

export interface OccupationOption {
  id: number;
  code: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class OccupationService {

  private readonly apiUrl = `${environment.apiBaseUrl}/occupations`;

  constructor(private http: HttpClient) {
  }

  getOccupations(): Observable<OccupationOption[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }

        return response?.data || [];
      })
    );
  }
}
