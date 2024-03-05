import './index.scss';
import {Game} from './classes/Game';

window.addEventListener('load', () => {
  new Game().start();
});
