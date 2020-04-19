import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss']
})
export class PlotComponent implements OnInit {
  public plotRevision = 0;

  public graph = {
    data:
      [
        {x: [1, 2, 3], y: [2, 6, 3], type: 'scatter', mode: 'lines+points', marker: {color: 'red'}},
        {x: [1, 2, 3], y: [2, 5, 3], type: 'bar'},
      ],
    layout:
      {
        autosize: true, fillFrame: false, frameMargins: 0.1, title: 'A Fancy Plot'
      },
    config:
      {
        responsive: true,
      }
  }


  constructor() {
  }

  ngOnInit(): void {
  }

}
