import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MdToolbarModule } from "@angular2-material/toolbar";
import { MdCardModule } from "@angular2-material/card";
import { MdButtonModule } from "@angular2-material/button";
import { MdProgressCircleModule } from "@angular2-material/progress-circle";
import { MdProgressBarModule } from "@angular2-material/progress-bar";

import { ToasterModule } from 'angular2-toaster/angular2-toaster';


import { AppComponent } from './app.component';
import { VoteComponent } from './vote/vote.component';
import { ResultsComponent } from './results/results.component';
import { routing } from './app.routing';
import { AuthComponent } from './auth/auth.component';

@NgModule({
  declarations: [
    AppComponent,
    VoteComponent,
    ResultsComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MdToolbarModule,
    MdCardModule,
    MdButtonModule,
    MdProgressCircleModule,
    MdProgressBarModule,
    ToasterModule,
    routing
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
