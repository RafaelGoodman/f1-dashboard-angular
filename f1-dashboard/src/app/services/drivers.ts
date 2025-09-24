import { inject, Injectable } from '@angular/core';
import { Driver } from '../models/driver.type';
import { HttpClient } from '@angular/common/http';
import { Meeting } from '../models/meeting.type';
import {
  concat,
  concatMap,
  forkJoin,
  from,
  map,
  Observable,
  switchMap,
  tap,
  timer,
  toArray,
} from 'rxjs';
import { Session } from '../models/session.type';
import { SessionResult } from '../models/session-result.type';

@Injectable({
  providedIn: 'root',
})
export class Drivers {
  http = inject(HttpClient);
  toPrint: string | undefined;

  /**
   * Fetches all years available from the API.
   * @returns Array of <Meeting>.
   */
  getYearsFromApi() {
    console.log(`> Fetching all available years from API.`);
    const url = `https://api.openf1.org/v1/meetings`;
    return this.http.get<Array<Meeting>>(url).pipe(
      map((meetings) => {
        const years = meetings.map((meeting) => meeting.year);
        const uniqueYears = [...new Set(years)];
        console.log('>> Fetched all available years from API.');
        return uniqueYears.sort((a, b) => b - a);
      })
    );
  }

  /**
   * Fetches all meetings for a given year.
   * @param year The specified year (season).
   * @returns Observable of Meeting[].
   */
  getMeetingsByYear(year: number): Observable<Meeting[]> {
    console.log(`> Fetching meetings for ${year}.`);
    const url = `https://api.openf1.org/v1/meetings?year=${year}`;

    return timer(300).pipe(
      switchMap(() => this.http.get<Meeting[]>(url)),
      tap(() => console.log(`>> Fetched meetings for ${year}.`))
    );
  }

  /**
   * Fetches all 'Race' session keys from meetings.
   * @param meetingKeys Array of meeting keys (meeting_key).
   * @returns Observable of number[] (Contains each session_key).
   */
  getRaceSessionKeys(meetingKeys: number[]): Observable<number[]> {
    console.log(`> Fetching 'Race' session keys.`);
    return from(meetingKeys).pipe(
      concatMap((key) =>
        timer(1000).pipe(
          switchMap(() =>
            this.http.get<any[]>(`https://api.openf1.org/v1/sessions?meeting_key=${key}`)
          )
        )
      ),
      toArray(),
      map((sessionsArrays) => {
        const allSessions = sessionsArrays.flat();
        const raceSessions = allSessions.filter((session) => session.session_name === 'Race'); // Only include sessions named "Race".
        console.log(`>> Fetched 'Race' session keys.`);
        return raceSessions.map((session) => session.session_key);
      })
    );
  }

  /**
   * Fetch information for each session in the year.
   * @param year The specified year (season).
   * @returns Observable of Session[].
   */
  getRaceSessionsByYear(year: number): Observable<Session[]> {
    console.log(`> Fetching information for each 'Race' session for ${year}.`);
    return this.getMeetingsByYear(year).pipe(
      map((meetings) => meetings.map((m) => m.meeting_key)),
      switchMap((meetingKeys) => this.getRaceSessionKeys(meetingKeys)),
      switchMap((sessionKeys) =>
        from(sessionKeys).pipe(
          concatMap((key) =>
            timer(1000).pipe(
              switchMap(() =>
                this.http.get<Session>(`https://api.openf1.org/v1/sessions?session_key=${key}`)
              )
            )
          ),
          toArray(),
          map((sessionArrays) => sessionArrays.flat()),
          tap(() => console.log(`>> Fetched information (i.e. table header country codes) for each 'Race' session for ${year}.`))
        )
      )
    );
  }

  /**
   * Fetches individual driver results for each session.
   * @param sessionKeys Array of session keys (session_key).
   * @returns Observable of SessionResult[].
   */
  getRaceResultsBySessionKeys(sessionKeys: number[]): Observable<SessionResult[]> {
    console.log(`> Fetching results for each 'Race' session.`);
    return from(sessionKeys).pipe(
      concatMap((key) =>
        timer(1000).pipe(
          switchMap(() =>
            this.http.get<SessionResult[]>(
              `https://api.openf1.org/v1/session_result?session_key=${key}`
            )
          )
        )
      ),
      toArray(),
      map((resultsArrays) => resultsArrays.flat()),
      tap(() => console.log(`>> Fetched results for each 'Race' session.`))
    );
  }

  /**
   * Fetches all drivers that have driven in a 'Race' in a year.
   * @param sessionKeys Array of session keys (session_key).
   * @returns Observable of Driver[].
   */
  getDriversBySessionKeys(sessionKeys: number[]): Observable<Driver[]> {
    console.log(`> Fetching all drivers active in a 'Race' this year.`);
    return from(sessionKeys).pipe(
      concatMap((key) =>
        timer(1000).pipe(
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
            index === self.findIndex((d) => d.driver_number === driver.driver_number)
        );
        console.log(`>> Fetched all drivers active in a 'Race' this year.`);
        return uniqueDrivers;
      })
    );
  }

  /**
   * Returns array of drivers from specified year.
   * @param year The specified year (season).
   * @returns Observable of Driver[].
   */
  getDriversFromYear(year: number): Observable<Driver[]> {
    console.log(`> Returning all drivers from ${year}.`);
    return this.getMeetingsByYear(year).pipe(
      map((meetings) => meetings.map((m) => m.meeting_key)),
      switchMap((meetingKeys) => this.getRaceSessionKeys(meetingKeys)),
      switchMap((sessionKeys) => this.getDriversBySessionKeys(sessionKeys)),
      tap(() => console.log(`> Returned all drivers from ${year}.`))
    );
  }
}
