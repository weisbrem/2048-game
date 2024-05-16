import { Grid } from './grid.js';
import { Tile } from './tile.js';

const gameBoard = document.querySelector('.game-board');

const grid = new Grid(gameBoard);
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));

setupInputOnce();
setupInput();

let prevX = null;
let prevY = null;

function getDirection(evt, eventType) {
  if (eventType === 'mousemove') {
    let currX = evt.clientX;
    let currY = evt.clientY;

    if (!prevX || !prevY) {
      prevX = currX;
      prevY = currY;
      return;
    }

    let deltaX = currX - prevX;
    let deltaY = currY - prevY;

    prevX = currX;
    prevY = currY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        return 'right';
      }
      if (deltaX < 0) {
        return 'left';
      }
    } else {
      if (deltaY > 0) {
        return 'down';
      }
      if (deltaY < 0) {
        return 'up';
      }
    }
    return;
  }

  const touch = evt.touches[0];

  const currTouchX = touch.clientX;
  const currTouchY = touch.clientY;

  if (!prevX || !prevY) {
    prevX = currTouchX;
    prevY = currTouchY;
    return;
  }

  const deltaX = currTouchX - prevX;
  const deltaY = currTouchY - prevY;

  prevX = currTouchX;
  prevY = currTouchY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      return 'right';
    }
    if (deltaX < 0) {
      return 'left';
    }
  } else {
    if (deltaY > 0) {
      return 'down';
    }
    if (deltaY < 0) {
      return 'up';
    }
  }
}

function setupInputOnce() {
  window.addEventListener('keydown', handleInput, { once: true });
}

function setupInput() {
  window.addEventListener('touchstart', (evt) => {
    prevX = evt.touches[0].clientX;
    prevY = evt.touches[0].clientY;
  });

  window.addEventListener('touchmove', (evt) => {
    const direction = getDirection(evt, 'touchmove');
    console.log('direction', direction);
    if (direction) {
      handleMove(direction);
    }
  });
  window.addEventListener('touchend', () => {
    prevX = null;
    prevY = null;
  });
  window.addEventListener('mousedown', (evt) => {
    prevX = evt.clientX;
    prevY = evt.clientY;
  });
  window.addEventListener('mousemove', (evt) => {
    if (evt.buttons === 1) {
      const direction = getDirection(evt, 'mousemove');
      console.log('direction', direction);
      if (direction) {
        handleMove(direction);
      }
    }
  });
  window.addEventListener('mouseup', () => {
    prevX = null;
    prevY = null;
  });
}

async function handleMove(direction) {
  switch (direction) {
    case 'left':
      if (!canMoveLeft()) {
        setupInput();
        return;
      }

      await moveLeft();
      break;
    case 'right':
      if (!canMoveRight()) {
        setupInput();
        return;
      }

      await moveRight();
      break;
    case 'up':
      if (!canMoveUp()) {
        setupInput();
        return;
      }

      await moveUp();
      break;
    case 'down':
      if (!canMoveDown()) {
        setupInput();
        return;
      }

      await moveDown();
      break;

    default:
      setupInput();
      return;
  }

  const newTile = new Tile(gameBoard);
  grid.getRandomEmptyCell().linkTile(newTile);

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    await newTile.waitForAnimationEnd();

    alert('Try again!');
    return;
  }

  setupInput();
}

async function handleInput(evt) {
  switch (evt.key) {
    case 'ArrowLeft':
      if (!canMoveLeft()) {
        setupInputOnce();
        return;
      }

      await moveLeft();
      break;
    case 'ArrowRight':
      if (!canMoveRight()) {
        setupInputOnce();
        return;
      }

      await moveRight();
      break;
    case 'ArrowUp':
      if (!canMoveUp()) {
        setupInputOnce();
        return;
      }

      await moveUp();
      break;
    case 'ArrowDown':
      if (!canMoveDown()) {
        setupInputOnce();
        return;
      }

      await moveDown();
      break;
    default:
      setupInputOnce();
      return;
  }

  const newTile = new Tile(gameBoard);
  grid.getRandomEmptyCell().linkTile(newTile);

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    await newTile.waitForAnimationEnd();

    alert('Try again!');
    return;
  }

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

function canMoveUp() {
  return canMove(grid.cellsGroupedByColumn);
}

function canMoveDown() {
  return canMove(grid.cellsGroupedByReversedColumn);
}

function canMoveLeft() {
  return canMove(grid.cellsGroupedByRow);
}

function canMoveRight() {
  return canMove(grid.cellsGroupedByReversedRow);
}

function canMove(groupedCells) {
  return groupedCells.some((group) => canMoveInGroup(group));
}

function canMoveInGroup(group) {
  return group.some((cell, index) => {
    if (index === 0) {
      return false;
    }

    if (cell.isEmpty()) {
      return false;
    }

    const targetCell = group[index - 1];
    return targetCell.canAccept(cell.linkedTile);
  });
}
