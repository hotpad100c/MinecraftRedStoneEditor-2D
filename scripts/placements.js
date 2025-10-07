function setBlock(gridX, gridY, selectedComponent){
  const key = `${gridX},${gridY}`;
  if (grid[key] === selectedComponent) {
      delete grid[key];
  } else if (selectedComponent !== 'air') {
      grid[key] = selectedComponent;
  }
  hasChanges = true;
  updateStatusBar();
}
function checkConnectedPlacement(){
  
}
