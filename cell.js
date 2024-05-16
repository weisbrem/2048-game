export class Cell {
  constructor(gridElement, x, y) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    gridElement.append(cell);
    this.x = x;
    this.y = y;
  }

  linkTile(tile) {
    tile.setXY(this.x, this.y);
    this.linkedTile = tile;
  }

  unlinkTile() {
    this.linkedTile = null;
  }

  linkTileForMerge(tile) {
    tile.setXY(this.x, this.y);
    this.linkedTileForMerge = tile;
  }

  hasTileForMerge() {
    return !!this.linkedTileForMerge;
  }

  canAccept(newTile) {
    return this.isEmpty() || (!this.hasTileForMerge() && this.linkedTile.value === newTile.value);
  }

  isEmpty() {
    return !this.linkedTile;
  }

  unlinkTileForMerge() {
    this.linkedTileForMerge = null;
  }

  mergeTiles() {
    this.linkedTile.setValue(this.linkedTile.value + this.linkedTileForMerge.value);
    this.linkedTileForMerge.removeFromDOM();
    this.unlinkTileForMerge();
  }
}
