import { Grid } from './grid.js';
import { Tile } from './tile.js';

const gameBoard = document.querySelector('.game-board');

const grid = new Grid(gameBoard);
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));

setupInputOnce();

function setupInputOnce() {
  window.addEventListener('keydown', handleInput, { once: true });
}

async function handleInput(evt) {
  switch (evt.key) {
    case 'ArrowLeft':
      await moveLeft();
      break;
    case 'ArrowRight':
      await moveRight();
      break;
    case 'ArrowUp':
      await moveUp();
      break;
    case 'ArrowDown':
      await moveDown();
      break;
    default:
      setupInputOnce();
      return;
  }

  const newTile = new Tile(gameBoard);
  grid.getRandomEmptyCell().linkTile(newTile);

  setupInputOnce();
}

async function moveUp() {
  await slideTiles(grid.cellsGroupedByColumn);
}

async function moveDown() {
  await slideTiles(grid.cellsGroupedByReversedColumn);
}

async function moveLeft() {
  await slideTiles(grid.cellsGroupedByRow);
}

async function moveRight() {
  await slideTiles(grid.cellsGroupedByReversedRow);
}

async function slideTiles(groupedCells) {
  const promises = [];

  groupedCells.forEach((group) => slideTilesInGroup(group, promises));

  await Promise.all(promises);

  grid.cells.forEach((cell) => {
    cell.hasTileForMerge() && cell.mergeTiles();
  });
}

function slideTilesInGroup(group, promises) {
  for (let i = 0; i < group.length; i++) {
    if (group[i].isEmpty()) {
      continue;
    }

    const cellWithTile = group[i];

    let targetCell = null;
    let j = i - 1;

    while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
      targetCell = group[j];
      j--;
    }

    if (!targetCell) {
      continue;
    }

    promises.push(cellWithTile.linkedTile.waitForTransitionEnd());

    if (targetCell.isEmpty()) {
      targetCell.linkTile(cellWithTile.linkedTile);
    } else {
      targetCell.linkTileForMerge(cellWithTile.linkedTile);
    }

    cellWithTile.unlinkTile();
  }
}
