import { Sprite, Texture, Ticker, TextStyle, Text } from 'pixi.js';
import { Collider, RigidBody } from '@dimforge/rapier2d-compat';
import { Container } from 'pixi.js';
import { PhysicsWorld } from '../PhysicsWorld';
import { IScene, Manager } from '../Manager';
import WorldColors from '../WorldColors';
import GUI from 'lil-gui';

interface IPhysicsObject {
  render: Sprite;
  physics: Collider;
}

export class PerformanceTest extends Container implements IScene {
  private textStyle: TextStyle;
  private emitCubicObject: boolean;
  private emitBallObject: boolean;
  private intervalTimeout: number;
  private GUI = new GUI();
  private counterText: Text;
  private physicsWorld: PhysicsWorld;
  private physicsObjects: IPhysicsObject[];
  private objectSize: number;
  private counter: number;
  private frameCounter: number = 0;
  private emitterLocation;
  private firstObjectCreated: boolean = false;

  constructor(objectSize: number) {
    super();
    this.isRenderGroup = true;
    this.emitterLocation = window.innerWidth / 2 - 100;
    this.emitBallObject = true;
    this.emitCubicObject = true;
    this.objectSize = objectSize;
    this.physicsWorld = Manager.physicsWorld; // Use Manager's physics world
    this.physicsObjects = [];
    this.intervalTimeout = 50;
    this.counter = 0;
    this.frameCounter = 0;
    this.textStyle = this.setTextStyle();
    this.counterText = this.setCounterText();
    this.setGUI();
  }

  private setTextStyle() {
    return new TextStyle({
      fill: WorldColors.C,
      fontFamily: 'ArcadeClassic',
      letterSpacing: 0,
      fontSize: 35,
    });
  }

  private setCounterText() {
    const t = new Text({
      text: this.counter,
      style: this.textStyle,
    });
    t.position.set(10, 10);
    t.zIndex = 100;
    return this.addChild(t);
  }

  private circlePhysicsSpriteFactory(x: number, y: number) {
    const sprite = new Sprite(Texture.from('green_body_circle'));
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(x, y);
    sprite.width = this.objectSize * Math.random() + 15;
    sprite.height = sprite.width;
    this.addChild(sprite);
    this.physicsObjects.push({
      render: sprite,
      physics: this.physicsWorld.createPhysicsSphere(x, y, sprite.width),
    });
    
    // Set up viewport following for the first object created
    this.setupViewportFollowingIfFirst(sprite);
  }

  private cubicPhysicsSpriteFactory(x: number, y: number) {
    const sprite = new Sprite(Texture.from('red_body_square'));
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(x, y);
    sprite.width = this.objectSize * Math.random() + 15;
    sprite.height = this.objectSize * Math.random() + 15;
    this.addChild(sprite);
    this.physicsObjects.push({
      render: sprite,
      physics: this.physicsWorld.createPhysicsRect(
        x,
        y,
        sprite.width,
        sprite.height
      ),
    });
    
    // Set up viewport following for the first object created
    this.setupViewportFollowingIfFirst(sprite);
  }
  
  private setupViewportFollowingIfFirst(sprite: Sprite): void {
    if (!this.firstObjectCreated) {
      this.firstObjectCreated = true;
      console.log("=== PERFORMANCE TEST: Setting up viewport ===");
      console.log("Emitter location:", this.emitterLocation);
      console.log("Window dimensions:", window.innerWidth, window.innerHeight);
      
      // Center the viewport on where objects are being created
      const centerX = this.emitterLocation + 100; // Center of emitter area
      const centerY = window.innerHeight / 2; // Middle of screen height
      
      console.log("Calculated center:", centerX, centerY);
      Manager.centerViewportAt(centerX, centerY);
      
      console.log("=== PERFORMANCE TEST: Viewport setup complete ===");
    }
  }
  
  update(t: Ticker): void {
    // Update physics objects positions
    this.physicsObjects.forEach((obj) => {
      const translation = obj.physics.translation();
      obj.render.position.set(translation.x, translation.y);
      obj.render.rotation = obj.physics.rotation();
    });

    // Create new objects based on intervalTimeout (convert to frame-based timing)
    this.frameCounter++;
    const framesToWait = Math.floor(this.intervalTimeout / 16.67); // Convert ms to frames (assuming 60fps)
    
    if (this.frameCounter >= framesToWait) {
      this.frameCounter = 0;
      
      let objectsAdded = 0;
      
      if (this.emitBallObject) {
        this.circlePhysicsSpriteFactory(
          Math.random() * 200 + this.emitterLocation,
          -Math.random() * 500
        );
        objectsAdded++;
      }
      
      if (this.emitCubicObject) {
        this.cubicPhysicsSpriteFactory(
          Math.random() * 200 + this.emitterLocation,
          -Math.random() * 500
        );
        objectsAdded++;
      }
      
      this.counter += objectsAdded;
      this.counterText.text = this.counter.toString();
    }
  }

  private resetWorld() {
    Manager.changeScene();
  }
  private setGUI() {
    const guiOptions = {
      objectSize: this.objectSize,
      intervalTimeout: this.intervalTimeout,
      emitterLocation: this.emitterLocation,
      emitRect: true,
      emitBall: true,
      reset: () => this.resetWorld(),
    };

    this.GUI.add(guiOptions, 'objectSize', 1, 100, 1);
    this.GUI.add(guiOptions, 'intervalTimeout', 1, 200, 1);
    this.GUI.add(guiOptions, 'emitRect');
    this.GUI.add(guiOptions, 'emitBall');

    this.GUI.add(
      guiOptions,
      'emitterLocation',
      150,
      window.innerWidth - 250,
      10
    );
    this.GUI.onChange((event) => {
      switch (event.property) {
        case 'emitterLocation':
          this.emitterLocation = event.value;
          break;
        case 'objectSize':
          this.objectSize = event.value;
          break;
        case 'emitRect':
          this.emitCubicObject = event.value;
          break;
        case 'emitBall':
          this.emitBallObject = event.value;
          break;
        case 'intervalTimeout': {
          this.intervalTimeout = event.value;
          // No need to restart interval, just update the property
          break;
        }
      }
    });
    this.GUI.add(guiOptions, 'reset');
  }

  IDestroy(): void {
    // Destroy GUI
    this.GUI.destroy();

    // Reset counter
    this.counter = 0;

    // Destroy visual objects (physics objects will be cleaned up by Manager's physics world reset)
    this.physicsObjects.forEach((obj) => {
      obj.render.destroy();
    });
    this.physicsObjects = [];
  }
}
