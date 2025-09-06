import * as RAPIER from '@dimforge/rapier2d-compat';

export class PhysicsWorld {
  private physicsWorld: RAPIER.World;
  constructor() {
    const gravity = new RAPIER.Vector2(0.0, 9);
    this.physicsWorld = new RAPIER.World(gravity);
    this.createFloor();
    this.createLeftWall();
    this.createRightWall();
  }

  public createPhysicsSphere(x: number, y: number, size: number) {
    const sphere: RAPIER.RigidBodyDesc =
      RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y);
    const rigidBody = this.physicsWorld?.createRigidBody(sphere);
    const colliderDesc = RAPIER.ColliderDesc.ball(size / 2);
    const collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);
    collider.setRestitution(0.1);
    // setTimeout(() => {
    //   rigidBody.setBodyType(1, true);
    // }, 16000);

    return collider;
  }

  public createStaticPhysicsRect(
    positionX: number,
    positionY: number,
    width: number,
    height: number
  ) {
    const floor: RAPIER.RigidBodyDesc =
      RAPIER.RigidBodyDesc.fixed().setTranslation(positionX, positionY);
    const rigidBody = this.physicsWorld.createRigidBody(floor);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2);
    const collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);
    collider.setRestitution(0.1);

    return collider;
  }

  public createPhysicsRect(
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const rect: RAPIER.RigidBodyDesc =
      RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y);
    const rigidBody = this.physicsWorld?.createRigidBody(rect);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2);
    const collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);
    collider.setRestitution(0.1);
    // setTimeout(() => {
    //   rigidBody.setBodyType(1, true);
    // }, 20000);
    return collider;
  }

  private createFloor() {
    const floor: RAPIER.RigidBodyDesc =
      RAPIER.RigidBodyDesc.fixed().setTranslation(
        window.innerWidth / 2,
        window.innerHeight + 100
      );
    const rigidBody = this.physicsWorld.createRigidBody(floor);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(window.innerWidth, 100);
    const collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);
  }

  private createLeftWall() {
    const floor: RAPIER.RigidBodyDesc =
      RAPIER.RigidBodyDesc.fixed().setTranslation(-5, window.innerHeight / 2);
    const rigidBody = this.physicsWorld.createRigidBody(floor);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(5, window.innerHeight * 5);
    const collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);
  }

  private createRightWall() {
    const floor: RAPIER.RigidBodyDesc =
      RAPIER.RigidBodyDesc.fixed().setTranslation(
        window.innerWidth + 10,
        window.innerHeight / 2
      );
    const rigidBody = this.physicsWorld.createRigidBody(floor);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(10, window.innerHeight * 5);
    const collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);
  }

  public stepWorld(delta: number) {
    this.physicsWorld.timestep = delta;
    this.physicsWorld.step();
  }

  public get World(): RAPIER.World | undefined {
    return this.physicsWorld;
  }

  public destroy() {
    if (this.physicsWorld) {
      this.physicsWorld.forEachCollider((collider) => {
        this.physicsWorld.removeCollider(collider, true);
      });

      this.physicsWorld.forEachRigidBody((body) => {
        this.physicsWorld.removeRigidBody(body);
      });

      this.physicsWorld.free();

      this.physicsWorld = null as any;
    }
  }
}
