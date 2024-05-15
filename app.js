import { Grid } from './grid.js';
import { Tile } from './tile.js';

const gameBoard = document.querySelector('.game-board');

const grid = new Grid(gameBoard);
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
