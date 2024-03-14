import { Application, Container, Ticker } from 'pixi.js';

export class Manager {
  private constructor() {}

  private static app: Application;
  private static currentScene: IScene;

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
      backgroundColor: 0xffffff,
      backgroundAlpha: 0,
      powerPreference: 'high-performance',
      antialias: true,
      hello: true,
    });

    window.addEventListener('resize', Manager.resize);

    Ticker.shared.add((ticker) => {
      Manager.update(ticker.deltaTime);
    });
  }

  public static changeScene(newScene: IScene): void {
    if (Manager.currentScene) {
      Manager.app.stage.removeChild(Manager.currentScene);
      Manager.currentScene.destroy();
    }

    Manager.currentScene = newScene;
    Manager.app.stage.addChild(newScene);
  }

  private static update(framesPassed: number): void {
    if (Manager.currentScene) {
      Manager.currentScene.update(framesPassed);
    }
  }

  public static resize(): void {
    if (Manager.currentScene) {
      Manager.currentScene.resize(Manager.width, Manager.height);
    }
  }
}

export interface IScene extends Container {
  update(framesPassed: number): void;
  resize(screenWidth: number, screenHeight: number): void;
}
