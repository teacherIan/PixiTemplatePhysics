import { Application, Container } from 'pixi.js';
import WorldColors from './WorldColors';
import { PerformanceTest } from './scenes/PerformanceTest';
import { DestroyableObjects } from './scenes/DestroyableObjects';
import * as RAPIER from '@dimforge/rapier2d-compat';

export class Manager {
  private constructor() {}

  private static app: Application;
  private static currentScene: IScene;
  private static sceneIterator: number = 0;
  private static amtScenes: number = 2;
  public static started = false;

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
    Manager.app = new Application();

    await Manager.app.init({
      resizeTo: window,
      view: document.getElementById('app') as HTMLCanvasElement,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: WorldColors.A,
      backgroundAlpha: 1,
      powerPreference: 'high-performance',
      antialias: false,
      hello: true, //check for webGPU
    });
    window.addEventListener('click', (e) => {
      const target = e.target as HTMLInputElement;
      if (this.started && target.id == 'app') {
        this.changeScene();
      }
    });
  }

  public static changeScene(loadingScene?: IScene): void {
    const nextScene = this.sceneIterator % this.amtScenes;
    this.sceneIterator++;
    if (Manager.currentScene) {
      Manager.app.stage.removeChild(Manager.currentScene);
      Manager.currentScene.IDestroy();
      Manager.currentScene.destroy(true);
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
        Manager.app.stage.addChild(
          (Manager.currentScene = new DestroyableObjects(10))
        );

        break;
    }
  }
}

export interface IScene extends Container {
  IDestroy(): void;
}
