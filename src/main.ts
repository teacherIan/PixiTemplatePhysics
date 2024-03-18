import './style.css';
import Keyboard from './Keyboard';
import { Manager } from './Manager';
import LoadingScene from './LoadingScene';
import * as RAPIER from '@dimforge/rapier2d-compat';
import { Container } from 'pixi.js';

// Keyboard.initialize(); uncomment if you need to use the keyboard
//because RAPIER uses WASM it needs to be loaded before use
RAPIER.init().then(() => {
  Manager.initialize();
  const scene: Container = new LoadingScene();
  Manager.changeScene(scene);
});
