import './index.scss';
import './start-screen.scss';
import {Game} from './classes/Game';
import {isDebug} from './environment';

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
    startScreen.classList.remove('visible');
    topBar.classList.add('visible');
    sidebar.classList.add('visible');
    new Game().start();
  }
}

function bindClickListeners(): void {
  const startGameButton = document.getElementById('start-game-button');
  if (startGameButton) {
    startGameButton.addEventListener('click', startNewGame);
  }
}

window.addEventListener('load', () => {
  bindClickListeners();
  if (isDebug()) {
    new Game().start();
  } else {
    openStartMenu();
  }
});
