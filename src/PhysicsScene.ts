import { Sprite, Texture, Ticker, TextStyle, Text } from 'pixi.js';
import { RigidBody } from '@dimforge/rapier2d-compat';
import { Container } from 'pixi.js';
import { PhysicsWorld } from './PhysicsWorld';
import { Manager } from './Manager';
import WorldColors from './WorldColors';

interface IPhysicsObject {
  render: Sprite;
  physics: RigidBody;
}

export class PhysicsScene extends Container {
  private style = new TextStyle({
    fill: WorldColors.C,
    fontFamily: 'ArcadeClassic',
    letterSpacing: 6,
    padding: 0,
    fontSize: 20,
  });

  private counterText: Text;

  private physicsWorld: PhysicsWorld;
  private physicsObjects: IPhysicsObject[];
  private objectSize: number;
  private counter: number;

  constructor(objectSize: number) {
    super();
    this.physicsWorld = new PhysicsWorld(objectSize);
    this.physicsObjects = [];
    this.objectSize = objectSize;
    this.counter = 0;
    this.counterText = new Text({
      text: 'AMT OBJ: ' + this.counter,
      style: this.style,
    });
    this.counterText.position.set(10, 10);
    this.addChild(this.counterText);

    setInterval(() => {
      this.counter++;
      (this.counterText.text = 'AMT OBJ: ' + this.counter),
        this.createSquareSprite(
          Math.random() * 200 + window.innerWidth / 2 - 100,
          -Math.random() * 500
        );
    }, 50);

    this.createTicker();
  }

  private createSquareSprite(x: number, y: number) {
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
  }
  private createTicker() {
    Ticker.shared.add((t) => {
      this.physicsObjects.forEach((obj) => {
        obj.render.x = obj.physics.translation().x;
        obj.render.y = obj.physics.translation().y;
        obj.render.rotation = obj.physics.rotation();
      });
      this.physicsWorld.stepWorld(t.deltaTime * 0.2);
      Manager.getApp.render();
    });
  }

  private resetWorld() {
    this.physicsObjects.forEach((obj) => {
      obj.render.destroy();
    });
    this.physicsWorld = new PhysicsWorld(20);
    this.physicsObjects = [];
  }
}
