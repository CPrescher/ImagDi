import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3PlotComponent } from './d3-plot.component';

describe('D3PlotComponent', () => {
  let component: D3PlotComponent;
  let fixture: ComponentFixture<D3PlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3PlotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3PlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
