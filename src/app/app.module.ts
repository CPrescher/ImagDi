import 'reflect-metadata';
import '../polyfills';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from './core/core.module';


import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { FileComponent } from './file/file.component';
import { HeaderComponent } from './header/header.component';
import { PlotComponent } from './plot/plot.component';
import { MaterialsModule } from './shared/materials.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PlotlyViaWindowModule } from 'angular-plotly.js';
import { WebglPlotComponent } from './webgl-plot/webgl-plot.component';
import { D3PlotComponent } from './d3-plot/d3-plot.component';

@NgModule({
  declarations: [
    AppComponent,
    FileComponent,
    HeaderComponent,
    PlotComponent,
    WebglPlotComponent,
    D3PlotComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    MaterialsModule,
    PlotlyViaWindowModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
