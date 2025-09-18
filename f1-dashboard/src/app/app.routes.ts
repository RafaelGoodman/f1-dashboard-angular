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
    path: 'standings',
    loadComponent: () => {
        return import('./pages/standings-page/standings-page').then((m) => m.StandingsPage);
    },
  },
  {
    path: 'results',
    loadComponent: () => {
        return import('./pages/results-page/results-page').then((m) => m.ResultsPage);
    },
  },
];
