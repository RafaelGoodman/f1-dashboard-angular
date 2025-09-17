import { Component, inject, OnInit, signal } from '@angular/core';
import { Drivers } from '../../services/drivers';
import { Driver } from '../../models/driver.type';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-drivers-page',
  imports: [],
  templateUrl: './drivers-page.html',
  styleUrl: './drivers-page.css',
})
export class DriversPage implements OnInit {
  title: string = 'Drivers';

  driverService = inject(Drivers);
  driverItems = signal<Array<Driver>>([]);

  ngOnInit(): void {
    this.driverService
      .getDriversFromApi()
      .pipe(
        catchError((err) => {
          console.log(err);
          throw err;
        })
      )
      .subscribe((drivers) => {
        this.driverItems.set(drivers);
      });
  }
}
