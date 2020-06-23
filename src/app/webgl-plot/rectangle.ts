import * as THREE from 'three';

export class BaseRectangle {
  mesh: THREE.Object3D;
  hidden = false;

  constructor(public scene: THREE.Scene, x, y, width, height) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  _width: number;

  get width() {
    return this._width;
  }

  set width(val: number) {
    this._width = val;
    this._updateGeometry();
  }

  _height: number;

  get height() {
    return this._height;
  }

  set height(val) {
    this._height = val;
    this._updateGeometry();
  }

  _x: number;

  get x() {
    return this._x;
  }

  set x(val) {
    this._x = val;
    this._updateGeometry();
  }

  _y: number;

  get y() {
    return this._y;
  }

  set y(val) {
    this._y = val;
    this._updateGeometry();
  }

  get boundingRect() {
    return {
      left: this.x,
      right: this.x + this.width,
      bottom: this.y,
      top: this.y + this.height,
    };
  }

  moveTo(x: number, y: number) {
    this._x = x;
    this._y = y;
    this._updateGeometry();
  }

  setBoundingRect(x1, y1, x2, y2) {
    if (x2 > x1) {
      this._x = x1;
    } else {
      this._x = x2;
    }
    if (y2 > y1) {
      this._y = y1;
    } else {
      this._y = y2;
    }
    this._width = Math.abs(x2 - x1);
    this._height = Math.abs(y2 - y1);
    this._updateGeometry()
  }

  _updateGeometry() {

  }


  show() {
    if (this.hidden) {
      this.scene.add(this.mesh);
      this.hidden = false;
    }
  }

  hide() {
    if (!this.hidden) {
      this.scene.remove(this.mesh);
      this.hidden = true;
    }
  }

}


export class Rectangle extends BaseRectangle {
  faceRectangle: FaceRectangle;
  lineRectangle: LineRectangle;

  constructor(scene: THREE.Scene, x = 0, y = 0, width = 0.1, height = 0.1) {
    super(scene, x, y, width, height)
    this.faceRectangle = new FaceRectangle(scene, x, y, width, height);
    this.lineRectangle = new LineRectangle(scene, x, y, width, height);
  }

  get width() {
    return this._width;
  }

  set width(val) {
    this._width = val;
    this.faceRectangle.width = val;
    this.lineRectangle.width = val;
  }

  get height() {
    return this._height;
  }

  set height(val) {
    this._height = val;
    this.faceRectangle.height = val;
    this.lineRectangle.height = val;
  }

  set x(val) {
    this._x = val;
    this.faceRectangle.x = val;
    this.lineRectangle.x = val;
  }

  set y(val) {
    this._y = val;
    this.faceRectangle.y = val;
    this.lineRectangle.y = val;
  }

  moveTo(x, y) {
    this.faceRectangle.moveTo(x, y);
    this.lineRectangle.moveTo(x, y);
    this._x = this.faceRectangle.x;
    this._y = this.faceRectangle.y
  }

  setBoundingRect(x1, y1, x2, y2) {
    this.faceRectangle.setBoundingRect(x1, y1, x2, y2);
    this.lineRectangle.setBoundingRect(x1, y1, x2, y2);
    this._width = this.faceRectangle.width;
    this._height = this.faceRectangle.height;
  }

  get boundingRect() {
    return this.faceRectangle.boundingRect;
  }

  hide() {
    this.faceRectangle.hide();
    this.lineRectangle.hide();
  }

  show() {
    this.faceRectangle.show();
    this.lineRectangle.show();
  }
}


export class FaceRectangle extends BaseRectangle {
  geometry: THREE.Geometry;
  material: THREE.MeshBasicMaterial;

  hidden: boolean;

  constructor(scene: THREE.Scene, x = 0, y = 0, width = 0.1, height = 0.1) {
    super(scene, x, y, width, height);

    this.geometry = new THREE.Geometry()
    this.geometry.vertices.push(new THREE.Vector3(this.x, this.y, 0.1))
    this.geometry.vertices.push(new THREE.Vector3(this.x + this._width, this.y, 0.1))
    this.geometry.vertices.push(new THREE.Vector3(this.x + this._width, this.y + this._height, 0.1))
    this.geometry.vertices.push(new THREE.Vector3(this.x, this.y + this._height, 0.1))
    this.geometry.faces.push(new THREE.Face3(0, 1, 2))
    this.geometry.faces.push(new THREE.Face3(0, 2, 3))

    this.material = new THREE.MeshBasicMaterial({color: 0xDD0000, transparent: true, opacity: 0.4})
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.hidden = false;
  }

  get id() {
    return this.mesh.id;
  }

  _updateGeometry() {
    this.geometry.vertices[0].set(this.x, this.y, 0.1);
    this.geometry.vertices[1].set(this.x + this._width, this.y, 0.1);
    this.geometry.vertices[2].set(this.x + this._width, this.y + this._height, 0.1);
    this.geometry.vertices[3].set(this.x, this.y + this._height, 0.1);
    this.geometry.verticesNeedUpdate = true;
  }
}

export class LineRectangle extends BaseRectangle {
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  mesh: THREE.Line;

  constructor(scene: THREE.Scene, x = 0, y = 0, width = 0.1, height = 0.1) {
    super(scene, x, y, width, height);
    this.geometry = new THREE.BufferGeometry()
    this._updateGeometry();
    this.material = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 0.5})
    this.mesh = new THREE.Line(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.hidden = false;
  }

  get id() {
    return this.mesh.id;
  }

  _updateGeometry() {
    let positions = [
      this.x, this.y, 0.2,
      this.x + this.width, this.y, 0.2,
      this.x + this.width, this.y + this.height, 0.2,
      this.x, this.y + this.height, 0.2,
      this.x, this.y, 0.2
    ]
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  }
}
