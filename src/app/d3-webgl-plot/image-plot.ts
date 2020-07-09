import * as d3 from 'd3';
import * as THREE from 'three';

import Timeout = NodeJS.Timeout;
import { ImageHistogram } from './image-histogram';

export class ImagePlot {
  imageWidth = 256;
  imageHeight = 256;

  margin = {
    top: 10, right: 30, bottom: 30, left: 60
  }
  width = 400;
  height = 400;
  fixedAspectRatio = true;

  colorScale;


  SVG;
  x;
  xAxis;
  y;
  yAxis;

  mouseX: number;
  mouseY: number;

  private histogram

  private clip;

  private canvas: any;
  private canvasContext: any;
  private webGlCanvas;
  private foreignObject: any;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;

  private imageGeometry: THREE.PlaneGeometry;
  private imageTexture: THREE.Texture;
  private imageMaterial: THREE.MeshBasicMaterial;

  private brushContext;

  constructor(selector: string) {
    this.initImagePlot(selector);
    this.histogram = new ImageHistogram(selector);
    this.colorScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([0, 65000])
  }

  initImagePlot(selector) {
    this.initSVG(selector);
    this.initAxes();
    this.initImage();
    this.initClip();
    this.initBrush();
    this.initMousePosition();
    this.initWheel();
    this.initRightClickBehavior();

  }

  initSVG(selector: string) {
    this.SVG = d3.select(selector)
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

  initImage() {
    this.initCanvas();
    this.initTHREE();
  }

  initCanvas() {
    this.foreignObject = this.SVG.append('foreignObject')
      .attr("clip-path", "url(#clip)")
      .style('position', 'relative')
      .style('z-index', "-1")
      .attr("height", this.width)
      .attr("width", this.height)
      .attr("x", 0)
      .attr("y", 0)

    this.webGlCanvas = this.foreignObject
      .append("xhtml:canvas")
      .attr("id", 'webglCanvas')
      .attr("height", this.width)
      .attr("width", this.height)
      .attr("x", 0)
      .attr("y", 0)

    this.canvas = document.getElementById('webglCanvas')
    this.canvasContext = this.canvas.getContext('webgl');

  }

  initTHREE() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 100000);
    this.camera.position.z = 10000;
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});

    this.initImagePlane()
    this.renderer.render(this.scene, this.camera);
  }

  initImagePlane() {
    this.imageGeometry = new THREE.PlaneGeometry(1, 1);
    this.imageTexture = new THREE.DataTexture(new Uint8Array([0, 0, 0]), 1, 1, THREE.RGBFormat)
    this.imageMaterial = new THREE.MeshBasicMaterial({map: this.imageTexture});
    let plane = new THREE.Mesh(this.imageGeometry, this.imageMaterial);
    plane.position.x = 0.5;
    plane.position.y = 0.5;
    this.scene.add(plane);
  }

  initBrush() {
    this.brushContext = this.SVG.append("g")
      .attr("id", "brushContext")
      .attr("class", "brushContext")

    let updateChartBrush = () => {
      let extent = d3.event.selection
      if (extent) {
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

  initRightClickBehavior() {
    let dragMouseStartX: number;
    let dragMouseStartY: number;
    let domainXDragStart: Array<number>;
    let domainYDragStart: Array<number>;
    let dragging = false;

    let rightDragStart = () => {
      let event = d3.event;
      if (event.button === 2) { //only for right click
        if (event.detail === 1) { // only for single click
          let brushContext = document.getElementById("brushContext");
          dragMouseStartX = this.mouseX;
          dragMouseStartY = this.mouseY;
          domainXDragStart = this.x.domain();
          domainYDragStart = this.y.domain();
          brushContext.addEventListener("mousemove", rightDragMove);
        }// only for single clicks
      }
    }

    let lastUpdate = Date.now();
    let fps = 30
    let frameTime = 1000 / fps;

    let rightDragMove = (event) => {
      dragging = true;

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

      this.updateDomain(left - deltaX, right - deltaX, bottom - deltaY, top - deltaY);
      this.update(0);

      lastUpdate = Date.now();
    }

    let rightDragStop = () => {
      let event = d3.event;
      if (event.button === 2) { //only for right click
        if (!dragging) {
          if (event.detail === 1) { // single click
            this.zoom(1.7);
          } else { //double click
            this.updateDomain(0, this.imageWidth, 0, this.imageHeight);
            this.update();
          }
        }
        let brushContext = document.getElementById("brushContext");
        brushContext.removeEventListener("mousemove", rightDragMove)
      }
      dragging = false;
    }

    this.brushContext.on("mousedown", rightDragStart)
    this.brushContext.on("mouseup", rightDragStop)
  }

  zoom(factor: number) {
    let currentWidth = this.x.domain()[1] - this.x.domain()[0]
    let currentHeight = this.y.domain()[1] - this.y.domain()[0]
    let mouseXFrac = (this.mouseX - this.x.domain()[0]) / currentWidth
    let mouseYFrac = (this.mouseY - this.y.domain()[0]) / currentHeight
    let newLeft = this.x.domain()[0] - mouseXFrac * currentWidth * factor;
    let newRight = this.x.domain()[1] + (1 - mouseXFrac) * currentWidth * factor;
    let newBottom = this.y.domain()[0] - mouseYFrac * currentHeight * factor;
    let newTop = this.y.domain()[1] + (1 - mouseYFrac) * currentHeight * factor;
    this.updateDomain(newLeft, newRight, newBottom, newTop);
    this.update();
  }

  updateDomain(left: number, right: number, bottom: number, top: number) {
    if (this.fixedAspectRatio) {
      let width = right - left;
      let height = top - bottom;

      if (width < height) {
        let centerX = left + width / 2
        left = centerX - height / 2
        right = centerX + height / 2
      } else {
        let centerY = bottom + height / 2
        bottom = centerY - width / 2;
        top = centerY + width / 2
      }
    }
    this.x.domain([left, right]);
    this.y.domain([bottom, top]);
  }

  update(duration = 500) {
    this.updateAxes(duration);
    this.updateCamera();
    // this.updateData();
  }

  updateAxes(duration = 500) {
    this.xAxis.transition().duration(duration).call(d3.axisBottom(this.x))
    this.yAxis.transition().duration(duration).call(d3.axisLeft(this.y))
  }

  updateCamera() {
    let left = this.x.domain()[0]
    let right = this.x.domain()[1]
    let bottom = this.y.domain()[0]
    let top = this.y.domain()[1]

    this.camera.left = left / this.imageWidth
    this.camera.right = right / this.imageWidth
    this.camera.bottom = bottom / this.imageHeight
    this.camera.top = top / this.imageHeight

    this.camera.updateProjectionMatrix()
    this.renderer.render(this.scene, this.camera)

  }

  plotImage(imageArray, width, height) {
    let colorImageArray = new Uint8ClampedArray(imageArray.length * 3)
    let pos = 0;
    let c: any;
    for (let i = 0; i < imageArray.length; i++) {
      c = this.hexToRgb(this.colorScale(imageArray[i]))
      pos = i * 3;
      colorImageArray[pos] = c[0];//#[];
      colorImageArray[pos + 1] = c[1]//[1]
      colorImageArray[pos + 2] = c[2]//[2]
    }
    this._updateTexture(colorImageArray, width, height);
  }

  _updateTexture(imageArray: THREE.TypedArray, width: number, height: number) {
    this.imageTexture.dispose();

    this.imageTexture = new THREE.DataTexture(imageArray, width, height, THREE.RGBFormat);
    this.imageMaterial.map = this.imageTexture;

    this.imageWidth = width;
    this.imageHeight = height;
    this.renderer.render(this.scene, this.camera);

    this.canvasContext = this.canvas.getContext('webgl');
  }


  hexToRgb(hex) {
    let bigint = parseInt(hex.substr(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b]
  }
}
