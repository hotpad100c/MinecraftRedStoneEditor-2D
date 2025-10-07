function setBlock(gridX, gridY, selectedComponent){
  if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
    const key = `${gridX},${gridY}`;
    if (grid[key] === selectedComponent) {
        delete grid[key];
    } else if (selectedComponent !== 'air') {
        grid[key] = selectedComponent;
    }
    checkConnectedPlacement(gridX, gridY, selectedComponent);
    hasChanges = true;
    updateStatusBar();
  }
}
function checkConnectedPlacement(x,y,block){
  
}
