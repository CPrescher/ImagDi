import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { DataSourceService } from '../core/services';
import { interval } from 'rxjs';
import { FaceRectangle, LineRectangle, Rectangle } from './rectangle';
import Timeout = NodeJS.Timeout;

@Component({
  selector: 'app-webgl-plot',
  templateUrl: './webgl-plot.component.html',
  styleUrls: ['./webgl-plot.component.scss']
})
export class WebglPlotComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('webgl') webgl: ElementRef;
  @ViewChild('webglCanvas') webglCanvas: ElementRef;
  @ViewChild('canvasContainer') canvasContainer: ElementRef;

  // all the three js variables:
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;

  imageGeometry: THREE.PlaneGeometry;
  imageTexture: THREE.Texture;
  imageMaterial: THREE.MeshBasicMaterial;

  zoomRectangle: Rectangle;
  fixedAspectRatio = false;

  // mouse position variables
  mouseXpx: number; // screen pixel value over canvas
  mouseYpx: number;
  mouseXFrac: number;  // fractional value over canvas
  mouseYFrac: number;
  mouseX: number; // mouse position in image dimensions in px
  mouseY: number;
  cameraXFrac: number;
  cameraYFrac: number;

  // image variables
  image;
  imageWidth: number = 1;
  imageHeight: number = 1;

  // subscribe pointer
  sub;

  constructor(private dataService: DataSourceService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.initTHREE();
    this.initMouseInteraction();
    this.initResizeHandling();
    this.plotImage(this.dataService.createRandomImage(2048, 2048), 2048, 2048)
    // this.whiteNoiseTV();
  }

  initTHREE() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 100000);
    this.camera.position.z = 10000;
    this.renderer = new THREE.WebGLRenderer({canvas: this.webglCanvas.nativeElement});
    // this.renderer.setSize(this.webglCanvas.nativeElement.width, this.webglCanvas.nativeElement.height);

    this.initImagePlane()
    this.zoomRectangle = new Rectangle(this.scene, 0.1, 0.1, 0.4, 0.4);
    this.zoomRectangle.hide();

    this.resize();
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

  initMouseInteraction() {
    this.initMousePositionListener();
    this.initWheelZoomListener();
    this.initDragZoomListener();
    this.initRightClickInteraction();

  }

  initMousePositionListener() {
    window.addEventListener("mousemove", (event: MouseEvent) => {
      let boundingRect = this.webglCanvas.nativeElement.getBoundingClientRect();

      this.mouseXpx = event.x - boundingRect.left;
      this.mouseYpx = boundingRect.bottom - event.y;

      this.mouseXFrac = this.mouseXpx / boundingRect.width;
      this.mouseYFrac = this.mouseYpx / boundingRect.height;

      const cameraWidth = this.camera.right - this.camera.left;
      const cameraHeight = this.camera.top - this.camera.bottom;

      this.cameraXFrac = this.camera.left + this.mouseXFrac * cameraWidth;
      this.cameraYFrac = this.camera.bottom + this.mouseYFrac * cameraHeight;

      if (this.isInsideBoundingRect(event.x, event.y, boundingRect)) {
        this.mouseX = Math.floor(this.camera.left * this.imageWidth + cameraWidth * this.imageWidth * this.mouseXFrac);
        this.mouseY = Math.floor(this.camera.bottom * this.imageHeight + cameraHeight * this.imageHeight * this.mouseYFrac);
      }
    })
  }

  initWheelZoomListener() {
    this.webglCanvas.nativeElement.addEventListener("wheel", (event: WheelEvent) => {
      this.zoom(1 + event.deltaY / 100 * 0.1)
    })
  }

  initDragZoomListener() {
    let startX: number;
    let startY: number;
    let dragZoom = false;

    this.webglCanvas.nativeElement.addEventListener('mousedown', event => {
      if (event.button != 0) { // left click
        return
      }

      startX = this.camera.left + this.mouseXFrac * (this.camera.right - this.camera.left);
      startY = this.camera.bottom + this.mouseYFrac * (this.camera.top - this.camera.bottom);

      this.zoomRectangle.show();
      this.zoomRectangle.moveTo(startX, startY);
      this.zoomRectangle.width = 0;
      this.zoomRectangle.height = 0;

      this.webglCanvas.nativeElement.addEventListener('mousemove', zoomDrag)
      dragZoom = true;
    })

    let zoomDrag = (event: MouseEvent) => {
      this.zoomRectangle.setBoundingRect(
        startX, startY,
        this.camera.left + this.mouseXFrac * (this.camera.right - this.camera.left),
        this.camera.bottom + this.mouseYFrac * (this.camera.top - this.camera.bottom)
      );
      this.renderer.render(this.scene, this.camera);
    }

    window.addEventListener('mouseup', (event: MouseEvent) => {
      if (!dragZoom || event.button != 0) { // left click
        return
      }

      // only zoom in when rectangle is large enough -> this prevents also the the normal left click interactions
      // from zooming in...
      if (this.zoomRectangle.width > 0.001 * Math.abs(this.camera.right - this.camera.left) &&
        this.zoomRectangle.height > 0.001 * Math.abs(this.camera.top - this.camera.bottom)) {
        const zoomRectBoundingRect = this.zoomRectangle.boundingRect;
        this.updateCameraBoundingRect(
          zoomRectBoundingRect.left,
          zoomRectBoundingRect.right,
          zoomRectBoundingRect.bottom,
          zoomRectBoundingRect.top
        );
      }

      this.webglCanvas.nativeElement.removeEventListener('mousemove', zoomDrag)
      this.zoomRectangle.hide()
      this.renderer.render(this.scene, this.camera);
    })
  }

  initRightClickInteraction() {
    let dragging = false;
    let clickX: number;
    let clickY: number;
    let cameraLeftStart: number;
    let cameraRightStart: number;
    let cameraBottomStart: number;
    let cameraTopStart: number;


    let preventDefault = (event: MouseEvent) => {
      event.preventDefault();
    }

    //prevent context menu in Canvas
    this.webglCanvas.nativeElement.addEventListener('contextmenu', preventDefault);

    // single right click action, which should be prevented in case there is a double click
    this.webglCanvas.nativeElement.addEventListener('mousedown', (event: MouseEvent) => {
      if (event.button === 2) { // only right click
        if (event.detail === 1) { // only for single clicks
          window.addEventListener('mousemove', moveDrag);
          window.addEventListener('contextmenu', preventDefault);
          clickX = this.mouseXFrac;
          clickY = this.mouseYFrac;
          cameraLeftStart = this.camera.left;
          cameraRightStart = this.camera.right;
          cameraBottomStart = this.camera.bottom;
          cameraTopStart = this.camera.top;
        }
      }
    });

    let moveDrag = (event: MouseEvent) => {
      dragging = true;
      const cameraWidth = this.camera.right - this.camera.left;
      const cameraHeight = this.camera.top - this.camera.bottom;

      const deltaX = (this.mouseXFrac - clickX) * cameraWidth;
      const deltaY = (this.mouseYFrac - clickY) * cameraHeight;

      this.updateCameraBoundingRect(
        cameraLeftStart - deltaX,
        cameraRightStart - deltaX,
        cameraBottomStart - deltaY,
        cameraTopStart - deltaY
      );
    };

    window.addEventListener('mouseup', (event: MouseEvent) => {
      if (event.button === 2) { // only right click
        if (event.detail === 2) { // single click
          if (!dragging) {
            this.updateCameraBoundingRect(0, 1, 0, 1);
          }
        }
        window.removeEventListener('mousemove', moveDrag);
        dragging = false;
      }
    });

    this.webglCanvas.nativeElement.addEventListener('mouseup', (event: MouseEvent) => {
      if (event.button === 2) { // only right click
        if (event.detail === 1) { // single click
          if (!dragging) {
            this.zoom(1.4);
          }
          window.removeEventListener('mousemove', moveDrag);
          dragging = false;
        }
      }
    });

    window.addEventListener('click', () => {
      window.removeEventListener('contextmenu', preventDefault);
    })
  }

  initResizeHandling() {
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    const boundingRect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;
    this.renderer.setSize(20,20);
    this.renderer.setSize(width, height);
    this.renderer.render(this.scene, this.camera);

  }

  zoom(factor: number) {
    let currentWidth = this.camera.right - this.camera.left;
    let currentHeight = this.camera.top - this.camera.bottom;
    let newLeft = this.camera.left + this.mouseXFrac * currentWidth * (1 - factor);
    let newRight = this.camera.right - (1 - this.mouseXFrac) * currentWidth * (1 - factor);
    let newBottom = this.camera.bottom + this.mouseYFrac * currentHeight * (1 - factor);
    let newTop = this.camera.top - (1 - this.mouseYFrac) * currentHeight * (1 - factor);
    this.updateCameraBoundingRect(newLeft, newRight, newBottom, newTop);
  }

  updateCameraBoundingRect(left, right, bottom, top) {
    this.camera.left = left;
    this.camera.right = right;
    this.camera.top = top;
    this.camera.bottom = bottom;
    this.camera.updateProjectionMatrix()
    this.renderer.render(this.scene, this.camera);
  }

  isInsideBoundingRect(x, y, boundingRect) {
    return x > boundingRect.x && x < boundingRect.x + boundingRect.width &&
      y > boundingRect.y && y < boundingRect.y + boundingRect.height;
  }

  plotImage(imageArray: THREE.TypedArray, width: number, height: number) {
    this.imageTexture.dispose();

    this.imageTexture = new THREE.DataTexture(imageArray, width, height, THREE.RGBFormat);
    this.imageMaterial.map = this.imageTexture;
    this.renderer.render(this.scene, this.camera);

    this.imageWidth = width;
    this.imageHeight = height;
  }

  whiteNoiseTV() {
    let width = 2048;
    let height = width;

    const num_images = 10;

    let random_images = new Array(num_images);
    for (let i = 0; i < num_images; i++) {
      random_images[i] = this.dataService.createRandomImage(width, height)
    }

    this.sub = interval(1).subscribe(() => {
      this.plotImage(random_images[Math.floor(Math.random() * num_images)], width, height)
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
