const canvasSize = 64; // 64x64
const tileSize = 30; // 像素
let grid = {}; // 稀疏矩阵
let selectedComponent = 'air';
let hasChanges = false;
let isResourceLoaded = false;

function init() {
  try {
    loadThemeFromStorage();
    setupEventListeners();
    preloadResources();
    window.addEventListener('beforeunload', handleBeforeUnload);
    updateStatusBar();
    resetCanvasPosition();
  } catch (error) {
    displayError(`init error: ${error.message}`);
  }
}

window.addEventListener('DOMContentLoaded', init);

window.addEventListener("beforeunload", () => {
    const designName = document.getElementById('design-name').value.trim() || '未命名设计';
    const designDescription = document.getElementById('design-description').value.trim();
    const designData = {
      name: designName,
      description: designDescription,
      grid: grid,
      timestamp: new Date().toISOString(),
      scale: canvasScale,
      offsetX: offsetX,
      offsetY: offsetY
    };
    const jsonData = JSON.stringify(designData);
  localStorage.setItem("MREMap", JSON.stringify(jsonData)); 
});
