import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,} from 'rxjs';
import { environment } from 'src/environments/environment';
import { Calc } from '../model/calc';

@Injectable({
  providedIn: 'root'
})
export class CalcService {

  constructor(private http: HttpClient) { }

  queryAllConfig(): Observable<Calc[]>{
    return this.http.get<Calc[]>(environment.apiUrl + 'calc/query');
  }
}
