import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DefaultResponseType} from "../../../types/default-response.type";
import {environment} from "../../../environments/environment";
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  consult: Subject<boolean> = new Subject<boolean>()

  constructor(private http: HttpClient) { }

  makeAnOrder(name: string, phone: string, service: string | null, type: string): Observable<DefaultResponseType> {
    if (service) {
      return this.http.post<DefaultResponseType>(environment.api + 'requests', {name, phone, service, type});
    } else {
      return this.http.post<DefaultResponseType>(environment.api + 'requests', {name, phone, type});
    }
  }
}
