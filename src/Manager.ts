import { Application, Container } from 'pixi.js';
import WorldColors from './WorldColors';

export class Manager {
  private constructor() {}

  private static app: Application;
  private static currentScene: Container;

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
  }

  public static changeScene(newScene: Container): void {
    if (Manager.currentScene) {
      Manager.app.stage.removeChild(Manager.currentScene);
      Manager.currentScene.destroy();
    }

    Manager.currentScene = newScene;
    Manager.app.stage.addChild(newScene);
  }
}
