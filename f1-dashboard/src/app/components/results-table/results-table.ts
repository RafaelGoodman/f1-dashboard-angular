import { Component, inject, Input, signal, SimpleChanges } from '@angular/core';
import { catchError, map, switchMap } from 'rxjs';
import { Driver } from '../../models/driver.type';
import { Drivers } from '../../services/drivers';
import { Session } from '../../models/session.type';
import { SessionResult } from '../../models/session-result.type';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-results-table',
  imports: [JsonPipe],
  templateUrl: './results-table.html',
  styleUrl: './results-table.css',
})
export class ResultsTable {
  @Input() season: number | undefined;

  driverService = inject(Drivers);
  driverItems = signal<Array<Driver>>([]);
  sessionItems = signal<Array<Session>>([]);
  sessionResults = signal<Array<SessionResult>>([]);
  result: any;
  booleanValue: any = false;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortSessionKey: number | undefined;
  dataLoaded = {
    drivers: false,
    sessions: false,
    results: false,
  }

  ngOnInit(): void {
    console.log('Season Selected (default): ', this.season);
    this.fetchSessions(this.season ?? 2025);
    this.fetchDrivers(this.season ?? 2025);
    this.fetchSessionResults(this.season ?? 2025);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['season'] && this.season !== undefined) {
      console.log('Season changed to: ', this.season);
      console.log('Retrieving sessions.');
      this.fetchSessions(this.season);
      console.log('Sessions retrieved.');
      console.log('Retrieving drivers.');
      this.fetchDrivers(this.season);
      console.log('Drivers retrieved.');
      console.log('Retrieving results.');
      this.fetchSessionResults(this.season ?? 2025);
      console.log('Results retrieved.');
    }
  }

  getDriverResult(driverNumber: number, sessionKey: number): SessionResult | undefined {
    const result = this.sessionResults().find(
      (result) => result.driver_number === driverNumber && result.session_key === sessionKey
    );
    //console.log(`Result for driver ${driverNumber} in session ${sessionKey}:`, result);
    return result;
  }

  getTotalPoints(driverNumber: number): number {
    return this.sessionResults()
      .filter((result) => result.driver_number === driverNumber && !result.dns && !result.dnf)
      .reduce((sum, r) => sum + (r.points ?? 0), 0);
  }

  private fetchDrivers(year: number): void {
    this.driverService
      .getDriversFromYear(year)
      .pipe(
        catchError((err) => {
          console.error('Error fetching drivers: ', err);
          throw err;
        })
      )
      .subscribe((drivers) => {
        this.driverItems.set(drivers);
        this.dataLoaded.drivers = true;
        this.checkAllDataLoaded();
      });
  }

  private fetchSessions(year: number): void {
    this.driverService
      .getRaceSessionsByYear(year)
      .pipe(
        catchError((err) => {
          console.error('Error fetching drivers: ', err);
          throw err;
        })
      )
      .subscribe((sessions) => {
        this.sessionItems.set(sessions);
        this.dataLoaded.sessions = true;
        this.checkAllDataLoaded();
      });
  }

  private fetchSessionResults(year: number): void {
    this.driverService
      .getMeetingsByYear(year)
      .pipe(
        map((meetings) => meetings.map((m) => m.meeting_key)),
        switchMap((meetingKeys) => this.driverService.getRaceSessionKeys(meetingKeys)),
        switchMap((sessionKeys) => this.driverService.getRaceResultsBySessionKeys(sessionKeys)),
        catchError((err) => {
          console.error('Error fetching session results:', err);
          throw err;
        })
      )
      .subscribe((results) => {
        this.sessionResults.set(results);
        this.dataLoaded.results = true;
        this.checkAllDataLoaded();
      });
  }

  sortCol(column: 'full_name' | 'team_name' | 'points', forceDirection?: 'asc' | 'desc'): void {
    if (this.sortColumn === column && !forceDirection) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = forceDirection ?? (column === 'points' ? 'desc' : 'asc');
    }

    const sortedDrivers = [...this.driverItems()].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (column === 'points') {
        aValue = this.getTotalPoints(a.driver_number);
        bValue = this.getTotalPoints(b.driver_number);
      } else {
        aValue = a[column];
        bValue = b[column];
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.driverItems.set(sortedDrivers);
    console.log(`Sorted table by '${column}' in ${this.sortDirection} order.`)
  }

  sortSessionCol(sessionKey: number): void {
    if (this.sortSessionKey === sessionKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortSessionKey = sessionKey;
      this.sortDirection = 'asc';
    }

    const sortedDrivers = [...this.driverItems()].sort((a, b) => {
      const aResult = this.getDriverResult(a.driver_number, sessionKey);
      const bResult = this.getDriverResult(b.driver_number, sessionKey);

      const aValue = aResult?.position ?? Number.MAX_SAFE_INTEGER;
      const bValue = bResult?.position ?? Number.MAX_SAFE_INTEGER;

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    this.driverItems.set(sortedDrivers);
    console.log(`Sorted table by 'session_key: ${sessionKey}' in ${this.sortDirection} order.`)
  }

  private checkAllDataLoaded(): void {
    const { drivers, sessions, results } = this.dataLoaded;
    if (drivers && sessions && results) {
      this.sortDirection = 'desc';
      this.sortCol('points', 'desc');
      console.log("SORTED >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    }
  }
}
