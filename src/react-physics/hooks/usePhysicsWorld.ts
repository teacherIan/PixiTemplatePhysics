import { useEffect, useRef, useCallback, useState } from 'react';
import RAPIER from '@dimforge/rapier2d-compat';

interface PhysicsBody {
  id: string;
  rigidBody: RAPIER.RigidBody;
  collider: RAPIER.Collider;
  width: number;
  height: number;
  isStatic: boolean;
}

interface PhysicsWorldState {
  world: RAPIER.World | null;
  bodies: Map<string, PhysicsBody>;
  boundaryBodies: RAPIER.RigidBody[];
  isReady: boolean;
}

export function usePhysicsWorld(containerRef: React.RefObject<HTMLDivElement | null>) {
  const stateRef = useRef<PhysicsWorldState>({
    world: null,
    bodies: new Map(),
    boundaryBodies: [],
    isReady: false,
  });
  const [isReady, setIsReady] = useState(false);
  const [worldVersion, setWorldVersion] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const positionCallbacksRef = useRef<Map<string, (x: number, y: number, rotation: number) => void>>(new Map());

  // Create or recreate boundaries
  const createBoundaries = useCallback((world: RAPIER.World, width: number, height: number) => {
    // Remove old boundaries first
    stateRef.current.boundaryBodies.forEach((body) => {
      if (world) {
        try {
          world.removeRigidBody(body);
        } catch (e) {
          // Body may already be removed
        }
      }
    });
    stateRef.current.boundaryBodies = [];

    const thickness = 50;

    // Floor
    const floorBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(width / 2, height + thickness / 2)
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(width / 2, thickness / 2),
      floorBody
    );
    stateRef.current.boundaryBodies.push(floorBody);

    // Left wall
    const leftBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(-thickness / 2, height / 2)
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(thickness / 2, height),
      leftBody
    );
    stateRef.current.boundaryBodies.push(leftBody);

    // Right wall
    const rightBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(width + thickness / 2, height / 2)
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(thickness / 2, height),
      rightBody
    );
    stateRef.current.boundaryBodies.push(rightBody);

    // Ceiling
    const ceilingBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(width / 2, -thickness / 2)
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(width / 2, thickness / 2),
      ceilingBody
    );
    stateRef.current.boundaryBodies.push(ceilingBody);
  }, []);

  // Initialize RAPIER
  useEffect(() => {
    let mounted = true;

    RAPIER.init().then(() => {
      if (!mounted) return;

      const gravity = new RAPIER.Vector2(0, 0); // No gravity - user controls movement
      const world = new RAPIER.World(gravity);
      stateRef.current.world = world;
      stateRef.current.isReady = true;
      setIsReady(true);

      // Create boundaries based on container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        createBoundaries(world, rect.width, rect.height);
      }

      // Start physics loop
      const step = () => {
        if (!stateRef.current.world || !containerRef.current) return;

        stateRef.current.world.step();

        const rect = containerRef.current.getBoundingClientRect();
        const margin = 100; // How far off-screen before teleporting back

        // Update all body positions and check for off-screen
        stateRef.current.bodies.forEach((body, id) => {
          const translation = body.rigidBody.translation();
          const rotation = body.rigidBody.rotation();

          // Check if dynamic body is off-screen
          if (!body.isStatic) {
            const isOffScreen =
              translation.x < -margin ||
              translation.x > rect.width + margin ||
              translation.y < -margin ||
              translation.y > rect.height + margin;

            if (isOffScreen) {
              // Teleport to random position on screen
              const newX = 50 + Math.random() * (rect.width - 100);
              const newY = 50 + Math.random() * (rect.height - 100);
              body.rigidBody.setTranslation({ x: newX, y: newY }, true);
              body.rigidBody.setLinvel({ x: 0, y: 0 }, true);
              body.rigidBody.setAngvel(0, true);
            }
          }

          const callback = positionCallbacksRef.current.get(id);
          if (callback) {
            const pos = body.rigidBody.translation();
            callback(pos.x, pos.y, rotation);
          }
        });

        animationFrameRef.current = requestAnimationFrame(step);
      };

      animationFrameRef.current = requestAnimationFrame(step);
    });

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (stateRef.current.world) {
        stateRef.current.world.free();
        stateRef.current.world = null;
      }
    };
  }, [worldVersion, createBoundaries]);

  // Handle window resize - reset the world
  useEffect(() => {
    const handleResize = () => {
      // Clean up existing world
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (stateRef.current.world) {
        stateRef.current.world.free();
        stateRef.current.world = null;
      }
      stateRef.current.bodies.clear();
      stateRef.current.boundaryBodies = [];
      positionCallbacksRef.current.clear();
      setIsReady(false);

      // Trigger world recreation
      setWorldVersion((v) => v + 1);
    };

    // Debounce resize to avoid too many recreations
    let resizeTimeout: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(handleResize, 200);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const createBody = useCallback((
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onPositionUpdate: (x: number, y: number, rotation: number) => void
  ) => {
    if (!stateRef.current.world) return;

    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x + width / 2, y + height / 2)
      .setLinearDamping(0.5)
      .setAngularDamping(0.8);

    const rigidBody = stateRef.current.world.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2)
      .setRestitution(0.3)
      .setFriction(0.5);

    const collider = stateRef.current.world.createCollider(colliderDesc, rigidBody);

    stateRef.current.bodies.set(id, { id, rigidBody, collider, width, height, isStatic: false });
    positionCallbacksRef.current.set(id, onPositionUpdate);
  }, []);

  const createStaticBody = useCallback((
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onPositionUpdate?: (x: number, y: number, rotation: number) => void
  ) => {
    if (!stateRef.current.world) return;

    const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
      .setTranslation(x + width / 2, y + height / 2);

    const rigidBody = stateRef.current.world.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2)
      .setRestitution(0.5) // Bouncy!
      .setFriction(0.3);

    const collider = stateRef.current.world.createCollider(colliderDesc, rigidBody);

    stateRef.current.bodies.set(id, { id, rigidBody, collider, width, height, isStatic: true });
    if (onPositionUpdate) {
      positionCallbacksRef.current.set(id, onPositionUpdate);
    }
  }, []);

  const removeBody = useCallback((id: string) => {
    const body = stateRef.current.bodies.get(id);
    if (body && stateRef.current.world) {
      stateRef.current.world.removeRigidBody(body.rigidBody);
      stateRef.current.bodies.delete(id);
      positionCallbacksRef.current.delete(id);
    }
  }, []);

  const setBodyPosition = useCallback((id: string, x: number, y: number) => {
    const body = stateRef.current.bodies.get(id);
    if (body) {
      body.rigidBody.setTranslation({ x: x + body.width / 2, y: y + body.height / 2 }, true);
      body.rigidBody.setLinvel({ x: 0, y: 0 }, true);
      body.rigidBody.setAngvel(0, true);
    }
  }, []);

  const applyImpulse = useCallback((id: string, impulseX: number, impulseY: number) => {
    const body = stateRef.current.bodies.get(id);
    if (body) {
      body.rigidBody.applyImpulse({ x: impulseX, y: impulseY }, true);
    }
  }, []);

  const setKinematic = useCallback((id: string, isKinematic: boolean) => {
    const body = stateRef.current.bodies.get(id);
    if (body) {
      if (isKinematic) {
        body.rigidBody.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
      } else {
        body.rigidBody.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
      }
    }
  }, []);

  const setKinematicPosition = useCallback((id: string, x: number, y: number) => {
    const body = stateRef.current.bodies.get(id);
    if (body) {
      body.rigidBody.setNextKinematicTranslation({ x: x + body.width / 2, y: y + body.height / 2 });
    }
  }, []);

  return {
    isReady,
    worldVersion,
    createBody,
    createStaticBody,
    removeBody,
    setBodyPosition,
    applyImpulse,
    setKinematic,
    setKinematicPosition,
  };
}
