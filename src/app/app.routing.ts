import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VoteComponent } from './vote/vote.component';
import { ResultsComponent } from './results/results.component';
import {AuthComponent} from "./auth/auth.component";


const appRoutes: Routes = [
  {
    path: 'auth',
    component: AuthComponent
  },
  {
    path: 'vote',
    component: VoteComponent
  },
  {
    path: 'results',
    component: ResultsComponent
  },
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
];


export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
