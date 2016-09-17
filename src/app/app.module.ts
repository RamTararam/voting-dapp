import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MdToolbarModule } from "@angular2-material/toolbar";
import { MdCardModule } from "@angular2-material/card";
import { MdButtonModule } from "@angular2-material/button";
import { MdProgressCircleModule } from "@angular2-material/progress-circle";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MdToolbarModule,
    MdCardModule,
    MdButtonModule,
    MdProgressCircleModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
