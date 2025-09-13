import { Application, Container, Ticker } from 'pixi.js';
import WorldColors from './WorldColors';
import { PerformanceTest } from './scenes/PerformanceTest';
import { DestroyableObjects } from './scenes/DestroyableObjects';
import * as RAPIER from '@dimforge/rapier2d-compat';
import { PhysicsWorld } from './PhysicsWorld';
import { Basic } from './scenes/Basic';
import { BasicTwo } from './scenes/BasicTwo';
import Sand from './scenes/Sand';
import { Viewport } from 'pixi-viewport';

export class Manager {
  private constructor() {}
  private static _physicsWorld: PhysicsWorld;
  private static _app: Application;
  private static currentScene: IScene;
  private static sceneIterator: number = 0;
  private static amtScenes: number = 2;
  public static started = false;
  private static _viewport: Viewport;

  // Safe getters that work before initialization
  public static get width(): number {
    return Manager._app?.screen?.width || window.innerWidth;
  }

  public static get height(): number {
    return Manager._app?.screen?.height || window.innerHeight;
  }

  // Public getter for app
  public static get app(): Application {
    if (!Manager._app) {
      throw new Error(
        'Manager.app accessed before initialization. Call Manager.initialize() first.'
      );
    }
    return Manager._app;
  }

  // Fixed physicsWorld getter - check the PRIVATE property!
  public static get physicsWorld(): PhysicsWorld {
    if (!Manager._physicsWorld) {
      // ← Check _physicsWorld, not physicsWorld!
      throw new Error(
        'Manager.physicsWorld accessed before initialization. Call Manager.initialize() first.'
      );
    }
    return Manager._physicsWorld;
  }

  // Public getter for viewport
  public static get viewport(): Viewport {
    if (!Manager._viewport) {
      throw new Error(
        'Manager.viewport accessed before initialization. Call Manager.initialize() first.'
      );
    }
    return Manager._viewport;
  }

  // Viewport control methods
  public static followTarget(target: any, options?: any): void {
    if (Manager._viewport) {
      console.log("Manager: Setting viewport to follow target", target, "at position:", target.position || target.x + "," + target.y);
      Manager._viewport.follow(target, {
        speed: 8,
        acceleration: 0.02,
        radius: 50,
        ...options
      });
    }
  }

  public static stopFollowing(): void {
    if (Manager._viewport) {
      console.log("Manager: Stopping viewport following");
      Manager._viewport.plugins.remove('follow');
    }
  }

  public static centerViewportAt(x: number, y: number): void {
    if (Manager._viewport) {
      console.log("Manager: Centering viewport at", x, y, "current center:", Manager._viewport.center);
      Manager._viewport.moveCenter(x, y);
      console.log("Manager: Viewport centered, new center:", Manager._viewport.center);
    }
  }

  public static resetViewport(): void {
    if (Manager._viewport) {
      console.log("Manager: Resetting viewport");
      console.log("Manager: Before reset - center:", Manager._viewport.center, "scale:", Manager._viewport.scale);
      Manager._viewport.plugins.remove('follow');
      Manager._viewport.plugins.remove('decelerate');
      Manager._viewport.moveCenter(0, 0);
      Manager._viewport.scale.set(1);
      Manager._viewport.drag().pinch().wheel().decelerate();
      console.log("Manager: After reset - center:", Manager._viewport.center, "scale:", Manager._viewport.scale);
    }
  }

  public static async initialize(): Promise<void> {
    Manager._physicsWorld = new PhysicsWorld(); // ← Set the PRIVATE property!
    Manager._app = new Application();

    await Manager._app.init({
      preference: 'webgpu',
      resizeTo: window,
      view: document.getElementById('app') as HTMLCanvasElement,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: WorldColors.C,
      backgroundAlpha: 0.22,
      powerPreference: 'high-performance',
      antialias: true,
      hello: true,
    });

    Manager._viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: Math.max(window.innerWidth, window.innerHeight) * 2, // Match snake world
      worldHeight: Math.max(window.innerWidth, window.innerHeight) * 2,
      events: Manager._app.renderer.events,
    });

    Manager._viewport.drag().pinch().wheel().decelerate();

    Manager._app.stage.addChild(Manager._viewport);

    window.addEventListener('click', (e) => {
      const target = e.target as HTMLInputElement;
      if (this.started && target.id == 'app') {
        this.changeScene();
      }
    });

    Manager._app.ticker.add(Manager.update);
  }

  private static update(t: Ticker) {
    if (Manager.currentScene) {
      Manager.currentScene.update(t);
      if (Manager._physicsWorld) {
        // ← Check the PRIVATE property!
        Manager._physicsWorld.stepWorld(t.deltaMS / 10000);
      }
    }
  }

  public static changeScene(loadingScene?: IScene): void {
    console.log("=== CHANGING SCENE ===");
    
    // Stop following immediately
    Manager.stopFollowing();
    
    const nextScene = this.sceneIterator % this.amtScenes;
    this.sceneIterator++;

    // Clean up current scene first
    if (Manager.currentScene) {
      Manager.currentScene.IDestroy();

      // Remove from correct parent
      if (Manager.currentScene.parent) {
        Manager.currentScene.parent.removeChild(Manager.currentScene);
      }

      Manager.currentScene.destroy();
    }

    if (Manager._physicsWorld) {
      // ← Check the PRIVATE property!
      Manager._physicsWorld.destroy();
    }

    Manager._physicsWorld = new PhysicsWorld(); // ← Set the PRIVATE property!

    // Handle loading scene
    if (loadingScene) {
      Manager.currentScene = loadingScene;
      // Loading scene goes to stage (UI elements stay on stage)
      if (Manager._app) {
        Manager._app.stage.addChild(loadingScene);
      }
      
      // Reset viewport for loading scene using centralized method
      Manager.resetViewport();
      
      return;
    }

    if (!this.started) {
      this.started = true;
      return;
    }

    // Handle game scenes - these go to viewport for camera/zoom
    switch (nextScene) {
      case 0:
        Manager.currentScene = new PerformanceTest(10);
        if (Manager._viewport) {
          Manager._viewport.addChild(Manager.currentScene);
        }
        break;

      case 1:
        Manager.currentScene = new Sand();
        if (Manager._viewport) {
          Manager._viewport.addChild(Manager.currentScene);
        }
        break;
    }
    
    console.log("Scene change complete - new scene will handle its own viewport setup");
  }

  // Helper method to center viewport
  public static centerViewport(): void {
    if (Manager._viewport) {
      Manager._viewport.moveCenter(0, 0);
      Manager._viewport.scale.set(1);
    }
  }

  // Helper method to get viewport
  public static getViewport(): Viewport | null {
    return Manager._viewport || null;
  }
}

export interface IScene extends Container {
  update(t: Ticker): void;
  IDestroy(): void;
}
