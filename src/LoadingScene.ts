import { Container, Graphics, Assets, TextStyle, Text, Ticker } from 'pixi.js';
import { Manager, IScene } from './Manager';
import { manifest } from './Assets';
import gsap from 'gsap';
import * as PIXI from 'pixi.js';
import { PixiPlugin } from 'gsap/PixiPlugin';
import WorldColors from './WorldColors';
import SnakeWorld from './scenes/SnakeWorld';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export default class LoadingScene extends Container implements IScene {
  private textStyle: TextStyle;
  private timer: number;
  private text: Text;
  private dots: number;
  private loaderBar: Container;
  private loaderBarBorder: Graphics;
  private loaderBarFill: Graphics;
  private loaded: boolean;
  private loaderBarWidth: number;
  private loaderBarBorderLineStyleWidth: number;
  private snakeWorld: SnakeWorld;
  //game world

  constructor() {
    super();

    this.snakeWorld = new SnakeWorld();
    // Add snake world to viewport for proper camera control
    const viewport = Manager.getViewport();
    if (viewport) {
      viewport.addChild(this.snakeWorld);
    }

    //UI Elements

    this.loaded = false;
    this.dots = 0;
    this.timer = 0;
    this.loaderBarWidth = Manager.width * 0.8;
    this.loaderBarBorderLineStyleWidth = 5;
    this.textStyle = new TextStyle({
      fill: 'transparent',
      fontFamily: 'Titan One',
      letterSpacing: 6,
      stroke: {
        color: WorldColors.B,
        width: 4,
      },
      fontSize: window.innerWidth / 15,
    });

    this.loaderBarFill = new Graphics()
      .roundRect(0, 0, this.loaderBarWidth, 150, 15)
      .fill('#ffffff');
    this.loaderBarFill.scale.x = 0;

    this.loaderBarBorder = new Graphics();
    this.loaderBarBorder.stroke({
      width: this.loaderBarBorderLineStyleWidth,
      color: WorldColors.B,
    });
    this.loaderBarBorder.roundRect(0, 0, this.loaderBarWidth, 500, 150);

    this.loaderBar = new Container();
    this.loaderBar.addChild(this.loaderBarFill);
    this.loaderBar.addChild(this.loaderBarBorder);

    // this.addChild(this.loaderBar);

    this.text = new Text({
      text: 'LOADING' + this.dots,
      style: this.textStyle,
    });

    this.addChild(this.text);
    this.text.on('pointerdown', this.buttonClicked.bind(this));

    this.initializeLoader().then(() => {
      this.gameLoaded();
      this.text.eventMode = 'dynamic';
      this.text.cursor = 'pointer';
      this.setLayout();
    });
    this.resize();
  }

  update(t: Ticker): void {
    if (this.loaded) this.text.text = 'PIXI.JS\nRAPIER.JS';

    this.timer += 1;
    if (this.timer == 10) {
      this.dots += 1;
      this.timer = 0;

      this.snakeWorld.update();
    }
    let dotsString: string = '.'.repeat(this.dots % 5);
    this.text.text = 'LOADING' + dotsString;
  }

  private resize(): void {
    this.setLayout();
  }

  private setLayout() {
    this.loaderBar.width = Manager.width;
    this.loaderBar.position.x = 0;
    this.loaderBar.position.y = (Manager.height - this.loaderBar.height) / 2;
    this.loaderBar.alpha = 0.85; // Semi-transparent for glass effect
    this.text.position.x = 0;
    this.text.position.y = 0;
    this.text.alpha = 0.85; // Semi-transparent for glass effect
  }

  private async initializeLoader(): Promise<void> {
    await Assets.init({ manifest: manifest });
    const bundleIds = manifest.bundles.map((bundle) => bundle.name);
    await Assets.loadBundle(bundleIds, this.downloadProgress.bind(this));
  }

  private downloadProgress(progressRatio: number): void {
    this.loaderBarFill.scale.x = progressRatio;
    this.loaderBarFill.tint = WorldColors.B;
  }

  private gameLoaded() {
    this.loaded = true;
  }

  private buttonClicked() {
    if (this.loaded) {
      console.log("=== TRANSITIONING TO NEXT SCENE ===");
      // Don't reset viewport here - let it stay centered on snake until transition
      Manager.changeScene();
    }
  }

  IDestroy(): void {
    console.log("=== DESTROYING LOADING SCENE ===");
    
    // Clean up snake world from viewport
    const viewport = Manager.getViewport();
    if (viewport && this.snakeWorld && this.snakeWorld.parent === viewport) {
      viewport.removeChild(this.snakeWorld);
    }
    if (this.snakeWorld) {
      this.snakeWorld.destroy();
    }
    
    // Note: Scene updates automatically stop when Manager changes scenes
  }
}
