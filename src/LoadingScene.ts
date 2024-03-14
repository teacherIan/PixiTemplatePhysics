import { Container, Graphics, Assets, TextStyle, Text } from 'pixi.js';
import { IScene, Manager } from './Manager';
import { manifest } from './Assets';
import { SceneA } from './SceneA';
import gsap from 'gsap';
import * as PIXI from 'pixi.js';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export default class LoadingScene extends Container implements IScene {
  private colors = {
    darkPurple: '0x291720',
    byzantium: '0x820263',
    rose: '0xD90368',
    orange: 0xfb8b24,
    darkRed: 0x9a031e,
  };

  private style = new TextStyle({
    fill: this.colors.orange,
    fontFamily: 'Titan One',
    letterSpacing: 6,

    // lineJoin: 'round',
    // miterLimit: 0,
    // strokeThickness: 5,
    stroke: this.colors.darkRed,
    fontSize: 70,
  });
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

    this.loaderBarFill = new Graphics()
      .roundRect(0, 0, this.loaderBarWidth, 50, 15)
      .fill(this.colors.orange);
    this.loaderBarFill.scale.x = 0;

    this.loaderBarBorder = new Graphics();
    this.loaderBarBorder.stroke({
      width: this.loaderBarBorderLineStyleWidth,
      color: this.colors.darkRed,
    });
    this.loaderBarBorder.roundRect(0, 0, this.loaderBarWidth, 50, 15);

    this.loaderBar = new Container();
    this.loaderBar.addChild(this.loaderBarFill);
    this.loaderBar.addChild(this.loaderBarBorder);

    this.addChild(this.loaderBar);

    this.text = new Text({
      text: 'LOADING' + this.dots,
      style: this.style,
    });
    this.addChild(this.text);
    this.text.on('pointerdown', this.buttonClicked.bind(this));

    this.initializeLoader().then(() => {
      this.gameLoaded();
      this.text.eventMode = 'dynamic';
      this.text.cursor = 'pointer';
      this.setLayout();
    });
  }
  resize(): void {
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
  }

  private gameLoaded() {
    console.log('Running game loaded');
    this.loaded = true;
    console.log(this.loaded);
  }

  private buttonClicked() {
    console.log(this.loaded);
    if (this.loaded) {
      Manager.changeScene(new SceneA());
    }
  }

  update() {
    console.log('loading scene update');
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
  }
}
