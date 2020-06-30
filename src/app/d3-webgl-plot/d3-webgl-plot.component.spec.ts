import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3WebglPlotComponent } from './d3-webgl-plot.component';

describe('D3WebglPlotComponent', () => {
  let component: D3WebglPlotComponent;
  let fixture: ComponentFixture<D3WebglPlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3WebglPlotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3WebglPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
