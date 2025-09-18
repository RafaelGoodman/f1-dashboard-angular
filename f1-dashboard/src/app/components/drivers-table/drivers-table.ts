import { Component, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { Drivers } from '../../services/drivers';
import { Driver } from '../../models/driver.type';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-drivers-table',
  standalone: true,
  imports: [],
  templateUrl: './drivers-table.html',
  styleUrl: './drivers-table.css',
})
export class DriversTable implements OnInit, OnChanges {
  @Input() season: number | undefined;

  driverService = inject(Drivers);
  driverItems = signal<Array<Driver>>([]);

  ngOnInit(): void {
    console.log('Season Selected (default): ', this.season);
    this.fetchDrivers(this.season ?? 2025);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['season'] && this.season !== undefined) {
      console.log('Season changed to: ', this.season);
      this.fetchDrivers(this.season);
    }
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
      });
  }
}