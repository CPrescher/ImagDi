import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotComponent } from './plot.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';
import { MaterialsModule } from '../shared/materials.module';

PlotlyModule.plotlyjs = PlotlyJS;

describe('PlotComponent', () => {
  let component: PlotComponent;
  let fixture: ComponentFixture<PlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlotComponent ],
      imports: [
        HttpClientTestingModule,
        MaterialsModule,
        PlotlyModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });
});
