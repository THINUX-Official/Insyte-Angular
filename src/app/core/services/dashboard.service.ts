import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

interface StandardResponse<T> {
  code: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {
  }

  createUser(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/users`, payload);
  }

  updateUser(username: string, payload: any) {
    return this.http.put<any>(
      `${this.apiUrl}/users/by-username?username=${encodeURIComponent(username)}`,
      payload
    );
  }

  deleteUser(username: string) {
    return this.http.put<any>(
      `${this.apiUrl}/users/delete/by-username?username=${encodeURIComponent(username)}`,
      {}
    );
  }

  getUsers(): Observable<any[]> {
    return this.http
      .get<StandardResponse<any[]> | any[]>(`${this.apiUrl}/users?status=ACTIVE`)
      .pipe(map(response => this.extractArray(response)));
  }

  getUserByUsername(username: string) {
    return this.http.get<any>(
      `${this.apiUrl}/users/by-username?username=${encodeURIComponent(username)}`
    );
  }

  createLead(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/leads`, payload);
  }

  updateLead(id: number, payload: any) {
    return this.http.put<any>(`${this.apiUrl}/leads/${id}`, payload);
  }

  deleteLead(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/leads/${id}`);
  }

  getLeads(): Observable<any[]> {
    return this.http
      .get<StandardResponse<any[]> | any[]>(`${this.apiUrl}/leads`)
      .pipe(map(response => this.extractArray(response)));
  }

  getAgentPerformanceByMonth(year: number, month: number): Observable<any[]> {
    return this.http
      .get<any[] | StandardResponse<any[]>>(`${this.apiUrl}/agent-performance/month?year=${year}&month=${month}`)
      .pipe(map(response => this.extractArray(response)));
  }

  getAiPredictionsByMonth(year: number, month: number): Observable<any[]> {
    return this.http
      .get<any[] | StandardResponse<any[]>>(`${this.apiUrl}/ai-predictions/month?year=${year}&month=${month}`)
      .pipe(map(response => this.extractArray(response)));
  }

  getFraudAlerts(): Observable<any[]> {
    return this.http
      .get<any[] | StandardResponse<any[]>>(`${this.apiUrl}/fraud-alerts`)
      .pipe(map(response => this.extractArray(response)));
  }

  getRecommendations(): Observable<any[]> {
    return this.http
      .get<any[] | StandardResponse<any[]>>(`${this.apiUrl}/recommendations`)
      .pipe(map(response => this.extractArray(response)));
  }

  getMlExperiments(): Observable<any[]> {
    return this.http
      .get<any[] | StandardResponse<any[]>>(`${this.apiUrl}/ml-experiments`)
      .pipe(map(response => this.extractArray(response)));
  }

  runAiPipeline(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ai-pipeline/run`, {});
  }

  private extractArray(response: StandardResponse<any[]> | any[]): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response?.data || [];
  }
}
