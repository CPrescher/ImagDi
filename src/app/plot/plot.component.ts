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
          z: [[1, 20, 30], [20, 1, 60], [30, 60, 1]],
          type: 'heatmapgl'
        }
      ],
    layout:
      {
        // autosize: true, fillFrame: false, frameMargins: 0.1, title: 'A Fancy Plot'
      },
    config:
      {
      //   responsive: true,
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
  }

  plotImage(imageData) {
    this.graph.data[0].z = imageData;
  }

}
