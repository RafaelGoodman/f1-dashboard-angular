import { Component, inject, OnInit, signal } from '@angular/core';
import { ResultsTable } from '../../components/results-table/results-table';
import { Drivers } from '../../services/drivers';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-results-page',
  imports: [ResultsTable],
  templateUrl: './results-page.html',
  styleUrl: './results-page.css',
})
export class ResultsPage implements OnInit {
  driverService = inject(Drivers);
  meetingItems = signal<Array<number>>([]);
  selectedYear: number | undefined = 2025;

  get title(): string {
    return this.selectedYear ? `Results (${this.selectedYear} Season)` : 'Results';
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
