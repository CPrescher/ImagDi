import * as d3 from 'd3';
import { SVG, Group } from './d3-lib';
import { Subject } from 'rxjs';

export class ImageHistogram {
  margin = {
    top: 10, right: 30, bottom: 30, left: 20, between: 10,
  }
  width = 100;
  height = 400;
  histPlot;
  histPath;
  colorScaleBar;
  colorScale;
  x;
  xAxis;
  y;
  yAxis;

  hist;
  histLine;
  brush;
  brushElement;

  public rangeChanged = new Subject<[number, number]>();
  private clip;

  constructor(private selector: string) {
    this.colorScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([0, 65000])

    this.initPlot();
    this.initAxes();
    this.initBrush();
    this.initColorBar();

  }

  initPlot() {
    this.histPlot = d3.select(this.selector)
      .append("svg")
      .attr("width", this.width / 2 + this.margin.left)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
      .attr("width", this.width / 2)
      .on("contextmenu", () => {
        d3.event.preventDefault();
      })

    this.histPath = this.histPlot
      .append("g")
  }

  initAxes() {
    this.x = d3.scaleLog()
      .domain([1e-10, 100])
      .range([0, this.width / 2])

    this.xAxis = this.histPlot.append("g")
      .attr("transform", "translate(0, " + this.height + ")")
      .call(d3.axisBottom(this.x));

    // add Y Axis
    this.y = d3.scaleLog()
      .domain([1e-10, 100])
      .range([this.height, 0])

    this.yAxis = this.histPlot.append("g")
      .call(d3.axisLeft(this.y));
  }

  initBrush() {
    let brushed = () => {
      let min = this.y.invert(d3.event.selection[0]);
      let max = this.y.invert(d3.event.selection[1]);
      this.colorScale.domain([min, max]);
      this.rangeChanged.next([min, max]);
    }

    this.brush = d3.brushY()
      .extent([[0, -this.height/2], [this.width / 2, this.height*1.5]])
      .on("brush end", brushed)

    this.brushElement = this.histPlot.append("g")
      .attr("class", "brush")
      .call(this.brush)
      .call(this.brush.move, [0, this.height])

  }

  initColorBar() {
    this.colorScaleBar = d3.select(this.selector)
      .append("svg")
      .attr("width", this.width / 2 + this.margin.right - this.margin.between / 2)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.between + "," + this.margin.top + ")")
      .attr("width", this.width / 2)
      .on("contextmenu", () => {
        d3.event.preventDefault();
      })

    let colorScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([0, this.height])

    let bars = this.colorScaleBar.selectAll(".bars")
      .data(d3.range(this.height), (d) => {
        return d;
      })
      .enter().append("rect")
      .attr("class", "bars")
      .attr("y", (d, i) => {
        return this.height - i;
      })
      .attr("x", 0)
      .attr("height", 1)
      .attr("width", this.width / 2)
      .style("fill", function (d, i) {
        return colorScale(d)
      })
  }

  calculateHistogram(imageData, bins: number) {
    // find minimum and maximum
    let min = Infinity;
    let max = -Infinity;
    for (const item of imageData) {
      if (item < min) min = item;
      else if (item > max) max = item;
    }

    // get histogram
    const binSize = (max - min) / bins;
    const histogram = new Uint32Array(bins).fill(0);

    for (const item of imageData) {
      histogram[Math.floor((item - min) / binSize)]++;
    }

    // calculate bin center positions
    const binCenters = new Array(bins);
    const binOffset = binSize / 2 + min;
    for (let i = 0; i < bins; i++) {
      binCenters[i] = i * binSize + binOffset
    }

    return {
      data: histogram,
      binCenters: binCenters,
      min: min,
      max: max,
      binSize: binSize
    };
  }

  updateImage(imageData) {
    this.hist = this.calculateHistogram(imageData, 5000);
    this.plotHistogram();
  }

  plotHistogram() {
    const xy = [];
    for (let i = 0; i < this.hist.data.length; i++) {
      xy.push({x: this.hist.binCenters[i], y: this.hist.data[i]})
    }
    this.x.domain([d3.min(this.hist.data), d3.max(this.hist.data)]);
    this.y.domain([d3.min(this.hist.binCenters), this.hist.max]);
    this._updateAxes();

    this.histLine = d3.line()
      .x((d: any) => {
        return this.x(d.y);
      })
      .y((d: any) => {
        return this.y(d.x);
      });


    //Create line
    this.histPath.append("path")
      .datum(xy)
      .attr("class", "line")
      .attr("d", this.histLine)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
  }

  calcColorImage(imageArray) {
    let colorImageArray = new Uint8ClampedArray(imageArray.length * 3)
    let pos = 0;
    let c: any;
    let t1 = Date.now();
    this.calcColorLut(0, 66000);
    for (let i = 0; i < imageArray.length; i++) {
      const c = this.colorLut[imageArray[i]]
      pos = i * 3;
      colorImageArray[pos] = c[0];
      colorImageArray[pos + 1] = c[1];
      colorImageArray[pos + 2] = c[2];
    }
    return colorImageArray;
  }

  calcColorImageOld(imageArray) {
    let colorImageArray = new Uint8ClampedArray(imageArray.length * 3)
    let pos = 0;
    let c: any;
    for (let i = 0; i < imageArray.length; i++) {
      const c = this.hexToRgb(this.colorScale(imageArray[i]))
      pos = i * 3;
      colorImageArray[pos] = c[0];
      colorImageArray[pos + 1] = c[1];
      colorImageArray[pos + 2] = c[2];
    }
    return colorImageArray;
  }

  colorLut

  calcColorLut(min, max){
    this.colorLut = new Array((max-min)*3)
    for(let i = 0; i<max-min; i++) {
      this.colorLut[i] = this.hexToRgb(this.colorScale(min+i));
    }
  }

  hexToRgb(hex) {
    let bigint = parseInt(hex.substr(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b]
  }

  _updateAxes(duration = 500) {
    this.xAxis
      .transition()
      .duration(duration)
      .call(
        d3.axisBottom(this.x)
          .ticks(1000)
          .tickFormat(() => "")
      )
    this.yAxis
      .transition()
      .duration(duration)
      .call(
        d3.axisLeft(this.y)
          .ticks(20)
          .tickFormat(() => "")
      )
  }
}
