import { Container, Ticker, Sprite, Texture } from 'pixi.js';
import { IScene } from '../Manager';
import { Collider } from '@dimforge/rapier2d-compat';
import { Manager } from '../Manager';
import WorldColors from '../WorldColors';
import { TextStyle, Text } from 'pixi.js';

export default class Sand extends Container implements IScene {
  private sprites: Array<Sprite>;
  private colliders: Array<Collider>;
  private objectSize: number;
  private amount: number;

  constructor() {
    super();
    this.amount = 4000;
    this.objectSize = 35;
    this.sprites = [];
    this.colliders = [];
    this.setCounterText();

    for (let i = 0; i < this.amount; i++) {
      this.circlePhysicsSpriteFactory(
        Math.random() * window.innerWidth,
        Math.random() * -1000 // Reduced spawn height
      );
    }
  }

  private setCounterText() {
    const t = new Text({
      text: '4000',
      style: new TextStyle({
        fill: WorldColors.C,
        fontFamily: 'ArcadeClassic',
        letterSpacing: 0,
        fontSize: 35,
      }),
    });
    t.position.set(10, 10);
    t.zIndex = 100;
    return this.addChild(t);
  }

  private circlePhysicsSpriteFactory(x: number, y: number) {
    const sprite = new Sprite(Texture.from('sand'));
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(x, y);
    sprite.width = this.objectSize;
    sprite.height = sprite.width;
    this.sprites.push(sprite);
    this.colliders.push(
      Manager.physicsWorld.createPhysicsSphere(x, y, sprite.width - 15)
    );

    this.addChild(sprite);
  }

  update(t: Ticker): void {
    // Optimized loop for better performance with many objects
    for (let i = 0; i < this.sprites.length; i++) {
      const sprite = this.sprites[i];
      const collider = this.colliders[i];
      const translation = collider.translation();

      sprite.position.x = translation.x;
      sprite.position.y = translation.y;
      sprite.rotation = collider.rotation();
    }
  }

  IDestroy(): void {
    // Destroy all sprites
    this.sprites.forEach((sprite) => {
      sprite.destroy();
    });
    this.sprites = [];
    this.colliders = [];
  }
}
