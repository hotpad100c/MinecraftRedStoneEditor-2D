const canvasSize = 64; // 64x64网格
const tileSize = 30; // 每个网格30像素
let grid = {}; // 稀疏矩阵，键为"x,y"，值为组件ID
let selectedComponent = 'air';
let canvasScale = 1.0; // 初始缩放100%
let offsetX = 0, offsetY = 0;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let touchStartTime = null; // 触摸开始时间
let initialTouchDistance = null; // 初始两指距离
let initialCanvasScale = null; // 初始缩放比例
let touchCenterX = null, touchCenterY = null; // 两指中心点
let images = {}; // 存储所有组件图像
let canvas, ctx;
let hasChanges = false; // 跟踪是否有未保存的更改
let animationFrameId;
let isResourceLoaded = false;

// 显示错误到页面
function displayError(message) {
  const errorDisplay = document.getElementById('error-display');
  const errorMessages = document.getElementById('error-messages');
  if (!errorDisplay || !errorMessages) {
    console.error('Error display elements not found');
    return;
  }
  errorDisplay.style.display = 'block';
  const errorDiv = document.createElement('div');
  errorDiv.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  errorMessages.appendChild(errorDiv);
  // 限制错误数量
  if (errorMessages.children.length > 10) {
    errorMessages.removeChild(errorMessages.firstChild);
  }
}

// 初始化画布
function initCanvas() {
  try {
    canvas = document.getElementById('canvas');
    if (!canvas) throw new Error('Canvas element not found');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    resizeCanvas();
    setupCanvasEventListeners();
    render();
  } catch (error) {
    displayError(`initCanvas error: ${error.message}`);
  }
}

// 调整画布大小
function resizeCanvas() {
  try {
    const container = document.getElementById('canvas-container');
    if (!container) throw new Error('Canvas container not found');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  } catch (error) {
    displayError(`resizeCanvas error: ${error.message}`);
  }
}

// 绘制网格
function drawGrid() {
  try {
    const gridLineColor = getComputedStyle(document.documentElement).getPropertyValue('--grid-line').trim() || '#d1dbe6';
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1 / canvasScale;
    ctx.globalAlpha = 0.7;
    const visibleStartX = Math.max(0, Math.floor((-offsetX / canvasScale) / tileSize) - 1);
    const visibleEndX = Math.min(canvasSize, Math.ceil((canvas.width - offsetX) / (tileSize * canvasScale)) + 1);
    const visibleStartY = Math.max(0, Math.floor((-offsetY / canvasScale) / tileSize) - 1);
    const visibleEndY = Math.min(canvasSize, Math.ceil((canvas.height - offsetY) / (tileSize * canvasScale)) + 1);
    ctx.beginPath();
    for (let x = visibleStartX; x <= visibleEndX; x++) {
      const pixelX = x * tileSize;
      ctx.moveTo(pixelX, visibleStartY * tileSize);
      ctx.lineTo(pixelX, visibleEndY * tileSize);
    }
    for (let y = visibleStartY; y <= visibleEndY; y++) {
      const pixelY = y * tileSize;
      ctx.moveTo(visibleStartX * tileSize, pixelY);
      ctx.lineTo(visibleEndX * tileSize, pixelY);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  } catch (error) {
    displayError(`drawGrid error: ${error.message}`);
  }
}

// 渲染循环
function render() {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(canvasScale, canvasScale);
    drawGrid();
    const visibleStartX = Math.max(0, Math.floor((-offsetX / canvasScale) / tileSize) - 1);
    const visibleEndX = Math.min(canvasSize, Math.ceil((canvas.width - offsetX) / (tileSize * canvasScale)) + 1);
    const visibleStartY = Math.max(0, Math.floor((-offsetY / canvasScale) / tileSize) - 1);
    const visibleEndY = Math.min(canvasSize, Math.ceil((canvas.height - offsetY) / (tileSize * canvasScale)) + 1);
    for (const [key, compId] of Object.entries(grid)) {
      const [x, y] = key.split(',').map(Number);
      if (x >= visibleStartX && x < visibleEndX && y >= visibleStartY && y < visibleEndY && images[compId]) {
        const img = images[compId];
        ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
    ctx.restore();
    animationFrameId = requestAnimationFrame(render);
  } catch (error) {
    displayError(`render error: ${error.message}`);
    cancelAnimationFrame(animationFrameId);
  }
}

// 设置画布事件监听器
function setupCanvasEventListeners() {
  try {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleMouseWheel);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', resizeCanvas);
  } catch (error) {
    displayError(`setupCanvasEventListeners error: ${error.message}`);
  }
}

// 鼠标按下事件
function handleMouseDown(e) {
  try {
    if (e.button === 1 || e.button === 2) {
      isDragging = true;
      dragStartX = e.clientX - offsetX;
      dragStartY = e.clientY - offsetY;
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
      return;
    }
    if (e.button === 0) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
      const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
      if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
        const key = `${gridX},${gridY}`;
        if (grid[key] === selectedComponent) {
          delete grid[key];
        } else if (selectedComponent !== 'air') {
          grid[key] = selectedComponent;
        }
        hasChanges = true;
        updateStatusBar();
      }
    }
  } catch (error) {
    displayError(`handleMouseDown error: ${error.message}`);
  }
}

// 鼠标移动事件
function handleMouseMove(e) {
  try {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
    const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
    if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
      document.querySelector('#cursor-position span').textContent = `坐标: ${gridX},${gridY}`;
    } else {
      document.querySelector('#cursor-position span').textContent = `坐标: 0,0`;
    }
    if (isDragging) {
      offsetX = e.clientX - dragStartX;
      offsetY = e.clientY - dragStartY;
    }
  } catch (error) {
    displayError(`handleMouseMove error: ${error.message}`);
  }
}

// 鼠标释放事件
function handleMouseUp(e) {
  try {
    isDragging = false;
    canvas.style.cursor = 'default';
  } catch (error) {
    displayError(`handleMouseUp error: ${error.message}`);
  }
}

// 触摸开始事件
function handleTouchStart(e) {
  try {
    e.preventDefault();
    const touches = e.touches;
    const rect = canvas.getBoundingClientRect();
    touchStartTime = Date.now();
    if (touches.length === 1) {
      isDragging = true;
      dragStartX = touches[0].clientX - offsetX;
      dragStartY = touches[0].clientY - offsetY;
      canvas.style.cursor = 'grabbing';
    } else if (touches.length === 2) {
      isDragging = false;
      const touch1 = touches[0];
      const touch2 = touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      initialTouchDistance = Math.sqrt(dx * dx + dy * dy);
      initialCanvasScale = canvasScale;
      touchCenterX = centerX;
      touchCenterY = centerY;
    }
    // 单点点击放置组件
    if (touches.length === 1) {
      const x = touches[0].clientX - rect.left;
      const y = touches[0].clientY - rect.top;
      const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
      const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
      if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
        touchPending = { gridX, gridY }; // 记录待处理的点击
      }
    }
  } catch (error) {
    displayError(`handleTouchStart error: ${error.message}`);
  }
}

// 触摸移动事件
function handleTouchMove(e) {
  try {
    e.preventDefault();
    const touches = e.touches;
    const rect = canvas.getBoundingClientRect();
    if (touches.length === 1 && isDragging) {
      offsetX = touches[0].clientX - dragStartX;
      offsetY = touches[0].clientY - dragStartY;
      const x = touches[0].clientX - rect.left;
      const y = touches[0].clientY - rect.top;
      const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
      const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
      if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
        document.querySelector('#cursor-position span').textContent = `坐标: ${gridX},${gridY}`;
      } else {
        document.querySelector('#cursor-position span').textContent = `坐标: 0,0`;
      }
    } else if (touches.length === 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleChange = currentDistance / initialTouchDistance;
      const newScale = initialCanvasScale * scaleChange;
      canvasScale = Math.max(0.1, Math.min(2.0, newScale));
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      const canvasX = centerX - rect.left;
      const canvasY = centerY - rect.top;
      const gridCenterX = (canvasX - offsetX) / (tileSize * initialCanvasScale);
      const gridCenterY = (canvasY - offsetY) / (tileSize * initialCanvasScale);
      offsetX = canvasX - gridCenterX * tileSize * canvasScale;
      offsetY = canvasY - gridCenterY * tileSize * canvasScale;
      updateZoomDisplay();
    }
  } catch (error) {
    displayError(`handleTouchMove error: ${error.message}`);
  }
}

// 触摸结束事件
function handleTouchEnd(e) {
  try {
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 200 && touchPending) {
      const { gridX, gridY } = touchPending;
      const key = `${gridX},${gridY}`;
      if (grid[key] === selectedComponent) {
        delete grid[key];
      } else if (selectedComponent !== 'air') {
        grid[key] = selectedComponent;
      }
      hasChanges = true;
      updateStatusBar();
    }
    isDragging = false;
    canvas.style.cursor = 'default';
    initialTouchDistance = null;
    initialCanvasScale = null;
    touchCenterX = null;
    touchCenterY = null;
    touchPending = null;
    touchStartTime = null;
  } catch (error) {
    displayError(`handleTouchEnd error: ${error.message}`);
  }
}

// 鼠标滚轮事件（缩放）
function handleMouseWheel(e) {
  try {
    e.preventDefault();
    const zoomAmount = e.deltaY > 0 ? -0.1 : 0.1;
    zoomCanvas(zoomAmount, e.clientX, e.clientY);
  } catch (error) {
    displayError(`handleMouseWheel error: ${error.message}`);
  }
}

// 缩放画布
function zoomCanvas(zoomAmount, centerX, centerY) {
  try {
    const oldScale = canvasScale;
    canvasScale = Math.max(0.1, Math.min(2.0, canvasScale + zoomAmount));
    const rect = canvas.getBoundingClientRect();
    if (!centerX) centerX = rect.left + canvas.width / 2;
    if (!centerY) centerY = rect.top + canvas.height / 2;
    const canvasX = centerX - rect.left;
    const canvasY = centerY - rect.top;
    const gridCenterX = (canvasX - offsetX) / (tileSize * oldScale);
    const gridCenterY = (canvasY - offsetY) / (tileSize * oldScale);
    offsetX = canvasX - gridCenterX * tileSize * canvasScale;
    offsetY = canvasY - gridCenterY * tileSize * canvasScale;
    updateZoomDisplay();
  } catch (error) {
    displayError(`zoomCanvas error: ${error.message}`);
  }
}

// 重置画布位置和缩放
function resetCanvasPosition() {
  try {
    canvasScale = 1.0;
    const container = document.getElementById('canvas-container');
    const canvasWidth = canvasSize * tileSize * canvasScale;
    const canvasHeight = canvasSize * tileSize * canvasScale;
    offsetX = (container.clientWidth - canvasWidth) / 2;
    offsetY = (container.clientHeight - canvasHeight) / 2;
    updateZoomDisplay();
  } catch (error) {
    displayError(`resetCanvasPosition error: ${error.message}`);
  }
}

// 更新缩放显示
function updateZoomDisplay() {
  try {
    document.querySelector('#canvas-scale span').textContent = `${Math.round(canvasScale * 100)}%`;
  } catch (error) {
    displayError(`updateZoomDisplay error: ${error.message}`);
  }
}

// 加载组件面板
function loadComponents() {
  try {
    const componentsList = document.getElementById('components-list');
    if (!componentsList) throw new Error('Components list element not found');
    componentsList.innerHTML = '';
    for (const [category, comps] of Object.entries(components)) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category';
      categoryDiv.dataset.category = category;
      const title = document.createElement('h3');
      const icon = document.createElement('i');
      if (category === "基础方块") icon.className = "fas fa-cube";
      else if (category === "机械元件") icon.className = "fas fa-cogs";
      else if (category === "装饰方块") icon.className = "fas fa-paint-brush";
      else if (category === "特殊方块") icon.className = "fas fa-star";
      title.appendChild(icon);
      title.appendChild(document.createTextNode(category));
      categoryDiv.appendChild(title);
      const gridDiv = document.createElement('div');
      gridDiv.className = 'components-grid';
      comps.forEach(compData => {
        const compDiv = document.createElement('div');
        compDiv.className = 'component';
        compDiv.dataset.id = compData.id;
        compDiv.dataset.name = compData.name;
        compDiv.dataset.pinyin = compData.pinyin;
        if (images[compData.id]) {
          compDiv.innerHTML = `<img src="${images[compData.id].src}" alt="${compData.id}">`;
        } else {
          compDiv.innerHTML = `<div style="width:30px;height:30px;background:#eee;display:flex;align-items:center;justify-content:center;color:#888;font-size:10px;">${compData.id}</div>`;
        }
        compDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          selectComponent(compData.id);
        });
        gridDiv.appendChild(compDiv);
      });
      categoryDiv.appendChild(gridDiv);
      componentsList.appendChild(categoryDiv);
    }
    selectComponent('air');
  } catch (error) {
    displayError(`loadComponents error: ${error.message}`);
  }
}

// 选择组件
function selectComponent(id) {
  try {
    selectedComponent = id;
    document.querySelectorAll('.component').forEach(comp => {
      comp.classList.toggle('selected', comp.dataset.id === id);
    });
    const compData = getAllComponents().find(c => c.id === id);
    document.querySelector('#current-component span').textContent = compData ? compData.name : id;
    updateStatusBar();
  } catch (error) {
    displayError(`selectComponent error: ${error.message}`);
  }
}

// 获取所有组件（扁平化）
function getAllComponents() {
  try {
    return Object.values(components).flat();
  } catch (error) {
    displayError(`getAllComponents error: ${error.message}`);
    return [];
  }
}

// 更新状态栏
function updateStatusBar() {
  try {
    const placedCount = Object.keys(grid).length;
    document.querySelector('#block-count span').textContent = `已放置: ${placedCount} 个组件`;
  } catch (error) {
    displayError(`updateStatusBar error: ${error.message}`);
  }
}

// 设置主题切换
function setupDayNightToggle() {
  try {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    const themeDisplay = document.querySelector('#theme-display span');
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isLight = !document.body.classList.contains('theme-dark');
      if (isLight) {
        document.body.classList.add('theme-dark');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = '主题';
        themeDisplay.textContent = '夜间模式';
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('theme-dark');
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = '主题';
        themeDisplay.textContent = '日间模式';
        localStorage.setItem('theme', 'light');
      }
    });
  } catch (error) {
    displayError(`setupDayNightToggle error: ${error.message}`);
  }
}

// 从本地存储加载主题
function loadThemeFromStorage() {
  try {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    const themeDisplay = document.querySelector('#theme-display span');
    if (savedTheme === 'dark') {
      document.body.classList.add('theme-dark');
      themeIcon.className = 'fas fa-sun';
      themeText.textContent = '主题';
      themeDisplay.textContent = '夜间模式';
    } else {
      document.body.classList.remove('theme-dark');
      themeIcon.className = 'fas fa-moon';
      themeText.textContent = '主题';
      themeDisplay.textContent = '日间模式';
    }
  } catch (error) {
    displayError(`loadThemeFromStorage error: ${error.message}`);
  }
}

// 设置缩放控制
function setupZoomControls() {
  try {
    document.getElementById('zoom-out').addEventListener('click', (e) => {
      e.stopPropagation();
      zoomCanvas(-0.1);
    });
    document.getElementById('zoom-in').addEventListener('click', (e) => {
      e.stopPropagation();
      zoomCanvas(0.1);
    });
    document.getElementById('zoom-reset').addEventListener('click', (e) => {
      e.stopPropagation();
      resetCanvasPosition();
    });
  } catch (error) {
    displayError(`setupZoomControls error: ${error.message}`);
  }
}

// 组件搜索功能
function filterComponents() {
  try {
    const searchTerm = document.getElementById('component-search').value.trim().toLowerCase();
    const categories = document.querySelectorAll('.category');
    const allComponents = getAllComponents();
    if (!searchTerm) {
      categories.forEach(category => {
        category.style.display = 'block';
        const components = category.querySelectorAll('.component');
        components.forEach(comp => {
          comp.style.display = 'flex';
        });
      });
      return;
    }
    categories.forEach(category => {
      const comps = category.querySelectorAll('.component');
      let hasVisible = false;
      comps.forEach(comp => {
        const id = comp.dataset.id;
        const name = comp.dataset.name;
        const pinyin = comp.dataset.pinyin;
        const matchId = id.toLowerCase().includes(searchTerm);
        const matchName = name.toLowerCase().includes(searchTerm);
        const matchPinyin = pinyin.toLowerCase().includes(searchTerm);
        const pinyinInitials = pinyin.split('').filter(char => /[a-z]/.test(char) && !/[aeiouv]/.test(char)).join('');
        const matchInitials = pinyinInitials.toLowerCase().includes(searchTerm);
        if (matchId || matchName || matchPinyin || matchInitials) {
          comp.style.display = 'flex';
          hasVisible = true;
        } else {
          comp.style.display = 'none';
        }
      });
      category.style.display = hasVisible ? 'block' : 'none';
    });
  } catch (error) {
    displayError(`filterComponents error: ${error.message}`);
  }
}

// 设置事件监听器
function setupEventListeners() {
  try {
    document.getElementById('clear-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openClearConfirmModal();
    });
    document.getElementById('save-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openSaveModal();
    });
    document.getElementById('load-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openLoadModal();
    });
    document.getElementById('help-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openHelpModal();
    });
    document.getElementById('component-search').addEventListener('input', (e) => {
      e.stopPropagation();
      filterComponents();
    });
    setupZoomControls();
    setupDayNightToggle();
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    });
    document.getElementById('confirm-save').addEventListener('click', saveDesign);
    document.getElementById('confirm-load').addEventListener('click', loadDesign);
    document.getElementById('confirm-clear').addEventListener('click', clearCanvas);
    document.getElementById('reload-btn').addEventListener('click', () => {
      location.reload();
    });
    const fileDropArea = document.getElementById('file-drop-area');
    const fileInput = document.getElementById('load-file');
    fileDropArea.addEventListener('click', () => {
      fileInput.click();
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        document.getElementById('load-status').innerHTML = `<i class="fas fa-check-circle"></i> 已选择文件: ${fileInput.files[0].name}`;
      }
    });
    fileDropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropArea.classList.add('drag-over');
    });
    fileDropArea.addEventListener('dragleave', () => {
      fileDropArea.classList.remove('drag-over');
    });
    fileDropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropArea.classList.remove('drag-over');
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        document.getElementById('load-status').innerHTML = `<i class="fas fa-check-circle"></i> 已选择文件: ${fileInput.files[0].name}`;
      }
    });
    document.addEventListener('contextmenu', (e) => {
      if (e.target.id === 'canvas') {
        e.preventDefault();
      }
    });
  } catch (error) {
    displayError(`setupEventListeners error: ${error.message}`);
  }
}

// 打开保存模态框
function openSaveModal() {
  try {
    document.getElementById('save-modal').classList.add('show');
    document.getElementById('save-modal').style.display = 'flex';
  } catch (error) {
    displayError(`openSaveModal error: ${error.message}`);
  }
}

// 打开导入模态框
function openLoadModal() {
  try {
    document.getElementById('load-modal').classList.add('show');
    document.getElementById('load-modal').style.display = 'flex';
    document.getElementById('load-status').innerHTML = '<i class="fas fa-info-circle"></i> 请选择或拖放JSON设计文件';
  } catch (error) {
    displayError(`openLoadModal error: ${error.message}`);
  }
}

// 打开清空确认模态框
function openClearConfirmModal() {
  try {
    document.getElementById('clear-confirm-modal').classList.add('show');
    document.getElementById('clear-confirm-modal').style.display = 'flex';
  } catch (error) {
    displayError(`openClearConfirmModal error: ${error.message}`);
  }
}

// 打开帮助模态框
function openHelpModal() {
  try {
    document.getElementById('help-modal').classList.add('show');
    document.getElementById('help-modal').style.display = 'flex';
  } catch (error) {
    displayError(`openHelpModal error: ${error.message}`);
  }
}

// 关闭所有模态框
function closeAllModals() {
  try {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    });
  } catch (error) {
    displayError(`closeAllModals error: ${error.message}`);
  }
}

// 清空画布
function clearCanvas() {
  try {
    grid = {};
    updateStatusBar();
    hasChanges = true;
    closeAllModals();
  } catch (error) {
    displayError(`clearCanvas error: ${error.message}`);
  }
}

// 保存设计
function saveDesign() {
  try {
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
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designName.replace(/\s+/g, '_')}_红石设计.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    closeAllModals();
    document.getElementById('design-name').value = '';
    document.getElementById('design-description').value = '';
    hasChanges = false;
  } catch (error) {
    displayError(`saveDesign error: ${error.message}`);
  }
}

// 导入设计
function loadDesign() {
  try {
    const fileInput = document.getElementById('load-file');
    const statusElement = document.getElementById('load-status');
    if (!fileInput.files.length) {
      statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> 请选择设计文件';
      return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const designData = JSON.parse(e.target.result);
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

// 预加载所有组件图片
function preloadResources() {
  try {
    const allComponents = getAllComponents();
    const progressBar = document.getElementById('progress-bar');
    const loaderText = document.querySelector('.loader-text');
    let loadedCount = 0;
    const totalCount = allComponents.length;

    function updateProgress() {
      loadedCount++;
      const progress = (loadedCount / totalCount) * 100;
      progressBar.style.width = `${progress}%`;
      loaderText.textContent = `正在加载红石组件资源... (${loadedCount}/${totalCount})`;
    }

    function checkAllResourcesLoaded() {
      if (loadedCount === totalCount) {
        isResourceLoaded = true;
        setTimeout(() => {
          document.getElementById('resource-loader').style.opacity = '0';
          setTimeout(() => {
            document.getElementById('resource-loader').style.display = 'none';
            loadComponents();
            initCanvas();
          }, 500);
        }, 300);
        const missingResources = allComponents.filter(c => !images[c.id]);
        if (missingResources.length > 0) {
          document.getElementById('resource-error').style.display = 'flex';
          document.getElementById('resource-loader').style.display = 'none';
          displayError(`Failed to load resources: ${missingResources.map(c => c.id).join(', ')}`);
        }
      }
    }

    function tryLoadImage(comp, formats, index = 0) {
      if (index >= formats.length) {
        console.error(`无法加载资源: ${comp.id} (${formats.join(', ')})`);
        images[comp.id] = null;
        updateProgress();
        checkAllResourcesLoaded();
        return;
      }
      const format = formats[index];
      const img = new Image();
      img.onload = () => {
        images[comp.id] = img;
        updateProgress();
        checkAllResourcesLoaded();
      };
      img.onerror = () => {
        tryLoadImage(comp, formats, index + 1);
      };
      img.src = `assets/${comp.id}.${format}`;
    }

    allComponents.forEach(comp => {
      tryLoadImage(comp, ['webp', 'png', 'jpg']); // 格式支持
    });
  } catch (error) {
    displayError(`preloadResources error: ${error.message}`);
  }
}
// 处理页面关闭事件
function handleBeforeUnload(e) {
  if (hasChanges) {
    const confirmationMessage = '您有未保存的更改，确定要离开吗？';
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }
}

// 初始化
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

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);
