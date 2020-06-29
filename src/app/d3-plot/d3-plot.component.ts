import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DataSourceService } from '../core/services';

import * as d3 from 'd3';

@Component({
  selector: 'app-d3-plot',
  templateUrl: './d3-plot.component.html',
  styleUrls: ['./d3-plot.component.scss']
})
export class D3PlotComponent implements OnInit, AfterViewInit {

  imageWidth = 2048;
  imageHeight = 2048;

  margin = {
    top: 10, right: 30, bottom: 30, left: 60
  }
  width = 400;
  height = 400;
  fixedAspectRatio = true;

  SVG;
  x;
  xAxis;
  y;
  yAxis;

  clip;

  canvas;
  canvasContext;
  imageData;

  brushContext;

  mouseX;
  mouseY;

  constructor(private dataService: DataSourceService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.initSVG();
    this.initAxes();
    this.initClip();
    this.initImage(this.dataService.createRandomImageBuffer(this.imageWidth, this.imageHeight));
    this.initBrush();
    this.initMousePosition();
    this.initWheel();
    this.initDrag();
  }

  initSVG() {
    this.SVG = d3.select("#graph")
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
      .on("contextmenu", () => {
        d3.event.preventDefault();
      })
  }

  initAxes() {
    this.x = d3.scaleLinear()
      .domain([0, this.imageWidth])
      .range([0, this.width])

    this.xAxis = this.SVG.append("g")
      .attr("transform", "translate(0, " + this.height + ")")
      .call(d3.axisBottom(this.x));

    // add Y Axis
    this.y = d3.scaleLinear()
      .domain([0, this.imageHeight])
      .range([this.height, 0])

    this.yAxis = this.SVG.append("g")
      .call(d3.axisLeft(this.y));
  }

  initClip() {
    this.clip = this.SVG.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.width)
      .attr("height", this.height)
  }

  initImage(imgBuffer: Uint8ClampedArray) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.imageWidth;
    this.canvas.height = this.imageHeight;
    this.canvasContext = this.canvas.getContext('2d');

    this.imageData = this.canvasContext.createImageData(this.imageWidth, this.imageHeight);
    this.imageData.data.set(imgBuffer)
    this.canvasContext.putImageData(this.imageData, 0, 0);
    let canvasUrl = this.canvas.toDataURL("image/png");

    this.SVG.append("image")
      .attr("id", "image")
      .attr("clip-path", "url(#clip)")
      .datum(canvasUrl)
      .attr("preserveAspectRatio", "none")
      .attr("image-rendering", "pixelated")
      .attr("xlink:href", (d) => {
        return d
      })
      .attr("x", 0.5)
      .attr("y", -0.5)
      .attr("height", this.height)
      .attr("width", this.width)
  }

  initBrush() {
    this.brushContext = this.SVG.append("g")
      .attr("id", "brushContext")
      .attr("class", "brushContext")


    let idleTimeout

    function idled() {
      idleTimeout = null
    }

    let updateChartBrush = () => {
      let extent = d3.event.selection
      if (!extent) {
        // unzoom for left doubleclick
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);

        this.updateDomain(0, this.imageWidth, 0, this.imageHeight);
      } else {
        this.updateDomain(this.x.invert(extent[0][0]), this.x.invert(extent[1][0]),
          this.y.invert(extent[1][1]), this.y.invert(extent[0][1]))
        this.brushContext.select(".brush").call(brush.move, null) // this removes the grey brush area as soon as
        // the selection has been done
      }
      this.update();
    }

    // add brushing
    let brush = d3.brush()
      .extent([[0, 0], [this.width, this.height]])
      .on("end", updateChartBrush)

    this.brushContext.append("g")
      .attr("class", "brush")
      .call(brush);

  }

  initMousePosition() {
    let updateMousePosition = () => {
      let left = this.x.domain()[0]
      let right = this.x.domain()[1]
      let bottom = this.y.domain()[0]
      let top = this.y.domain()[1]

      let currentWidth = right - left;
      let currentHeight = Math.abs(top - bottom);

      let brushContext = document.getElementById("brushContext");
      let boundingRect = brushContext.getBoundingClientRect();

      this.mouseX = left + (d3.event.x - boundingRect.left) / boundingRect.width * currentWidth;
      this.mouseY = bottom + (boundingRect.height - (d3.event.y - boundingRect.top)) / boundingRect.height * currentHeight;
    }

    this.brushContext.on("mousemove", updateMousePosition)
  }

  initWheel() {

    let wheelUpdate = () => {
      let left = this.x.domain()[0]
      let right = this.x.domain()[1]
      let bottom = this.y.domain()[0]
      let top = this.y.domain()[1]

      let currentWidth = Math.abs(right - left);
      let currentHeight = Math.abs(bottom - top);

      let brushContext = document.getElementById("brushContext");
      let boundingRect = brushContext.getBoundingClientRect();

      let mouseX = left + (d3.event.x - boundingRect.left) / boundingRect.width * currentWidth;
      let mouseY = bottom + (boundingRect.height - (d3.event.y - boundingRect.top)) / boundingRect.height * currentHeight;

      let factor = -d3.event.deltaY / 1000;

      let newLeft = left + (mouseX - left) * factor;
      let newRight = right - (right - mouseX) * factor;
      let newBottom = bottom + (mouseY - bottom) * factor
      let newTop = top - (top - mouseY) * factor;

      this.updateDomain(newLeft, newRight, newBottom, newTop);
      this.update();
    }

    this.brushContext.on("wheel", wheelUpdate)
  }

  initDrag() {
    let dragMouseStartX: number;
    let dragMouseStartY: number;
    let domainXDragStart: Array<number>;
    let domainYDragStart: Array<number>;

    let rightDragStart = () => {
      let brushContext = document.getElementById("brushContext");
      dragMouseStartX = this.mouseX;
      dragMouseStartY = this.mouseY;
      domainXDragStart = this.x.domain();
      domainYDragStart = this.y.domain();
      brushContext.addEventListener("mousemove", rightDragMove);
    }

    let lastUpdate = Date.now();
    let fps = 30
    let frameTime = 1000 / fps;

    let rightDragMove = (event) => {
      if (Date.now() - lastUpdate < frameTime) {
        return
      }

      let left = domainXDragStart[0]
      let right = domainXDragStart[1]
      let bottom = domainYDragStart[0]
      let top = domainYDragStart[1]

      let currentWidth = right - left;
      let currentHeight = Math.abs(top - bottom);

      let brushContext = document.getElementById("brushContext");
      let boundingRect = brushContext.getBoundingClientRect();

      let mouseX = left + (event.x - boundingRect.left) / boundingRect.width * currentWidth;
      let mouseY = bottom + (boundingRect.height - (event.y - boundingRect.top)) / boundingRect.height * currentHeight;

      let deltaX = mouseX - dragMouseStartX;
      let deltaY = mouseY - dragMouseStartY;

      this.updateDomain(domainXDragStart[0] - deltaX, domainXDragStart[1] - deltaX,
        domainYDragStart[0] - deltaY, domainYDragStart[1] - deltaY);
      this.update(0);

      lastUpdate = Date.now();
    }

    let rightDragStop = () => {
      let brushContext = document.getElementById("brushContext");
      brushContext.removeEventListener("mousemove", rightDragMove)
    }

    this.brushContext.on("mousedown", rightDragStart)
    this.brushContext.on("mouseup", rightDragStop)
  }

  updateDomain(left: number, right: number, bottom: number, top: number) {
    if (this.fixedAspectRatio) {
      let width = right - left;
      let height = top - bottom;

      if (width < height) {
        let centerX = left + width/2
        left = centerX - height/2
        right = centerX + height/2
      } else {
        let centerY = bottom + height/2
        bottom = centerY - width/2;
        top = centerY + width/2
      }
    }
    this.x.domain([left, right]);
    this.y.domain([bottom, top]);
  }

  update(duration = 500) {
    this.updateAxes(duration);
    this.updateImage(duration);
    // this.updateData();
  }

  updateAxes(duration = 500) {
    this.xAxis.transition().duration(duration).call(d3.axisBottom(this.x))
    this.yAxis.transition().duration(duration).call(d3.axisLeft(this.y))
  }

  updateImage(duration) {
    let left = this.x.domain()[0]
    let right = this.x.domain()[1]
    let bottom = this.y.domain()[0]
    let top = this.y.domain()[1]

    let newWidth = this.width * this.imageWidth / (right - left);
    let newLeft = -(left + 0.5) / this.imageWidth * newWidth

    let newHeight = this.height * this.imageHeight / (top - bottom)
    let newTop = (top + 0.5) / this.imageHeight * newHeight - newHeight

    this.SVG.select('#image')
      .transition().duration(duration)
      .attr("clip-path", "url(#clip)")
      .attr("x", newLeft)
      .attr("y", newTop)
      .attr("width", newWidth)
      .attr("height", newHeight)
  }
}
