import { AssetsManifest } from 'pixi.js';

export const manifest: AssetsManifest = {
  bundles: [
    {
      name: 'fonts',
      assets: {
        arcade: '/fonts/ArcadeClassic.ttf',
        arcade_out: '/fonts/8-bit_Arcade_Out.ttf',
      },
    },
    {
      name: 'icons',
      assets: {
        pixi: '/icons/pixijs-icon.svg',
      },
    },
    {
      name: 'orbs',
      assets: {
        Orb_07: '/orbs/Orb_07.png',
        Orb_08: '/orbs/Orb_08.png',
        Orb_09: '/orbs/Orb_09.png',
        Orb_10: '/orbs/Orb_10.png',
        Orb_11: '/orbs/Orb_11.png',
      },
    },
    {
      name: 'planets',
      assets: {
        planet00: '/orbs/planet00.png',
        planet01: '/orbs/planet01.png',
        planet02: '/orbs/planet02.png',
        planet03: '/orbs/planet03.png',
        planet04: '/orbs/planet04.png',
        planet05: '/orbs/planet05.png',
        planet06: '/orbs/planet06.png',
        planet07: '/orbs/planet07.png',
        planet08: '/orbs/planet08.png',
        planet09: '/orbs/planet09.png',
      },
    },
    {
      name: 'magic',
      assets: {
        magic01: 'magic/1.png',
        magic02: 'magic/2.png',
        magic03: 'magic/3.png',
        magic04: 'magic/4.png',
        magic05: 'magic/5.png',
        magic06: 'magic/6.png',
        magic07: 'magic/7.png',
        magic08: 'magic/8.png',
      },
    },
    {
      name: 'characters',
      assets: {
        red_body_square: '/characters/red_body_square.png',
        green_body_circle: '/characters/green_body_circle.png',
      },
    },
    {
      name: 'sand',
      assets: {
        sand: '/sand/sand.png',
      },
    },
  ],
};
