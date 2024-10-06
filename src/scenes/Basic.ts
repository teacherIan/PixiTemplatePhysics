import { Container, Sprite, Texture, Ticker } from 'pixi.js';
import { IScene, Manager } from '../Manager';
import { Collider } from '@dimforge/rapier2d-compat';

export class Basic extends Container implements IScene {
  private sprites: Array<Sprite>;
  private colliders: Array<Collider>;

  constructor() {
    super();
    this.sprites = [];
    this.colliders = [];
  }
  update(t: Ticker): void {
    this.circlePhysicsSpriteFactory(
      Math.random() * window.innerWidth,
      Math.random() * -300
    );

    this.sprites.forEach((sprite, index) => {
      sprite.position = this.colliders[index].translation();
      sprite.rotation = this.colliders[index].rotation();
    });
  }

  private circlePhysicsSpriteFactory(x: number, y: number) {
    const num = Math.floor(Math.random() * 8) + 1;
    const sprite = new Sprite(Texture.from('magic0' + num));
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(x, y);
    sprite.width = 50 * Math.random() + 10;
    sprite.height = sprite.width;

    this.sprites.push(sprite);
    this.colliders.push(
      Manager.getPhysicsWorld.createPhysicsSphere(x, y, sprite.width)
    );
    this.addChild(sprite);
  }

  IDestroy(): void {
    this.sprites.forEach((sprite) => {
      sprite.destroy();
    });

    this.sprites = [];

    let b = Manager.getPhysicsWorld.World?.bodies.getAll();
    b?.forEach((body, index) => {
      if (index > 2) Manager.getPhysicsWorld.World?.removeRigidBody(body);
    });

    this.colliders = [];
  }
}
