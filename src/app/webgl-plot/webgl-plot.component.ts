import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { DataSourceService } from '../core/services';
import { interval } from 'rxjs';
import { FaceRectangle, LineRectangle, Rectangle } from './rectangle';

@Component({
  selector: 'app-webgl-plot',
  templateUrl: './webgl-plot.component.html',
  styleUrls: ['./webgl-plot.component.scss']
})
export class WebglPlotComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('webgl') webgl: ElementRef;
  @ViewChild('webglCanvas') webglCanvas: ElementRef;

  // all the three js variables:
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;

  imageGeometry: THREE.PlaneGeometry;
  imageTexture: THREE.Texture;
  imageMaterial: THREE.MeshBasicMaterial;

  zoomRectangle: Rectangle;

  // mouse position variables
  mouseXpx: number; // pixel value over canvas
  mouseYpx: number;
  mouseXFrac: number;  // fractional value over canvas
  mouseYFrac: number;
  mouseX: number; // mouse position in image dimensions
  mouseY: number;

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
    this.plotImage(this.dataService.createRandomImage(500, 500), 500, 500)
    // this.whiteNoiseTV();
  }

  initTHREE() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 1000);
    this.camera.position.z = 100;
    this.renderer = new THREE.WebGLRenderer({canvas: this.webglCanvas.nativeElement});

    this.initImagePlane()
    this.zoomRectangle = new Rectangle(this.scene, 0.1, 0.1, 0.4, 0.4);
    // this.zoomRectangle.hide();

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
    this.webglCanvas.nativeElement.addEventListener("mousemove", event => {
      let boundingRect = this.webglCanvas.nativeElement.getBoundingClientRect();

      this.mouseXpx = event.x - boundingRect.left;
      this.mouseYpx = boundingRect.bottom - event.y;

      this.mouseXFrac = this.mouseXpx / boundingRect.width;
      this.mouseYFrac = this.mouseYpx / boundingRect.height;

      this.mouseX = Math.floor(this.imageWidth * this.mouseXFrac);
      this.mouseY = Math.floor(this.imageHeight * this.mouseYFrac);
    })

    this.webglCanvas.nativeElement.addEventListener("wheel", event => {
      let currentWidth = this.camera.right - this.camera.left;
      let currentHeight = this.camera.top - this.camera.bottom;

      const factor = (1 + event.deltaY / 100 * 0.1);

      let newLeft = this.camera.left + this.mouseXFrac * currentWidth * (1 - factor);
      let newRight = this.camera.right - (1 - this.mouseXFrac) * currentWidth * (1 - factor);
      let newBottom = this.camera.bottom + this.mouseYFrac * currentHeight * (1 - factor);
      let newTop = this.camera.top - (1 - this.mouseYFrac) * currentHeight * (1 - factor);

      this.camera.left = newLeft;
      this.camera.right = newRight;
      this.camera.top = newTop;
      this.camera.bottom = newBottom;
      this.camera.updateProjectionMatrix()

      this.renderer.render(this.scene, this.camera);

    })

    this.initDragZoomListener()


  }

  initDragZoomListener() {
    let startX: number;
    let startY: number;
    this.webglCanvas.nativeElement.addEventListener('mousedown', event => {
      startX = this.camera.left + this.mouseXFrac * (this.camera.right - this.camera.left);
      startY = this.camera.bottom + this.mouseYFrac * (this.camera.top - this.camera.bottom);
      this.zoomRectangle.setBoundingRect(startX, startY, this.mouseXFrac, this.mouseYFrac);
      this.webglCanvas.nativeElement.addEventListener('mousemove', zoomDrag)
      // this.zoomRectangle.show();
      this.zoomRectangle.moveTo(startX, startY);
    })

    let zoomDrag = (event) => {
      this.zoomRectangle.setBoundingRect(
        startX, startY,
        this.camera.left + this.mouseXFrac * (this.camera.right - this.camera.left),
        this.camera.bottom + this.mouseYFrac * (this.camera.top - this.camera.bottom
        ));
      this.renderer.render(this.scene, this.camera);
    }

    window.addEventListener('mouseup', event => {
      // this.zoomRectangle.hide()
      this.renderer.render(this.scene, this.camera);
      this.webglCanvas.nativeElement.removeEventListener('mousemove', zoomDrag)
    })
  }

  plotImage(imageArray, width, height) {
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
