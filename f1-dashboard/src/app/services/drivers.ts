import { inject, Injectable } from '@angular/core';
import { Driver } from '../models/driver.type';
import { HttpClient } from '@angular/common/http';
import { Meeting } from '../models/meeting.type';
import { concatMap, forkJoin, from, map, Observable, switchMap, timer, toArray } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Drivers {
  http = inject(HttpClient);

  getYearsFromApi() {
    const url = `https://api.openf1.org/v1/meetings`;
    return this.http.get<Array<Meeting>>(url).pipe(
      map((meetings) => {
        const years = meetings.map((meeting) => meeting.year);
        const uniqueYears = [...new Set(years)];
        return uniqueYears.sort((a, b) => b - a);
      })
    );
  }

  getMeetingsByYear(year: number): Observable<Meeting[]> {
    const url = `https://api.openf1.org/v1/meetings?year=${year}`;
    return this.http.get<Meeting[]>(url);
  }

  getRaceSessionKeys(meetingKeys: number[]): Observable<number[]> {
    return from(meetingKeys).pipe(
      concatMap((key) =>
        timer(360).pipe(
          switchMap(() =>
            this.http.get<any[]>(`https://api.openf1.org/v1/sessions?meeting_key=${key}`)
          )
        )
      ),
      toArray(),
      map((sessionsArrays) => {
        const allSessions = sessionsArrays.flat();
        const raceSessions = allSessions.filter((session) => session.session_name === 'Race');
        return raceSessions.map((session) => session.session_key);
      })
    );

    // const requests = meetingKeys.map((key) =>
    //   this.http.get<any[]>(`https://api.openf1.org/v1/sessions?meeting_key=${key}`)
    // );

    // return forkJoin(requests).pipe(
    //   map((sessionsArrays) => {
    //     const allSessions = sessionsArrays.flat();
    //     const raceSessions = allSessions.filter((session) => session.session_name === 'Race');
    //     const sessionKeys = raceSessions.map((session) => session.session_key);
    //     return sessionKeys;
    //   })
    // );
  }

  getDriversBySessionKeys(sessionKeys: number[]): Observable<Driver[]> {
    return from(sessionKeys).pipe(
      concatMap((key) =>
        timer(360).pipe(
          switchMap(() =>
            this.http.get<Driver[]>(`https://api.openf1.org/v1/drivers?session_key=${key}`)
          )
        )
      ),
      toArray(),
      map((responses) => {
        const allDrivers = responses.flat();
        const uniqueDrivers = allDrivers.filter(
          (driver, index, self) =>
            index === self.findIndex(d => d.driver_number === driver.driver_number)
        );
        return uniqueDrivers;
      })
    )

    // const requests = sessionKeys.map((key) =>
    //   this.http.get<Driver[]>(`https://api.openf1.org/v1/drivers?session_key=${key}`)
    // );

    // return forkJoin(requests).pipe(
    //   map((responses) => {
    //     const allDrivers = responses.flat();
    //     const uniqueDrivers = allDrivers.filter(
    //       (driver, index, self) =>
    //         index === self.findIndex((d) => d.driver_number === driver.driver_number)
    //     );
    //     return uniqueDrivers;
    //   })
    // );
  }

  getDriversFromYear(year: number): Observable<Driver[]> {
    return this.getMeetingsByYear(year).pipe(
      map((meetings) => meetings.map((m) => m.meeting_key)),
      switchMap((meetingKeys) => this.getRaceSessionKeys(meetingKeys)),
      switchMap((sessionKeys) => this.getDriversBySessionKeys(sessionKeys))
    );
  }
}
