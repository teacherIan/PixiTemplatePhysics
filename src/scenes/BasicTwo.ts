import { Container, Sprite, Texture, Ticker } from 'pixi.js';
import { IScene, Manager } from '../Manager';
import { Collider } from '@dimforge/rapier2d-compat';

export class BasicTwo extends Container implements IScene {
  private sprites: Array<Sprite>;
  private colliders: Array<Collider>;
  private continue: boolean = true;
  constructor() {
    super();
    this.sprites = [];
    this.colliders = [];

    // setInterval(() => {
    //   for (let i = 0; i < 100; i++) {
    //     this.circlePhysicsSpriteFactory(
    //       Math.random() * window.innerWidth,
    //       Math.random() * -100
    //     );
    //   }
    // }, 200);

    // setInterval(() => {
    //   this.IDestroy();
    // }, 10000);
  }
  update(t: Ticker): void {
    // throw new Error('Method not implemented.');

    this.sprites.forEach((sprite, index) => {
      sprite.position.x = this.colliders[index].translation().x;
      sprite.position.y = this.colliders[index].translation().y;
    });
  }

  private circlePhysicsSpriteFactory(x: number, y: number) {
    const sprite = new Sprite(Texture.from('green_body_circle'));
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(x, y);
    sprite.width = 30 * Math.random() + 5;
    sprite.height = sprite.width;

    this.sprites.push(sprite);
    this.colliders.push(
      Manager.getPhysicsWorld.createPhysicsSphere(x, y, sprite.width)
    );
    this.addChild(sprite);
  }

  IDestroy(): void {
    // console.log(Manager.getPhysicsWorld.World?.bodies.getAll());
    this.sprites.forEach((sprite) => {
      sprite.destroy();
    });

    this.sprites = [];

    let b = Manager.getPhysicsWorld.World?.bodies.getAll();
    b?.forEach((body, index, array) => {
      if (index > 3) Manager.getPhysicsWorld.World?.removeRigidBody(body);
    });

    // this.colliders = [];
    console.log(Manager.getPhysicsWorld.World?.bodies.getAll());
  }
}
