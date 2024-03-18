import gsap from 'gsap';
import * as PIXI from 'pixi.js';
import { Container, Sprite, Texture } from 'pixi.js';
import { Manager } from './Manager';
import { PixiPlugin } from 'gsap/PixiPlugin';
import WorldColors from './WorldColors';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export class SceneA extends Container {
  private spriteArray: Sprite[];
  private squareWidth: number;
  private squareHeight: number;
  private amtSquaresX: number = 60;
  private amtSquaresY: number = 60;
  private spriteScale: number = 1;

  private colorArray = [
    0xb9fbc0,
    0x98f5e1,
    0x8eecf5,
    0x90dbf4,
    0xcfbaf0,
    0xf1c0e8,
    0xffcfd2,
    0xfde4cf,
    0xfbf8cc,
    0xea1e62,
    WorldColors.A,
    WorldColors.B,
    WorldColors.C,
    WorldColors.D,
    WorldColors.E,
  ];

  constructor() {
    super();
    // Set PIXI Background icon
    const backgroundSprite = new Sprite(Texture.from('pixi'));
    backgroundSprite.anchor.set(0.5, 0.5);
    backgroundSprite.position.set(Manager.width / 2, Manager.height / 2);
    this.addChild(backgroundSprite);

    //Sprite array for GSAP animations
    this.spriteArray = [];
    this.squareWidth = Manager.width / this.amtSquaresX;
    this.squareHeight = Manager.height / this.amtSquaresY;

    for (let x = 0; x < this.amtSquaresX; x++) {
      for (let y = 0; y < this.amtSquaresY; y++) {
        const sprite = new Sprite(Texture.WHITE);
        sprite.tint = 0xea1e62;
        sprite.scale.set(this.spriteScale);
        sprite.width = this.squareWidth;
        sprite.height = this.squareHeight;
        sprite.position.set(x * sprite.width, y * sprite.height);

        this.spriteArray.push(sprite);
        this.addChild(sprite);
      }
    }
    //start animations
    // this.animationController();
    this.animationController();
  }

  animationController() {
    const amtAnimations = 4;
    const animationSelection = Math.floor(Math.random() * amtAnimations);

    if (animationSelection == 0) this.animationA();
    else if (animationSelection == 1) this.animationB();
    else if (animationSelection == 2) this.animationC();
    else this.animationD();
  }

  animationA() {
    gsap
      .to(this.spriteArray, {
        pixi: {
          // scale: this.spriteScale,
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
          // scale: this.spriteScale,
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
          // scale: this.spriteScale,
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
      pixi: {},
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
        alpha: 1,
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
}
