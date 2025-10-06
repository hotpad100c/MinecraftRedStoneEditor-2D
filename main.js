import { components } from './components.js';
// 全局变量
const canvasSize = 64; // 64x64网格
const tileSize = 30; // 每个网格30像素
const grid = new Array(canvasSize * canvasSize).fill('air');
let selectedComponent = 'air';
let canvasScale = 1.0; // 初始缩放100%
let offsetX = 0, offsetY = 0;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let images = {}; // 存储所有组件图像
let canvas, ctx;
let hasChanges = false; // 跟踪是否有未保存的更改
let animationFrameId;
let isResourceLoaded = false;

// 初始化画布
function initCanvas() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    // 设置画布尺寸为容器大小
    resizeCanvas();
   
    // 添加事件监听器
    setupCanvasEventListeners();
   
    // 开始渲染循环
    render();
}

// 调整画布大小
function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// 绘制网格
function drawGrid() {
    // 获取网格线颜色
    const gridLineColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--grid-line').trim() || '#d1dbe6';
   
    // 设置网格线样式
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1 / canvasScale; // 根据缩放调整线宽
    ctx.globalAlpha = 0.7; // 半透明效果
   
    // 计算可见区域
    const visibleStartX = Math.max(0, Math.floor((-offsetX / canvasScale) / tileSize) - 1);
    const visibleEndX = Math.min(canvasSize, Math.ceil((canvas.width - offsetX) / (tileSize * canvasScale)) + 1);
    const visibleStartY = Math.max(0, Math.floor((-offsetY / canvasScale) / tileSize) - 1);
    const visibleEndY = Math.min(canvasSize, Math.ceil((canvas.height - offsetY) / (tileSize * canvasScale)) + 1);
   
    ctx.beginPath();
   
    // 绘制垂直线
    for (let x = visibleStartX; x <= visibleEndX; x++) {
        const pixelX = x * tileSize;
        ctx.moveTo(pixelX, visibleStartY * tileSize);
        ctx.lineTo(pixelX, visibleEndY * tileSize);
    }
   
    // 绘制水平线
    for (let y = visibleStartY; y <= visibleEndY; y++) {
        const pixelY = y * tileSize;
        ctx.moveTo(visibleStartX * tileSize, pixelY);
        ctx.lineTo(visibleEndX * tileSize, pixelY);
    }
   
    ctx.stroke();
    ctx.globalAlpha = 1.0; // 恢复不透明度
}

// 渲染循环
function render() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
   
    // 保存当前状态
    ctx.save();
   
    // 应用缩放和平移
    ctx.translate(offsetX, offsetY);
    ctx.scale(canvasScale, canvasScale);
   
    // 绘制网格
    drawGrid();
   
    // 计算可见区域
    const visibleStartX = Math.max(0, Math.floor((-offsetX / canvasScale) / tileSize) - 1);
    const visibleEndX = Math.min(canvasSize, Math.ceil((canvas.width - offsetX) / (tileSize * canvasScale)) + 1);
    const visibleStartY = Math.max(0, Math.floor((-offsetY / canvasScale) / tileSize) - 1);
    const visibleEndY = Math.min(canvasSize, Math.ceil((canvas.height - offsetY) / (tileSize * canvasScale)) + 1);
   
    // 绘制组件
    for (let y = visibleStartY; y < visibleEndY; y++) {
        for (let x = visibleStartX; x < visibleEndX; x++) {
            const index = y * canvasSize + x;
            if (grid[index] !== 'air' && images[grid[index]]) {
                const img = images[grid[index]];
                ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
   
    // 恢复状态
    ctx.restore();
   
    // 继续渲染循环
    animationFrameId = requestAnimationFrame(render);
}

// 设置画布事件监听器
function setupCanvasEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleMouseWheel);
    window.addEventListener('resize', resizeCanvas);
}

// 鼠标按下事件
function handleMouseDown(e) {
    // 中键或右键拖动
    if (e.button === 1 || e.button === 2) {
        isDragging = true;
        dragStartX = e.clientX - offsetX;
        dragStartY = e.clientY - offsetY;
        canvas.style.cursor = 'grabbing';
        e.preventDefault(); // 防止默认行为
        return;
    }
   
    // 左键放置/移除组件
    if (e.button === 0) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
       
        // 计算网格坐标
        const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
        const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
       
        // 检查是否在网格内
        if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
            const index = gridY * canvasSize + gridX;
           
            // 放置或移除组件
            if (grid[index] === selectedComponent) {
                grid[index] = 'air'; // 移除
            } else {
                grid[index] = selectedComponent; // 放置
                hasChanges = true;
            }
           
            // 更新状态栏
            updateStatusBar();
        }
    }
}

// 鼠标移动事件
function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
   
    // 计算网格坐标
    const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
    const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
   
    // 更新光标位置显示
    if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
        document.querySelector('#cursor-position span').textContent =
            `坐标: ${gridX}, ${gridY}`;
    } else {
        document.querySelector('#cursor-position span').textContent = `坐标: 0, 0`;
    }
   
    // 处理拖动
    if (isDragging) {
        offsetX = e.clientX - dragStartX;
        offsetY = e.clientY - dragStartY;
    }
}

// 鼠标释放事件
function handleMouseUp(e) {
    isDragging = false;
    canvas.style.cursor = 'default';
}

// 鼠标滚轮事件（缩放）
function handleMouseWheel(e) {
    e.preventDefault();
   
    const zoomAmount = e.deltaY > 0 ? -0.1 : 0.1;
    zoomCanvas(zoomAmount, e.clientX, e.clientY);
}

// 缩放画布
function zoomCanvas(zoomAmount, centerX, centerY) {
    const oldScale = canvasScale;
    canvasScale = Math.max(0.1, Math.min(2.0, canvasScale + zoomAmount));
   
    // 如果没有指定中心点，使用画布中心
    const rect = canvas.getBoundingClientRect();
    if (!centerX) centerX = rect.left + canvas.width / 2;
    if (!centerY) centerY = rect.top + canvas.height / 2;
   
    // 计算相对于画布的位置
    const canvasX = centerX - rect.left;
    const canvasY = centerY - rect.top;
   
    // 计算缩放前中心点的网格坐标
    const gridCenterX = (canvasX - offsetX) / (tileSize * oldScale);
    const gridCenterY = (canvasY - offsetY) / (tileSize * oldScale);
   
    // 计算缩放后中心点应该保持在同一位置
    offsetX = canvasX - gridCenterX * tileSize * canvasScale;
    offsetY = canvasY - gridCenterY * tileSize * canvasScale;
   
    updateZoomDisplay();
}

// 重置画布位置和缩放
function resetCanvasPosition() {
    canvasScale = 1.0;
   
    // 计算初始偏移量使画布居中
    const container = document.getElementById('canvas-container');
    const canvasWidth = canvasSize * tileSize * canvasScale;
    const canvasHeight = canvasSize * tileSize * canvasScale;
    offsetX = (container.clientWidth - canvasWidth) / 2;
    offsetY = (container.clientHeight - canvasHeight) / 2;
   
    updateZoomDisplay();
}

// 更新缩放显示
function updateZoomDisplay() {
    document.querySelector('#canvas-scale span').textContent =
        `${Math.round(canvasScale * 100)}%`;
}

// 加载组件面板
function loadComponents() {
    const componentsList = document.getElementById('components-list');
    componentsList.innerHTML = '';
   
    // 遍历所有分类
    for (const [category, comps] of Object.entries(components)) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.dataset.category = category;
       
        // 分类标题
        const title = document.createElement('h3');
       
        // 添加类别图标
        const icon = document.createElement('i');
        if (category === "基础方块") icon.className = "fas fa-cube";
        else if (category === "机械元件") icon.className = "fas fa-cogs";
        else if (category === "装饰方块") icon.className = "fas fa-paint-brush";
        else if (category === "特殊方块") icon.className = "fas fa-star";
       
        title.appendChild(icon);
        title.appendChild(document.createTextNode(category));
        categoryDiv.appendChild(title);
       
        // 组件网格
        const gridDiv = document.createElement('div');
        gridDiv.className = 'components-grid';
       
        // 添加组件
        comps.forEach(compData => {
            const compDiv = document.createElement('div');
            compDiv.className = 'component';
            compDiv.dataset.id = compData.id;
            compDiv.dataset.name = compData.name;
            compDiv.dataset.pinyin = compData.pinyin;
           
            // 尝试使用本地资源
            if (images[compData.id]) {
                compDiv.innerHTML = `<img src="${images[compData.id].src}" alt="${compData.id}">`;
            } else {
                // 如果资源未加载，显示占位符
                compDiv.innerHTML = `<div style="width:30px;height:30px;background:#eee;display:flex;align-items:center;justify-content:center;color:#888;font-size:10px;">${compData.id}</div>`;
            }
           
            // 添加点击事件
            compDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                selectComponent(compData.id);
            });
           
            gridDiv.appendChild(compDiv);
        });
       
        categoryDiv.appendChild(gridDiv);
        componentsList.appendChild(categoryDiv);
    }
   
    // 默认选择空气
    selectComponent('air');
}

// 选择组件
function selectComponent(id) {
    selectedComponent = id;
   
    // 更新UI
    document.querySelectorAll('.component').forEach(comp => {
        comp.classList.toggle('selected', comp.dataset.id === id);
    });
   
    // 更新状态栏
    const compData = getAllComponents().find(c => c.id === id);
    if (compData) {
        document.querySelector('#current-component span').textContent = compData.name;
    } else {
        document.querySelector('#current-component span').textContent = id;
    }
   
    updateStatusBar();
}

// 获取所有组件（扁平化）
function getAllComponents() {
    return Object.values(components).flat();
}

// 更新状态栏
function updateStatusBar() {
    // 计算已放置组件数量
    const placedCount = grid.filter(comp => comp !== 'air').length;
    document.querySelector('#block-count span').textContent = `已放置: ${placedCount} 个组件`;
}

// 设置主题切换
function setupDayNightToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    const themeDisplay = document.querySelector('#theme-display span');
   
    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
       
        const isLight = !document.body.classList.contains('theme-dark');
       
        // 切换主题
        if (isLight) {
            // 夜间模式
            document.body.classList.add('theme-dark');
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = '主题';
            themeDisplay.textContent = '夜间模式';
           
            // 保存到本地存储
            localStorage.setItem('theme', 'dark');
        } else {
            // 日间模式
            document.body.classList.remove('theme-dark');
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = '主题';
            themeDisplay.textContent = '日间模式';
           
            // 保存到本地存储
            localStorage.setItem('theme', 'light');
        }
    });
}

// 从本地存储加载主题
function loadThemeFromStorage() {
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
}

// 设置缩放控制
function setupZoomControls() {
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
}

// 组件搜索功能（支持中文、拼音和英文）
function filterComponents() {
    const searchTerm = document.getElementById('component-search').value.trim().toLowerCase();
    const categories = document.querySelectorAll('.category');
    const allComponents = getAllComponents();
    let matchCount = 0;
   
    // 如果没有搜索词，显示所有组件
    if (!searchTerm) {
        categories.forEach(category => {
            category.style.display = 'block';
            const components = category.querySelectorAll('.component');
            components.forEach(comp => {
                comp.style.display = 'flex';
            });
        });
    }
   
    // 遍历所有分类
    categories.forEach(category => {
        const comps = category.querySelectorAll('.component');
        let hasVisible = false;
       
        // 遍历该分类下的所有组件
        comps.forEach(comp => {
            const id = comp.dataset.id;
            const name = comp.dataset.name;
            const pinyin = comp.dataset.pinyin;
           
            // 检查匹配条件：ID、中文名称、完整拼音、拼音首字母
            const matchId =
