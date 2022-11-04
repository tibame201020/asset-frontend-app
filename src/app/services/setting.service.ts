import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(private http: HttpClient) { }

  delAll(target:string):Observable<boolean>{
    return this.http.post<boolean>(environment.apiUrl + 'setting/del', target);
  }
}
