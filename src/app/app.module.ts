import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ObservableTestComponent } from './components/observable-test/observable-test.component';
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";

@NgModule({
  declarations: [
    AppComponent,
    ObservableTestComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    RouterLink,
    MatToolbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
