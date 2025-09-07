import { Container, Graphics, Assets, TextStyle, Text, Ticker } from 'pixi.js';
import { Manager, IScene } from './Manager';
import { manifest } from './Assets';
import gsap from 'gsap';
import * as PIXI from 'pixi.js';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { PerformanceTest } from './scenes/PerformanceTest';
import WorldColors from './WorldColors';
import { BlurFilter, ColorMatrixFilter } from 'pixi.js';

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
  //game world
  private snakeWorld: Container;
  private food: Graphics;
  private gameElementWidthHeight: number;
  private devBackground: Graphics;
  private snakeGridSize: number;
  private snake: Graphics;

  constructor() {
    super();
    //snake world

    this.gameElementWidthHeight =
      window.innerWidth > window.innerHeight
        ? window.innerHeight
        : window.innerWidth;
    this.snakeGridSize = this.gameElementWidthHeight / 20;
    this.snakeWorld = new Container();

    this.centerSnakeWorld();

    this.devBackground = new Graphics().rect(
      0,
      0,
      this.gameElementWidthHeight,
      this.gameElementWidthHeight
    );

    this.snakeWorld.addChild(this.devBackground);
    this.addChild(this.snakeWorld);

    // create snake food
    this.food = new Graphics()
      .roundRect(
        this.snakeGridSize * Math.floor(Math.random() * 20),
        this.snakeGridSize * Math.floor(Math.random() * 20),
        this.snakeGridSize,
        this.snakeGridSize,
        10
      )
      .fill(WorldColors.C);

    this.snakeWorld.addChild(this.food);

    this.snake = new Graphics()
      .roundRect(
        this.snakeGridSize * Math.floor(Math.random() * 20),
        this.snakeGridSize * Math.floor(Math.random() * 20),
        this.snakeGridSize,
        this.snakeGridSize,
        10
      )
      .fill(WorldColors.B);

    this.snakeWorld.addChild(this.snake);

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
    this.addTicker();
  }

  update(t: Ticker): void {
    // Implementation not needed for this scene
  }

  private centerSnakeWorld(): void {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isLandscape) {
      // Center horizontally, align to top
      this.snakeWorld.position.set(
        (Manager.width - this.gameElementWidthHeight) / 2,
        0
      );
    } else {
      // Center vertically, align to left
      this.snakeWorld.position.set(
        0,
        (Manager.height - this.gameElementWidthHeight) / 2
      );
    }
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
      Manager.changeScene();
    }
  }

  private addTicker() {
    Ticker.shared.add(() => {
      if (this.loaded) this.text.text = 'PIXI.JS \nRAPIER.JS';
      else {
        this.timer += 1;
        if (this.timer == 30) {
          this.dots += 1;
          this.timer = 0;

          this.snake.position.set(
            this.snake.position.x + 5,
            this.snake.position.y
          );
        }
        let dotsString: string = '.'.repeat(this.dots % 5);
        this.text.text = 'LOADING' + dotsString;
      }
    });
  }

  IDestroy(): void {
    // Clean up any resources if needed
  }
}
