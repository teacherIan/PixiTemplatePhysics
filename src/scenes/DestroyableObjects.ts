import { Sprite, Texture, Ticker, TextStyle, Text } from 'pixi.js';
import { Collider } from '@dimforge/rapier2d-compat';
import { Container } from 'pixi.js';
import { IScene, Manager } from '../Manager';
import WorldColors from '../WorldColors';
import GUI from 'lil-gui';

export class DestroyableObjects extends Container implements IScene {
  private addObjectCountdown: number;
  private textStyle: TextStyle;
  private emitCubicObject: boolean;
  private emitBallObject: boolean;
  private intervalTimeout: number;
  private GUI = new GUI();
  private counterText: Text;
  private objectSize: number;
  private counter: number;
  private emitterLocation;
  //sprites, physicsObjects,and intervals need to be
  //explicitly destroyed when ending the scene
  private dynamicSprites: Array<Sprite>;
  private staticSprites: Array<Sprite>;
  private dynamicColliders: Array<Collider>;
  private staticColliders: Array<Collider>;

  constructor(objectSize: number) {
    super();
    this.addObjectCountdown = 0;
    this.dynamicColliders = [];
    this.staticColliders = [];
    this.dynamicSprites = [];
    this.staticSprites = [];
    this.emitterLocation = window.innerWidth / 2 - 100;
    this.emitBallObject = true;
    this.emitCubicObject = true;
    this.objectSize = objectSize;
    this.intervalTimeout = 1000;
    this.counter = 0;
    this.textStyle = this.setTextStyle();
    this.counterText = this.setCounterText();
    this.setGUI();

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
    this.dynamicSprites.push(sprite);
    this.dynamicColliders.push(
      Manager.getPhysicsWorld.createPhysicsSphere(x, y, sprite.width)
    );
    this.addChild(sprite);
  }

  private cubicStaticPhysicsFactory(x: number, y: number) {
    const sprite = new Sprite(Texture.from('red_body_square'));
    sprite.tint = Math.random() * 200000;
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(x, y);
    sprite.width = window.innerWidth / 40;
    sprite.height = window.innerHeight / 40;

    this.staticSprites.push(sprite);
    this.staticColliders.push(
      Manager.getPhysicsWorld.createStaticPhysicsRect(
        x,
        y,
        sprite.width,
        sprite.height
      )
    );
    this.addChild(sprite);
  }

  private cubicPhysicsSpriteFactory(x: number, y: number) {
    const sprite = new Sprite(Texture.from('red_body_square'));
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(x, y);
    sprite.width = this.objectSize * Math.random() + 5;
    sprite.height = this.objectSize * Math.random() + 5;
    this.dynamicSprites.push(sprite);
    this.dynamicColliders.push(
      Manager.getPhysicsWorld.createPhysicsRect(
        x,
        y,
        sprite.width,
        sprite.height
      )
    );
    this.addChild(sprite);
  }

  private resetWorld() {
    Manager.changeScene();
  }

  private addObject() {
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
      }
    });
    this.GUI.add(guiOptions, 'reset');
  }

  update(t: Ticker): void {
    this.addObjectCountdown++;
    if (this.addObjectCountdown > 100) {
      this.addObjectCountdown = 0;
      this.addObject();
    }

    this.dynamicColliders.forEach((dynamicCollider, dynamicColliderIndex) => {
      //find contacts between static objects and non-static objects
      this.staticColliders.forEach((staticCollider, staticColliderIndex) => {
        Manager.getPhysicsWorld.World?.contactPair(
          staticCollider,
          dynamicCollider,
          () => {
            this.staticSprites[staticColliderIndex].alpha = 0;
            setTimeout(() => {
              staticCollider.setEnabled(false);
            }, 0);
          }
        );
      });

      this.dynamicSprites[dynamicColliderIndex].position =
        dynamicCollider.translation();

      this.dynamicSprites[dynamicColliderIndex].rotation =
        dynamicCollider.rotation();
    });

    Manager.getPhysicsWorld.stepWorld(t.deltaTime * 0.2);
    Manager.getApp.render();
  }

  IDestroy(): void {
    this.GUI.destroy();
    this.dynamicSprites.forEach((sprite) => {
      sprite.destroy();
    });
    this.staticSprites.forEach((sprite) => {
      sprite.destroy();
    });

    this.staticSprites = [];
    this.dynamicSprites = [];
    //destroy all object besides walls
    let b = Manager.getPhysicsWorld.World?.bodies.getAll();
    b?.forEach((body, index) => {
      if (index > 2) Manager.getPhysicsWorld.World?.removeRigidBody(body);
    });

    this.dynamicColliders = [];
    this.staticColliders = [];
  }
}
