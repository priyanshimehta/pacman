import { LEVEL, OBJECT_TYPE } from "./setup";
import GameBoard from './GameBoard';
import Pacman from "./Pacman";
import Ghost from "./Ghost";
import { randomMovement } from "./ghostMove";

//elements
const gameGrid = document.querySelector('#game');
const startButton = document.querySelector('#start-button');
const scoreTable = document.querySelector('#score');

//constants for the game
const GLOBAL_SPEED = 80;//ms
const POWER_PILL_TIME = 10000;//ms
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

//setup initial
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;

function checkCollision(pacman,ghosts){
    const collidedGhost = ghosts.find(ghost=>pacman.pos === ghost.pos);
    if(collidedGhost){
        if(pacman.powerPill){
            gameBoard.removeObject(collidedGhost.pos,[
                OBJECT_TYPE.GHOST,
                OBJECT_TYPE.SCARED,
                collidedGhost.name
            ]);
            collidedGhost.pos = collidedGhost.startPos;
            score+=100;
        }else{
            gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
            gameBoard.rotateDiv(pacman.pos,0);
            gameOver(pacman,gameGrid);
        }
    }
}
function gameLoop(pacman, ghosts){
    gameBoard.moveCharacter(pacman);
    checkCollision(pacman,ghosts);

    ghosts.forEach(ghost => gameBoard.moveCharacter(ghost));
    checkCollision(pacman,ghosts);

    if(gameBoard.objectExist(pacman.pos,OBJECT_TYPE.DOT)){
        gameBoard.removeObject(pacman.pos,[OBJECT_TYPE.DOT]);
        gameBoard.dotCount--;
        score+=10;
    }
    if(gameBoard.objectExist(pacman.pos,OBJECT_TYPE.PILL)){
        gameBoard.removeObject(pacman.pos,[OBJECT_TYPE.PILL]);
        pacman.powerPill=true;
        score+=50;

        clearTimeout(powerPillTimer);
        powerPillTimer=setTimeout(
            ()=>(pacman.powerPill=false),
            POWER_PILL_TIME
        );
    }

    if(pacman.powerPill!==powerPillActive){
        powerPillActive=pacman.powerPill;
        ghosts.forEach((ghost)=>(ghost.isScared = pacman.powerPill));
    }

    if(gameBoard.dotCount===0){
        gameWin=true;
        gameOver(pacman,ghosts);

    }

    document.addEventListener('keydown', event => {
        if (event.code === 'Space') {
          console.log('speed=10');
          pacman.powerPill=true;
          ghosts.forEach((ghost)=>(ghost.isScared = true));
        }
      })
      document.addEventListener('keyup', event => {
        if (event.code === 'Space') {
          console.log('speed=2');
          pacman.powerPill=false;
          ghosts.forEach((ghost)=>(ghost.isScared = false));
        }
      })
    scoreTable.innerHTML=score;
}
function gameOver(pacman, grid){
    document.removeEventListener('keydown',(e)=>
    pacman.handleKeyInput(e,gameBoard.objectExist)
    );
    gameBoard.showGameStatus(gameWin);
    clearInterval(timer);
    startButton.classList.remove('hide');
}

function startGame(){
    gameWin = false;
    powerPillActive=false;
    score=0;

    startButton.classList.add('hide');
    gameBoard.createGrid(LEVEL);
    let speed=2;
    const pacman = new Pacman(speed,287);
    console.log('speed='+speed);
    gameBoard.addObject(287,[OBJECT_TYPE.PACMAN]);
    document.addEventListener('keydown',(e)=>
    pacman.handleKeyInput(e,gameBoard.objectExist)
    );
    const ghosts = [
        new Ghost(5,188, randomMovement, OBJECT_TYPE.BLINKY),
        new Ghost(4,209, randomMovement, OBJECT_TYPE.PINKY),
        new Ghost(3,230, randomMovement, OBJECT_TYPE.INKY),
        new Ghost(2,251, randomMovement, OBJECT_TYPE.CLYDE)
    ];

    timer=setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}
//init game
 startButton.addEventListener('click', startGame);