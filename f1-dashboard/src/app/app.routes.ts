import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => {
      return import('./pages/home-page/home-page').then((m) => m.HomePage);
    },
  },
  {
    path: 'drivers',
    loadComponent: () => {
        return import('./pages/drivers-page/drivers-page').then((m) => m.DriversPage);
    },
  },
];
