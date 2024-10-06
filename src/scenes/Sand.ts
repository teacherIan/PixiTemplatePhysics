import { Container, Ticker, Sprite, Texture } from 'pixi.js';
import { IScene } from '../Manager';
import { Collider } from '@dimforge/rapier2d-compat';
import { Manager } from '../Manager';

export default class Sand extends Container implements IScene {
  private sprites: Array<Sprite>;
  private colliders: Array<Collider>;
  private objectSize: number;
  constructor() {
    super();
    this.objectSize = 35;
    this.sprites = [];
    this.colliders = [];

    for (let i = 0; i < 3000; i++) {
      this.circlePhysicsSpriteFactory(
        Math.random() * window.innerWidth,
        Math.random() * -2000
      );
    }

    this.colliders.forEach((collider) => {
      collider.setRestitution(0);
      collider.setFriction(0.8);
    });
  }

  private circlePhysicsSpriteFactory(x: number, y: number) {
    const sprite = new Sprite(Texture.from('sand'));
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(x, y);
    sprite.width = this.objectSize;
    sprite.height = sprite.width;
    this.sprites.push(sprite);
    this.colliders.push(
      Manager.getPhysicsWorld.createPhysicsSphere(x, y, sprite.width - 15)
    );

    this.addChild(sprite);
  }

  IDestroy(): void {}
  update(t: Ticker): void {
    this.sprites.forEach((sprite, index) => {
      sprite.position = this.colliders[index].translation();
      sprite.rotation = this.colliders[index].rotation();
    });
  }
}
