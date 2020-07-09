import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DataSourceService } from '../core/services';
import { interval } from 'rxjs';
import { ImagePlot } from './image-plot';

@Component({
  selector: 'app-d3-webgl-plot',
  templateUrl: './d3-webgl-plot.component.html',
  styleUrls: ['./d3-webgl-plot.component.scss']
})
export class D3WebglPlotComponent implements AfterViewInit {

  imagePlot: ImagePlot;

  imageWidth = 2048;
  imageHeight = 2048;

  sub;

  constructor(private dataService: DataSourceService) {
  }

  ngAfterViewInit() {
    this.imagePlot = new ImagePlot("#graph");
    this.imagePlot.plotImage(this.dataService.createRandomDetectorImage(this.imageWidth, this.imageHeight),
      this.imageWidth, this.imageHeight);

    // this.whiteNoiseTV()
  }

  whiteNoiseTV() {
    let width = 2048;
    let height = width;

    const num_images = 10;

    let random_images = new Array(num_images);
    for (let i = 0; i < num_images; i++) {
      random_images[i] = this.dataService.createRandomDetectorImage(width, height)
    }

    this.sub = interval(1).subscribe(() => {
      this.imagePlot.plotImage(random_images[Math.floor(Math.random() * num_images)], width, height)
    })
  }
}
