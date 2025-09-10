import './style.css';
import Keyboard from './Keyboard';
import { Manager, IScene } from './Manager';
import LoadingScene from './LoadingScene';
import * as RAPIER from '@dimforge/rapier2d-compat';

// Keyboard.initialize(); uncomment if you need to use the keyboard
//because RAPIER uses WASM it needs to be loaded before use
RAPIER.init().then(async () => {  // ← Make this async
  await Manager.initialize();     // ← Await the initialization
  const scene: IScene = new LoadingScene();
  Manager.changeScene(scene);
});



window.addEventListener('resize', () => {
  location.reload(); //lazy fix...
});
