import * as RAPIER from '@dimforge/rapier2d-compat';

export enum PhysicsShapeType {
  SPHERE = 'sphere',
  RECTANGLE = 'rectangle',
  STATIC_RECTANGLE = 'static_rectangle',
}

interface PhysicsObjectConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  size?: number;
}

export class PhysicsWorld {
  private physicsWorld: RAPIER.World;
  private fixedTimeStep: number = 1.0 / 120.0;
  private accumulator: number = 0.0;
  private maxSubSteps: number = 4; // Prevent spiral of death

  constructor() {
    const gravity = new RAPIER.Vector2(0.0, 990);
    this.physicsWorld = new RAPIER.World(gravity);
    this.physicsWorld.timestep = this.fixedTimeStep;
    this.initializeBoundaries();
  }

  public createPhysicsObject(
    type: PhysicsShapeType,
    config: PhysicsObjectConfig
  ): RAPIER.Collider {
    switch (type) {
      case PhysicsShapeType.SPHERE:
        if (!config.size) throw new Error('Size is required for sphere');
        return this.createSphere(config.x, config.y, config.size);

      case PhysicsShapeType.RECTANGLE:
        if (!config.width || !config.height)
          throw new Error('Width and height are required for rectangle');
        return this.createDynamicRectangle(
          config.x,
          config.y,
          config.width,
          config.height
        );

      case PhysicsShapeType.STATIC_RECTANGLE:
        if (!config.width || !config.height)
          throw new Error('Width and height are required for static rectangle');
        return this.createStaticRectangle(
          config.x,
          config.y,
          config.width,
          config.height
        );

      default:
        throw new Error(`Unknown physics shape type: ${type}`);
    }
  }

  // Keep the original methods for backward compatibility or direct access
  public createPhysicsSphere(
    x: number,
    y: number,
    size: number
  ): RAPIER.Collider {
    return this.createSphere(x, y, size);
  }

  public createPhysicsRect(
    x: number,
    y: number,
    width: number,
    height: number
  ): RAPIER.Collider {
    return this.createDynamicRectangle(x, y, width, height);
  }

  public createStaticPhysicsRect(
    x: number,
    y: number,
    width: number,
    height: number
  ): RAPIER.Collider {
    return this.createStaticRectangle(x, y, width, height);
  }

  private createSphere(x: number, y: number, size: number): RAPIER.Collider {
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y);
    const rigidBody = this.physicsWorld.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.ball(size / 2);
    const collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);

    this.setDynamicProperties(collider);
    // this.scheduleKinematicConversion(rigidBody, 16000);

    return collider;
  }

  private createDynamicRectangle(
    x: number,
    y: number,
    width: number,
    height: number
  ): RAPIER.Collider {
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y);
    const rigidBody = this.physicsWorld.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2);
    const collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);

    this.setDynamicProperties(collider);
    // this.scheduleKinematicConversion(rigidBody, 20000);

    return collider;
  }

  private createStaticRectangle(
    x: number,
    y: number,
    width: number,
    height: number
  ): RAPIER.Collider {
    const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y);
    const rigidBody = this.physicsWorld.createRigidBody(rigidBodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2);
    const collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);
    this.setStaticProperties(collider);
    return collider;
  }

  private setDynamicProperties(collider: RAPIER.Collider): void {
    collider.setRestitution(0.01);
  }

  private setStaticProperties(collider: RAPIER.Collider): void {
    collider.setRestitution(0.01);
    // collider.setFriction(0.1);
  }

  private scheduleKinematicConversion(
    rigidBody: RAPIER.RigidBody,
    delay: number
  ): void {
    setTimeout(() => {
      rigidBody.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
    }, delay);
  }

  private initializeBoundaries(): void {
    this.createFloor();
    this.createLeftWall();
    this.createRightWall();
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

  public stepWorld(deltaTime: number): void {
    if (!this.physicsWorld || deltaTime <= 0) return;

    this.physicsWorld.step();
  }

  // Expose the underlying world for advanced usage
  public get World(): RAPIER.World {
    return this.physicsWorld;
  }

  // Helper method for contact pair detection
  public contactPair(
    collider1: RAPIER.Collider,
    collider2: RAPIER.Collider,
    callback: () => void
  ): void {
    this.physicsWorld.contactPair(collider1, collider2, callback);
  }

  // Helper method to get all rigid bodies (useful for cleanup)
  public getAllBodies(): RAPIER.RigidBody[] {
    const bodies: RAPIER.RigidBody[] = [];
    this.physicsWorld.forEachRigidBody((body) => {
      bodies.push(body);
    });
    return bodies;
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
