import './style.css';
import Keyboard from './Keyboard';
import { Manager } from './Manager';
import LoadingScene from './LoadingScene';
import { IScene } from './Manager';

// Keyboard.initialize(); uncomment if you need to use the keyboard
Manager.initialize();
const scene: IScene = new LoadingScene();

Manager.changeScene(scene);
Manager.resize();
