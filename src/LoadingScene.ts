import { Container, Graphics, Assets, TextStyle, Text, Ticker } from 'pixi.js';
import { Manager } from './Manager';
import { manifest } from './Assets';
import gsap from 'gsap';
import * as PIXI from 'pixi.js';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { PhysicsScene } from './PhysicsScene';
import WorldColors from './WorldColors';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export default class LoadingScene extends Container {
  private textStyle: TextStyle;
  private timer: number;
  private text: Text;
  private dots: number;
  private loaderBar: Container;
  private loaderBarBorder: Graphics;
  private loaderBarFill: Graphics;
  private loaded: boolean;
  private loaderBarWidth: number;
  private loaderBarBorderLineStyleWidth;

  constructor() {
    super();
    this.loaded = false;
    this.dots = 0;
    this.timer = 0;
    this.loaderBarWidth = Manager.width * 0.8;
    this.loaderBarBorderLineStyleWidth = 5;
    this.textStyle = new TextStyle({
      fill: WorldColors.B,
      fontFamily: 'Titan One',
      letterSpacing: 6,
      stroke: WorldColors.B,
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

    this.addChild(this.loaderBar);

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
  private resize(): void {
    this.setLayout();
  }

  private setLayout() {
    this.loaderBar.width = Manager.width;
    this.loaderBar.position.x = 0;
    this.loaderBar.position.y = (Manager.height - this.loaderBar.height) / 2;
    this.text.position.x = 0;
    (this.text.position.y =
      (Manager.height - this.loaderBar.height) / 2 -
      this.text.height -
      this.loaderBarBorderLineStyleWidth / 2),
      (this.text.alpha = 1);
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
      Manager.changeScene(new PhysicsScene(15));
    }
  }

  private addTicker() {
    Ticker.shared.add(() => {
      if (this.loaded) this.text.text = 'CLICK TO START';
      else {
        this.timer += 1;
        if (this.timer == 30) {
          this.dots += 1;
          this.timer = 0;
        }
        let dotsString: string = '.'.repeat(this.dots % 5);
        this.text.text = 'LOADING' + dotsString;
      }
    });
  }
}
