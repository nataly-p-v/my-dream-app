import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SubmitServiceService {
  url = 'http://localhost:300/enroll'
  constructor(private http: HttpClient) { }
  register(userData) {
    console.log(userData)
    // return this.http.post<any>(this.url, userData);
  }
}
