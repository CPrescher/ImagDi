import { Component, OnInit } from '@angular/core';
import { DataSourceService } from '../core/services/data-source.service';

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
        {
          z: [[[50, 20, 30], [20, 1, 60], [30, 60, 1]],
              [[50, 20, 30], [20, 1, 60], [30, 60, 200]],
              [[50, 20, 30], [20, 1, 60], [30, 60, 200]]],
          type: 'image',
          hoverinfo: 'skip',
        }
      ],
    layout:
      {
        // autosize: true, fillFrame: false, frameMargins: 0.1, title: 'A Fancy Plot'
      },
    config:
      {
         // responsive: true,
      }
  }


  constructor(private dataService: DataSourceService) {

  }

  ngOnInit(): void {
    this.dataService.imageChanged.subscribe(
      imageData => {
        console.log('new data');
        this.plotImage(imageData);
      }
    )
    let onesMatrix = this.dataService.createOnes(50, 50);
    let lutMatrix = this.dataService.applyLut(onesMatrix);
    this.plotImage(lutMatrix);

  }

  plotImage(imageData) {
    this.graph.data[0].z = imageData;
  }

}
