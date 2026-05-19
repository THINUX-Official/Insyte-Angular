import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';

export interface OccupationOption {
  id: number;
  code: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class OccupationService {

  private readonly apiUrl = 'http://localhost:2424/api/occupations';

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
