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

  
  try {

        const saved = localStorage.getItem("MREMap");
          const designData = JSON.parse(saved);
          if (!designData.grid || typeof designData.grid !== 'object') {
            throw new Error('无效的设计文件格式');
          }
          grid = {};
          for (const [key, comp] of Object.entries(designData.grid)) {
            const [x, y] = key.split(',').map(Number);
            if (x >= 0 && x < canvasSize && y >= 0 && y < canvasSize && comp !== 'air') {
              grid[key] = comp;
            }
          }
          if (designData.scale) canvasScale = designData.scale;
          if (designData.offsetX) offsetX = designData.offsetX;
          if (designData.offsetY) offsetY = designData.offsetY;
          updateStatusBar();
          updateZoomDisplay();
          closeAllModals();
          hasChanges = false;
          statusElement.innerHTML = '<i class="fas fa-check-circle"></i> 设计导入成功！';
        } catch (error) {
          statusElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> 错误: ${error.message}`;
          displayError(`loadDesign parse error: ${error.message}`);
        }
      };
      reader.onerror = function() {
        statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> 读取文件时出错';
        displayError('loadDesign file read error');
      };
      reader.readAsText(file);
  } catch (error) {
    displayError(`loadDesign error: ${error.message}`);
  }
}

window.addEventListener('DOMContentLoaded', init);

window.addEventListener("beforeunload", () => {
    const designData = {
      name: “”,
      description: “”,
      grid: grid,
      timestamp: new Date().toISOString(),
      scale: canvasScale,
      offsetX: offsetX,
      offsetY: offsetY
    };
    const jsonData = JSON.stringify(designData);
  localStorage.setItem("MREMap", JSON.stringify(jsonData)); 
});
