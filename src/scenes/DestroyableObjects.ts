import {
  Sprite,
  Texture,
  Ticker,
  TextStyle,
  Text,
  DestroyOptions,
} from 'pixi.js';
import { RigidBody, Collider } from '@dimforge/rapier2d-compat';
import { Container } from 'pixi.js';
import { PhysicsWorld } from '../PhysicsWorld';
import { IScene, Manager } from '../Manager';
import WorldColors from '../WorldColors';
import GUI from 'lil-gui';

interface IPhysicsObject {
  render: Sprite;
  physics: Collider;
}

interface IStaticPhysicsObject {
  render: Sprite;
  physics: Collider;
}

export class DestroyableObjects extends Container implements IScene {
  private textStyle: TextStyle;
  private emitCubicObject: boolean;
  private emitBallObject: boolean;
  private intervalTimeout: number;
  private GUI = new GUI();
  private counterText: Text;
  private physicsWorld: PhysicsWorld;
  private physicsObjects: IPhysicsObject[];
  private staticPhysicObjects: IStaticPhysicsObject[];
  private objectSize: number;
  private counter: number;
  private interval: ReturnType<typeof setInterval>;
  private emitterLocation;

  constructor(objectSize: number) {
    super();
    this.isRenderGroup = true;
    this.emitterLocation = window.innerWidth / 2 - 100;
    this.emitBallObject = true;
    this.emitCubicObject = true;
    this.objectSize = objectSize;
    this.physicsWorld = new PhysicsWorld();
    this.physicsObjects = [];
    this.staticPhysicObjects = [];
    this.intervalTimeout = 1000;
    this.counter = 0;
    this.textStyle = this.setTextStyle();
    this.counterText = this.setCounterText();
    this.createTicker();
    this.setGUI();
    this.interval = this.startInterval();
    for (let i = 0; i < 42; i++) {
      for (let j = 0; j < 42; j++) {
        let offset = j % 2 == 0 ? window.innerWidth / 80 : 0;

        this.cubicStaticPhysicsFactory(
          (i * window.innerWidth) / 40 + offset,
          (j * innerHeight) / 40
        );
      }
    }
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
    sprite.width = this.objectSize * Math.random() + 5;
    sprite.height = sprite.width;
    this.addChild(sprite);
    this.physicsObjects.push({
      render: sprite,
      physics: this.physicsWorld.createPhysicsSphere(x, y, sprite.width),
    });
  }

  private cubicStaticPhysicsFactory(x: number, y: number) {
    const sprite = new Sprite(Texture.from('red_body_square'));
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(x, y);
    sprite.width = window.innerWidth / 40;
    sprite.height = window.innerHeight / 40;
    this.addChild(sprite);
    this.staticPhysicObjects.push({
      render: sprite,
      physics: this.physicsWorld.createStaticPhysicsRect(
        x,
        y,
        sprite.width,
        sprite.height
      ),
    });
  }

  private cubicPhysicsSpriteFactory(x: number, y: number) {
    const sprite = new Sprite(Texture.from('red_body_square'));
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(x, y);
    sprite.width = this.objectSize * Math.random() + 5;
    sprite.height = this.objectSize * Math.random() + 5;
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
  }
  private createTicker() {
    Ticker.shared.add((t) => {
      this.physicsObjects.forEach((obj) => {
        this.staticPhysicObjects.forEach((staticP) => {
          this.physicsWorld.World?.contactPair(
            obj.physics,
            staticP.physics,
            () => {
              staticP.render.alpha = 0;
              setTimeout(() => {
                staticP.physics.setEnabled(false);
              }, 20);
            }
          );
        });

        obj.render.x = obj.physics.translation().x;
        obj.render.y = obj.physics.translation().y;
        obj.render.rotation = obj.physics.rotation();
      });
      this.physicsWorld.stepWorld(t.deltaTime * 0.2);
      Manager.getApp.render();
    });
  }

  private resetWorld() {
    Manager.changeScene();
  }

  private startInterval() {
    return setInterval(() => {
      let objectsAdded = 2;
      (this.counterText.text = this.counter),
        this.emitBallObject
          ? this.circlePhysicsSpriteFactory(
              Math.random() * window.innerWidth,
              -Math.random() * 500
            )
          : objectsAdded--;
      this.emitCubicObject
        ? this.cubicPhysicsSpriteFactory(
            Math.random() * window.innerWidth,
            -Math.random() * 500
          )
        : objectsAdded--;
      this.counter += objectsAdded;
    }, this.intervalTimeout);
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
    this.GUI.add(guiOptions, 'intervalTimeout', 1, 2000, 1);
    this.GUI.add(guiOptions, 'emitRect');
    this.GUI.add(guiOptions, 'emitBall');

    this.GUI.onChange((event) => {
      switch (event.property) {
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
          clearInterval(this.interval);
          this.interval = this.startInterval();
          break;
        }
      }
    });
    this.GUI.add(guiOptions, 'reset');
  }

  IDestroy(): void {
    this.GUI.destroy();
    this.counter = 0;
    this.physicsObjects.forEach((obj) => {
      obj.render.destroy();
    });
    this.staticPhysicObjects.forEach((obj) => {
      obj.render.destroy();
    });

    this.physicsObjects = [];
    this.staticPhysicObjects = [];
    this.physicsWorld.World?.free();
    this.physicsWorld = new PhysicsWorld();
  }
}
