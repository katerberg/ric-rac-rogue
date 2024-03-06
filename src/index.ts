import './index.scss';
import './start-screen.scss';
import {Howl} from 'howler';
import {Game} from './classes/Game';
import {skipMenu} from './environment';

let menuSound: Howl;
let gameSound: Howl;
function openStartMenu(): void {
  const startScreen = document.getElementById('start-screen');
  if (startScreen) {
    startScreen.classList.add('visible');
  }
}

function startNewGame(): void {
  const startScreen = document.getElementById('start-screen');
  const topBar = document.getElementById('top-bar');
  const sidebar = document.getElementById('sidebar');
  if (startScreen && topBar && sidebar) {
    menuSound.fade(1, 0, 3000);
    if (!gameSound) {
      gameSound = new Howl({
        src: ['/assets/game.mp3'],
        loop: true,
      });
      gameSound.play();
    }
    gameSound.fade(0, 1, 1000);

    startScreen.classList.remove('visible');
    topBar.classList.add('visible');
    sidebar.classList.add('visible');
    const gameEndCallback = (): void => {
      gameSound.fade(1, 0, 4000);
      menuSound.fade(0, 1, 2000);
    };
    new Game(gameEndCallback).start();
  }
}

function bindClickListeners(): void {
  const startGameButton = document.getElementById('start-game-button');
  if (startGameButton) {
    startGameButton.addEventListener('click', startNewGame);
  }
}

window.addEventListener('load', () => {
  if (!menuSound) {
    menuSound = new Howl({
      src: ['/assets/menu.mp3'],
      loop: true,
      autoplay: true,
    });
  }
  bindClickListeners();
  if (skipMenu()) {
    startNewGame();
  } else {
    openStartMenu();
  }
});
