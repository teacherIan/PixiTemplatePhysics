import gsap from 'gsap';
import * as PIXI from 'pixi.js';
import { Container, Graphics, Sprite } from 'pixi.js';
import { IScene } from './Manager';
import { Manager } from './Manager';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export class SceneA extends Container implements IScene {
  private spriteArray: Sprite[];
  private squareWidth: number;
  private squareHeight: number;
  private amtSquaresX: number = 60;
  private amtSquaresY: number = 60;
  private graphicsSquare: Graphics;
  private spriteScale: number = 1.1;

  private colorArray = [
    0xb9fbc0, 0x98f5e1, 0x8eecf5, 0x90dbf4, 0xcfbaf0, 0xf1c0e8, 0xffcfd2,
    0xfde4cf, 0xfbf8cc, 0xff0000, 0x00ff00, 0x0000ff, 0xea1e62,
  ];

  constructor() {
    super();

    const texture = PIXI.Assets.get('/icons/pixijs-icon.svg');
    const backgroundSprite = new Sprite(texture);
    backgroundSprite.anchor.set(0.5, 0.5);
    backgroundSprite.position.set(Manager.width / 2, Manager.height / 2);
    this.addChild(backgroundSprite);

    this.spriteArray = [];
    this.squareWidth = Manager.width / this.amtSquaresX;
    this.squareHeight = Manager.height / this.amtSquaresY;

    this.graphicsSquare = new Graphics()
      .rect(0, 0, this.squareWidth, this.squareHeight)
      .fill(0xffffff);

    for (let i = 0; i < this.amtSquaresX; i++) {
      for (let j = 0; j < this.amtSquaresY; j++) {
        this.createSpriteSquare(i * this.squareWidth, j * this.squareHeight);
      }
    }
    //start animations
    this.animationController();
    this.animationController();
  }

  createSpriteSquare(x: number, y: number) {
    const sprite = new Sprite(
      Manager.getApp.renderer.generateTexture(this.graphicsSquare)
    );
    sprite.tint = 0xea1e62;
    sprite.scale.set(this.spriteScale);
    sprite.position.set(x, y);
    this.spriteArray.push(sprite);
    this.addChild(sprite);
  }

  createGraphicsSquare(width: number, height: number, x: number, y: number) {
    const square = new Graphics().rect(x, y, width, height).fill(0xff0000);
    this.addChild(square);
  }

  animationController() {
    const amtAnimations = 4;
    const animationSelection = Math.floor(Math.random() * amtAnimations);
    console.log('animation Controller called: ' + animationSelection);
    if (animationSelection == 0) this.animationA();
    else if (animationSelection == 1) this.animationB();
    else if (animationSelection == 2) this.animationC();
    else this.animationD();
  }

  animationA() {
    gsap
      .to(this.spriteArray, {
        pixi: {
          alpha: Math.max(Math.random(), 0.5),
          tint: this.colorArray[
            Math.floor(Math.random() * this.colorArray.length)
          ],
        },
        stagger: {
          amount: 2,
          from: [Math.random(), Math.random()],
          grid: [this.amtSquaresX, this.amtSquaresY],
          ease: 'power1.out',
        },
      })
      .then(() => {
        this.animationController();
      });
  }

  animationB() {
    gsap
      .to(this.spriteArray, {
        pixi: {
          rotation: 1080,
          scale: this.spriteScale,
        },
        stagger: {
          amount: 5,
          from: [Math.random(), Math.random()],
          grid: [this.amtSquaresX, this.amtSquaresY],
          ease: 'power4',
        },
      })
      .then(() => {
        this.animationController();
      });
  }

  animationC() {
    gsap
      .to(this.spriteArray, {
        pixi: {
          rotation: 360,
        },
        stagger: {
          amount: Math.random() * 7,
          from: [Math.random(), Math.random()],
          grid: [this.amtSquaresX, this.amtSquaresY],
          ease: 'power1.out',
        },
      })
      .then(() => {
        this.animationController();
      });
  }
  animationD() {
    const tl = gsap.timeline();
    tl.to(this.spriteArray, {
      pixi: {
        scale: 0,
      },
      stagger: {
        amount: Math.random() * 7,
        from: [Math.random(), Math.random()],
        grid: [this.amtSquaresX, this.amtSquaresY],
      },
    });
    tl.to(this.spriteArray, {
      pixi: {
        alpha: Math.max(Math.random(), 0.5),
        tint: this.colorArray[
          Math.floor(Math.random() * this.colorArray.length)
        ],
      },
    });
    tl.to(this.spriteArray, {
      pixi: {
        scale: this.spriteScale,
        rotation: 360,
      },
      stagger: {
        amount: Math.random() * 7,
        from: 'random',
        grid: [this.amtSquaresX, this.amtSquaresY],
      },
    }).then(() => {
      this.animationController();
    });
  }

  resize(): void {}
  update() {}
}
