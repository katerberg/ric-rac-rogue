import './index.scss';
import './start-screen.scss';
import './how-to-play.scss';
import './credits.scss';
import {Howl} from 'howler';
import {Game} from './classes/Game';
import {isDebug, skipMenu} from './environment';

let menuSound: Howl | undefined;
let gameSound: Howl;

function openCredits(): void {
  const startScreen = document.getElementById('start-screen');
  const creditsScreen = document.getElementById('credits-screen');
  if (startScreen && creditsScreen) {
    startScreen.classList.remove('visible');
    creditsScreen.classList.add('visible');
  }
}
function openHowToPlay(): void {
  const startScreen = document.getElementById('start-screen');
  const howToPlayScreen = document.getElementById('how-to-play-screen');
  if (startScreen && howToPlayScreen) {
    startScreen.classList.remove('visible');
    howToPlayScreen.classList.add('visible');
  }
}

function closeEndScreen(): void {
  const startScreen = document.getElementById('start-screen');
  const endScreen = document.getElementById('end-screen');
  if (startScreen && endScreen) {
    startScreen.classList.add('visible');
    endScreen.classList.remove('visible');
  }
}
function closeHowToPlay(): void {
  const startScreen = document.getElementById('start-screen');
  const howToPlayScreen = document.getElementById('how-to-play-screen');
  if (startScreen && howToPlayScreen) {
    startScreen.classList.add('visible');
    howToPlayScreen.classList.remove('visible');
  }
}

function closeCredits(): void {
  const startScreen = document.getElementById('start-screen');
  const creditsScreen = document.getElementById('credits-screen');
  if (startScreen && creditsScreen) {
    startScreen.classList.add('visible');
    creditsScreen.classList.remove('visible');
  }
}

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
    import('./assets/game.mp3').then((gameMp3) => {
      if (!gameSound) {
        gameSound = new Howl({
          src: [gameMp3],
          loop: true,
          autoplay: true,
        });
      }
      gameSound.fade(0, 1, 1000);
      menuSound?.fade(1, 0, 3000);
    });

    startScreen.classList.remove('visible');
    topBar.classList.add('visible');
    sidebar.classList.add('visible');
    const gameEndCallback = (): void => {
      gameSound.fade(1, 0, 4000);
      menuSound?.fade(0, 1, 2000);
    };
    new Game(gameEndCallback).start();
  }
}

function bindClickListeners(): void {
  const startGameButton = document.getElementById('start-game-button');
  const creditsButton = document.getElementById('credits-button');
  const creditsCloseButton = document.getElementById('credits-close-button');
  const endScreenCloseButton = document.getElementById('end-screen-close-button');
  const howToPlayButton = document.getElementById('how-to-play-button');
  const howToPlayCloseButton = document.getElementById('how-to-play-close-button');
  if (
    startGameButton &&
    creditsButton &&
    creditsCloseButton &&
    howToPlayCloseButton &&
    endScreenCloseButton &&
    howToPlayButton
  ) {
    startGameButton.addEventListener('click', startNewGame);
    creditsButton.addEventListener('click', openCredits);
    howToPlayButton.addEventListener('click', openHowToPlay);
    creditsCloseButton.addEventListener('click', closeCredits);
    endScreenCloseButton.addEventListener('click', closeEndScreen);
    howToPlayCloseButton.addEventListener('click', closeHowToPlay);
  }
}

window.addEventListener('load', () => {
  if (!menuSound) {
    import('./assets/menu.mp3').then((menuMp3) => {
      menuSound = new Howl({
        src: [menuMp3],
        loop: true,
        autoplay: true,
      });
    });
  }
  bindClickListeners();
  if (skipMenu()) {
    startNewGame();
  } else if (isDebug('credits')) {
    openCredits();
  } else {
    openStartMenu();
  }
});
