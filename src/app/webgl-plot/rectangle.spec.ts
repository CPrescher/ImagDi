import * as THREE from 'three';

import { FaceRectangle, LineRectangle, Rectangle } from './rectangle';

describe('FaceRectangle', () => {
  let scene: THREE.Scene;
  let rect: FaceRectangle;

  beforeEach(() => {
    scene = new THREE.Scene();
    rect = new FaceRectangle(scene);
  });

  it('should be added to scene immediately', () => {
    expect(scene.getObjectById(rect.id)).toBeTruthy();
  });

  it('should be removed from scene if hidden', () => {
    rect.hide();
    expect(scene.getObjectById(rect.id)).not.toBeTruthy();
  })

  it('should be added to scene after execute show', () => {
    rect.hide();
    rect.show();
    expect(scene.getObjectById(rect.id)).toBeTruthy();
  })

  it('should change position after move', () => {
    rect.moveTo(0.1, 0.3)
    expect(rect.geometry.vertices[0].x).toBe(0.1);
    expect(rect.geometry.vertices[0].y).toBe(0.3);
    expect(rect.geometry.vertices[2].x).toBe(0.1 + rect.width);
    expect(rect.geometry.vertices[2].y).toBe(0.3 + rect.height);
  })

  it('should change vertices after changing width', () => {
    rect.width = 0.5;
    expect(rect.geometry.vertices[2].x).toBe(rect.x + 0.5);
  })

  it('should change vertices after changing height', () => {
    rect.height = 0.5;
    expect(rect.geometry.vertices[2].y).toBe(rect.y + 0.5);
  })

  it('should change vertices according to bounding rectangle', () => {
    rect.setBoundingRect(0.1, 0.1, 0.4, 0.5);
    expect(rect.width - 0.3).toBeLessThan(1e-6);
    expect(rect.x).toBe(0.1);

    expect(rect.geometry.vertices[0].x).toBe(0.1);
    expect(rect.geometry.vertices[0].y).toBe(0.1);
  })
});

describe('LineRectangle', () => {
  let scene: THREE.Scene;
  let rect: LineRectangle;

  beforeEach(() => {
    scene = new THREE.Scene();
    rect = new LineRectangle(scene);
  });

  it('should be added to scene immediately', () => {
    expect(scene.getObjectById(rect.id)).toBeTruthy();
  });

  it('should initialize position correctly', () => {
    rect = new LineRectangle(scene, 0.1, 0.1, 0.3, 0.3);
    let position = rect.geometry.getAttribute('position');
    expect(position.array[0] - 0.1).toBeLessThan(1e-6);
    expect(position.array[1] - 0.1).toBeLessThan(1e-6);
    expect(position.array[3] - 0.4).toBeLessThan(1e-6);
  })

  it('should be removed from scene if hidden', () => {
    rect.hide();
    expect(scene.getObjectById(rect.id)).not.toBeTruthy();
  })

  it('should be added to scene after execute show', () => {
    rect.hide();
    rect.show();
    expect(scene.getObjectById(rect.id)).toBeTruthy();
  })

  it('should change position after move', () => {
    rect.moveTo(0.1, 0.3);
    let position = rect.geometry.getAttribute('position');
    expect(position.array[0] - 0.1).toBeLessThan(1e-6);
    expect(position.array[1] - 0.3).toBeLessThan(1e-6);
  })

  it('should change vertices after changing width', () => {
    rect.width = 0.5;
    let position = rect.geometry.getAttribute('position');
    expect(position.array[3] - 0.5).toBeLessThan(1e-6);
  })

  it('should change vertices after changing height', () => {
    rect.height = 0.5;
    let position = rect.geometry.getAttribute('position');
    expect(position.array[7] - 0.5).toBeLessThan(1e-6);
  })
});

describe('Rectangle', () => {
  let scene: THREE.Scene;
  let rect: Rectangle;

  beforeEach(() => {
    scene = new THREE.Scene();
    rect = new Rectangle(scene);
  });

  it('should be added to scene immediately', () => {
    expect(scene.getObjectById(rect.faceRectangle.id)).toBeTruthy();
    expect(scene.getObjectById(rect.lineRectangle.id)).toBeTruthy();
  });

  it('should remove face and line rectangles from scene if hidden', () => {
    rect.hide();
    expect(scene.getObjectById(rect.faceRectangle.id)).not.toBeTruthy();
    expect(scene.getObjectById(rect.lineRectangle.id)).not.toBeTruthy();
  })

  it('should show rectangles after call to hide and show', () => {
    rect.hide();
    rect.show()
    expect(scene.getObjectById(rect.faceRectangle.id)).toBeTruthy();
    expect(scene.getObjectById(rect.lineRectangle.id)).toBeTruthy();
  })

  it('should remove only face by hide when showLine=false', () => {
    rect.hide();
    expect(scene.getObjectById(rect.faceRectangle.id)).not.toBeTruthy();
  })

});
