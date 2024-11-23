import { Application, Container, Ticker } from 'pixi.js';
import WorldColors from './WorldColors';
import { PerformanceTest } from './scenes/PerformanceTest';
import { DestroyableObjects } from './scenes/DestroyableObjects';
import * as RAPIER from '@dimforge/rapier2d-compat';
import { PhysicsWorld } from './PhysicsWorld';
import { Basic } from './scenes/Basic';
import { BasicTwo } from './scenes/BasicTwo';
import Sand from './scenes/Sand';

export class Manager {
  private constructor() {}
  private static physicsWorld: PhysicsWorld;
  private static app: Application;
  private static currentScene: IScene;
  private static sceneIterator: number = 0;
  private static amtScenes: number = 2;
  public static started = false;

  public static get getPhysicsWorld() {
    return Manager.physicsWorld;
  }

  public static get width(): number {
    return Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
  }

  public static get height(): number {
    return Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
  }

  public static get getApp(): Application {
    return this.app;
  }

  public static async initialize(): Promise<void> {
    Manager.physicsWorld = new PhysicsWorld();
    Manager.app = new Application();

    await Manager.app.init({
      preference: 'webgpu',
      resizeTo: window,
      view: document.getElementById('app') as HTMLCanvasElement,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: WorldColors.C,
      backgroundAlpha: 0.22,
      powerPreference: 'high-performance',
      antialias: true,
      hello: true, //check for webGPU
    });
    window.addEventListener('click', (e) => {
      const target = e.target as HTMLInputElement;
      if (this.started && target.id == 'app') {
        this.changeScene();
      }
    });

    Manager.app.ticker.add(Manager.update);
  }

  private static update(t: Ticker) {
    if (Manager.currentScene) {
      // Manager.currentScene.update(t);
      Manager.physicsWorld.stepWorld(t.deltaTime * 0.2);
    }
  }

  public static changeScene(loadingScene?: IScene): void {
    const nextScene = this.sceneIterator % this.amtScenes;
    // this.sceneIterator++;
    if (Manager.currentScene) {
      Manager.currentScene.IDestroy();
      Manager.app.stage.removeChild(Manager.currentScene);
      Manager.currentScene.destroy();
    }

    if (loadingScene) {
      Manager.currentScene = loadingScene;
      Manager.app.stage.addChild(loadingScene);
      return;
    }
    if (!this.started) {
      this.started = true;
      return;
    }

    switch (nextScene) {
      case 0:
        Manager.app.stage.addChild(
          (Manager.currentScene = new PerformanceTest(10))
        );

        break;

      case 1:

      // Manager.app.stage.addChild((Manager.currentScene = new Sand()));

      // case 2:
      //   Manager.app.stage.addChild((Manager.currentScene = new Sand()));

      //   break;
    }
  }
}

export interface IScene extends Container {
  IDestroy(): void;
}
