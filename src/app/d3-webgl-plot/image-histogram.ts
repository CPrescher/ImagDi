import * as d3 from 'd3';

export class ImageHistogram {
  margin = {
    top: 10, right: 30, bottom: 30, left: 60
  }
  width = 100;
  height = 400;
  histPlot;
  colorScaleBar;
  x;
  xAxis;
  y;
  yAxis;
  private clip;

  constructor(private selector: string) {
    this.initPlot();
    this.initAxes();
    this.initColorBar();
  }

  initPlot() {
    this.histPlot = d3.select(this.selector)
      .append("svg")
      .attr("width", this.width + this.margin.left)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
      .attr("width", this.width / 2)
      .on("contextmenu", () => {
        d3.event.preventDefault();
      })
  }

  initAxes() {
    this.x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.width])

    this.xAxis = this.histPlot.append("g")
      .attr("transform", "translate(0, " + this.height + ")")
      .call(d3.axisBottom(this.x));

    // add Y Axis
    this.y = d3.scaleLinear()
      .domain([0, 100])
      .range([this.height, 0])

    this.yAxis = this.histPlot.append("g")
      .call(d3.axisLeft(this.y));
  }

  initColorBar() {
    this.colorScaleBar = d3.select(this.selector)
      .append("svg")
      .attr("width", this.width / 2 + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate( 0," + this.margin.top + ")")
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

  hist(imageData, bins: number) {
    // find minimum and maximum
    let min = Infinity;
    let max = -Infinity;
    for (const item of imageData) {
      if (item < min) min = item;
      else if (item > max) max = item;
    }
    max += 0.0001 * (max - min); // to avoid missing values at border

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
}
