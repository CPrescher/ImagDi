import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { DataSourceService } from '../core/services';
import { interval } from 'rxjs';

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
  geometry: THREE.BoxGeometry;
  texture: THREE.Texture;
  material: THREE.MeshBasicMaterial;




  image;
  sub;

  constructor(private dataService: DataSourceService) {
  }

  imgWidth = 2048;
  imgHeight = 2048;

  ngOnInit(): void {
    this.image = this.dataService.createDummyImage(this.imgWidth, this.imgHeight);
  }

  ngAfterViewInit() {
    this.initTHREE();

    let width = 2048;
    let height = width;

    const num_images = 10;

    let random_images = new Array(num_images);
    for (let i=0; i<num_images; i++) {
      random_images[i] = this.dataService.createRandomImage(width, height)
    }

    this.sub = interval(1).subscribe(() => {
      this.plotImage(random_images[Math.floor(Math.random()*num_images)], width, height)
    })
  }

  initTHREE() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, 1, 1000);
    this.renderer = new THREE.WebGLRenderer({canvas: this.webglCanvas.nativeElement});
    this.geometry = new THREE.BoxGeometry();
    this.texture = new THREE.DataTexture(this.image, this.imgWidth, this.imgHeight, THREE.RGBFormat)
    this.material = new THREE.MeshBasicMaterial({map: this.texture});
    let cube = new THREE.Mesh(this.geometry, this.material);
    cube.position.x = 0.5;
    cube.position.y = 0.5;
    this.scene.add(cube);
    this.camera.position.z = 100;
    this.renderer.render(this.scene, this.camera);
  }

  plotImage(imageArray, width, height){
    this.texture.dispose();
    this.texture = new THREE.DataTexture(imageArray, width, height, THREE.RGBFormat);
    this.material.map = this.texture;
    this.renderer.render(this.scene, this.camera);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
