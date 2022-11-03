import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,} from 'rxjs';
import { environment } from 'src/environments/environment';
import { TransLog } from '../model/trans-log';

@Injectable({
  providedIn: 'root'
})
export class TransLogService {

  constructor(private http: HttpClient) { }

  saveTransLog(transLog:TransLog):Observable<boolean>{
    return this.http.post<boolean>(environment.apiUrl + 'trans/save', transLog);
  }

  queryByDateRange(dateRange:any):Observable<TransLog[]> {
    return this.http.post<TransLog[]>(environment.apiUrl + 'trans/queryByDateRange', dateRange);
  }

  deleteTransLog(id:number):Observable<boolean>{
    return this.http.post<boolean>(environment.apiUrl + 'trans/delete', id);
  }
}
