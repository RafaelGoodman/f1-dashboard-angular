import { Component, inject, OnInit, signal } from '@angular/core';
import { Drivers } from '../../services/drivers';
import { Driver } from '../../models/driver.type';
import { catchError } from 'rxjs';
import { DriversTable } from '../../components/drivers-table/drivers-table';
import { Meeting } from '../../models/meeting.type';

@Component({
  selector: 'app-standings-page',
  imports: [DriversTable],
  templateUrl: './standings-page.html',
  styleUrl: './standings-page.css',
})
export class StandingsPage implements OnInit {
  driverService = inject(Drivers);
  meetingItems = signal<Array<number>>([]);
  selectedYear: number | undefined = 2025;

  get title(): string {
    return this.selectedYear
     ? `Standings (${this.selectedYear} Season)`
     : 'Standings';
  }

  ngOnInit(): void {
    this.driverService
      .getYearsFromApi()
      .pipe(
        catchError((err) => {
          console.log(err);
          throw err;
        })
      )
      .subscribe((years) => {
        this.meetingItems.set(years);
      });
  }

  onYearSelect(year: number) {
    this.selectedYear = year;
    // console.log("Selected year:", year)
  }
}
