import { inject, Injectable } from '@angular/core';
import { Driver } from '../models/driver.type';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Drivers {
  http = inject(HttpClient);

  getDriversFromApi() {
    const url = `https://api.openf1.org/v1/drivers?meeting_key=latest&session_key=latest`;
    return this.http.get<Array<Driver>>(url)
  }
}
