const canvasSize = 64; // 64x64网格
        const tileSize = 30; // 每个网格30像素
        let grid = {}; // 稀疏矩阵，x,y => ID
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
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
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
            for (const [key, compId] of Object.entries(grid)) {
                    const [x, y] = key.split(',').map(Number);
                    if (x >= visibleStartX && x < visibleEndX && y >= visibleStartY && y < visibleEndY && images[compId]) {
                        const img = images[compId];
                        ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
                    }
            }
            
            // 恢复状态
            ctx.restore();
            
            // 继续渲染循环
            animationFrameId = requestAnimationFrame(render);
        }
        
        // 设置画布事件监听器
        function setupCanvasEventListeners() {
            //针对电脑
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('wheel', handleMouseWheel);
            //针对触屏
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd);
                
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
                    const key = `${gridX},${gridY}`;
                    if(grid[key] === selectedComponent) {
                       delete grid[key]; // 移除
                    } else if (selectedComponent !== 'air') {
                            grid[key] = selectedComponent; // 放置
                    }
                    hasChanges = true;
                    
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

        // 触摸开始事件
        function handleTouchStart(e) {
            e.preventDefault();
            const touches = e.touches;
            const rect = canvas.getBoundingClientRect();
        
            if (touches.length === 1) {// 单点=拖动
                isDragging = true;
                dragStartX = touches[0].clientX - offsetX;
                dragStartY = touches[0].clientY - offsetY;
                canvas.style.cursor = 'grabbing';
            } else if (touches.length === 2) {// 双点=缩放
                
                isDragging = false;
                const touch1 = touches[0];
                const touch2 = touches[1];
                // 计算两指中心点
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;
                // 计算初始两指距离
                const dx = touch1.clientX - touch2.clientX;
                const dy = touch1.clientY - touch2.clientY;
                initialTouchDistance = Math.sqrt(dx * dx + dy * dy);
                initialCanvasScale = canvasScale;
                touchCenterX = centerX;
                touchCenterY = centerY;
            }
        
            // 单点放置
            if (touches.length === 1) {
                const x = touches[0].clientX - rect.left;
                const y = touches[0].clientY - rect.top;
                const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
                const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
        
                if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
                    const key = `${gridX},${gridY}`;
                    if (grid[key] === selectedComponent) {
                        delete grid[key]; // 移除
                    } else if (selectedComponent !== 'air') {
                        grid[key] = selectedComponent; // 放置
                    }
                    hasChanges = true;
                    updateStatusBar();
                }
            }
        }
        
        // 触摸移动事件
        function handleTouchMove(e) {
            e.preventDefault(); 
            const touches = e.touches;
            const rect = canvas.getBoundingClientRect();
        
            if (touches.length === 1 && isDragging) {
                //拖动画布
                offsetX = touches[0].clientX - dragStartX;
                offsetY = touches[0].clientY - dragStartY;
        
                // 更新光标位置
                const x = touches[0].clientX - rect.left;
                const y = touches[0].clientY - rect.top;
                const gridX = Math.floor((x - offsetX) / (tileSize * canvasScale));
                const gridY = Math.floor((y - offsetY) / (tileSize * canvasScale));
                if (gridX >= 0 && gridX < canvasSize && gridY >= 0 && gridY < canvasSize) {
                    document.querySelector('#cursor-position span').textContent = `坐标: ${gridX}, ${gridY}`;
                } else {
                    document.querySelector('#cursor-position span').textContent = `坐标: 0, 0`;
                }
            } else if (touches.length === 2) {
                // 缩放
                const touch1 = touches[0];
                const touch2 = touches[1];
                // 计算当前两指距离
                const dx = touch1.clientX - touch2.clientX;
                const dy = touch1.clientY - touch2.clientY;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);
                // 计算缩放比例
                const scaleChange = currentDistance / initialTouchDistance;
                const newScale = initialCanvasScale * scaleChange;
                // 限制缩放范围
                canvasScale = Math.max(0.1, Math.min(2.0, newScale));
        
                // 计算两指中心点
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;
                // 计算相对于画布的位置
                const canvasX = centerX - rect.left;
                const canvasY = centerY - rect.top;
                // 计算缩放前中心点的网格坐标
                const gridCenterX = (canvasX - offsetX) / (tileSize * initialCanvasScale);
                const gridCenterY = (canvasY - offsetY) / (tileSize * initialCanvasScale);
                // 计算缩放后中心点位置
                offsetX = canvasX - gridCenterX * tileSize * canvasScale;
                offsetY = canvasY - gridCenterY * tileSize * canvasScale;
        
                updateZoomDisplay();
            }
        }
        
        // 触摸结束事件
        function handleTouchEnd(e) {
            isDragging = false;
            canvas.style.cursor = 'default';
            initialTouchDistance = null;
            initialCanvasScale = null;
            touchCenterX = null;
            touchCenterY = null;
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
            const placedCount = Object.keys(grid).length;
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
                    const matchId = id.toLowerCase().includes(searchTerm);
                    const matchName = name.toLowerCase().includes(searchTerm);
                    const matchPinyin = pinyin.toLowerCase().includes(searchTerm);
                    
                    // 生成拼音首字母
                    const pinyinInitials = pinyin
                        .split('')
                        .filter(char => /[a-z]/.test(char) && !/[aeiouv]/.test(char))
                        .join('');
                    
                    const matchInitials = pinyinInitials.toLowerCase().includes(searchTerm);
                    
                    // 检查是否匹配
                    if (matchId || matchName || matchPinyin || matchInitials) {
                        comp.style.display = 'flex';
                        hasVisible = true;
                        matchCount++;
                    } else {
                        comp.style.display = 'none';
                    }
                });
                
                // 根据是否有可见组件显示/隐藏分类
                category.style.display = hasVisible ? 'block' : 'none';
            });
        }
        
        // 设置事件监听器
        function setupEventListeners() {
            // 按钮事件
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
            
            // 搜索功能
            document.getElementById('component-search').addEventListener('input', (e) => {
                e.stopPropagation();
                filterComponents();
            });
            
            // 缩放控制
            setupZoomControls();
            
            // 主题切换
            setupDayNightToggle();
            
            // 模态框关闭按钮
            document.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', closeAllModals);
            });
            
            // 点击模态框外部关闭
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeAllModals();
                    }
                });
            });
            
            // 保存按钮
            document.getElementById('confirm-save').addEventListener('click', saveDesign);
            
            // 导入按钮
            document.getElementById('confirm-load').addEventListener('click', loadDesign);
            
            // 清空确认按钮
            document.getElementById('confirm-clear').addEventListener('click', clearCanvas);
            
            // 重新加载按钮
            document.getElementById('reload-btn').addEventListener('click', () => {
                location.reload();
            });
            
            // 文件拖放功能
            const fileDropArea = document.getElementById('file-drop-area');
            const fileInput = document.getElementById('load-file');
            
            fileDropArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length) {
                    document.getElementById('load-status').innerHTML = 
                        `<i class="fas fa-check-circle"></i> 已选择文件: ${fileInput.files[0].name}`;
                }
            });
            
            // 文件拖放事件
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
                    document.getElementById('load-status').innerHTML = 
                        `<i class="fas fa-check-circle"></i> 已选择文件: ${fileInput.files[0].name}`;
                }
            });
            
            // 阻止右键菜单
            document.addEventListener('contextmenu', (e) => {
                if (e.target.id === 'canvas') {
                    e.preventDefault();
                }
            });
        }
        
        // 打开保存模态框
        function openSaveModal() {
            document.getElementById('save-modal').classList.add('show');
            document.getElementById('save-modal').style.display = 'flex';
        }
        
        // 打开导入模态框
        function openLoadModal() {
            document.getElementById('load-modal').classList.add('show');
            document.getElementById('load-modal').style.display = 'flex';
            document.getElementById('load-status').innerHTML = 
                '<i class="fas fa-info-circle"></i> 请选择或拖放JSON设计文件';
        }
        
        // 打开清空确认模态框
        function openClearConfirmModal() {
            document.getElementById('clear-confirm-modal').classList.add('show');
            document.getElementById('clear-confirm-modal').style.display = 'flex';
        }
        
        // 打开帮助模态框
        function openHelpModal() {
            document.getElementById('help-modal').classList.add('show');
            document.getElementById('help-modal').style.display = 'flex';
        }
        
        // 关闭所有模态框
        function closeAllModals() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            });
        }
        
        // 清空画布
        function clearCanvas() {
            grid = {};
            updateStatusBar();
            hasChanges = true;
            closeAllModals();
        }
        
        // 保存设计
        function saveDesign() {
            const designName = document.getElementById('design-name').value.trim() || '未命名设计';
            const designDescription = document.getElementById('design-description').value.trim();
            
            // 创建设计对象
            const designData = {
                name: designName,
                description: designDescription,
                grid: grid,
                timestamp: new Date().toISOString(),
                scale: canvasScale,
                offsetX: offsetX,
                offsetY: offsetY
            };
            
            // 转换为JSON
            const jsonData = JSON.stringify(designData);
            
            // 创建Blob对象
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${designName.replace(/\s+/g, '_')}_红石设计.json`;
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            // 关闭模态框
            closeAllModals();
            
            // 重置表单
            document.getElementById('design-name').value = '';
            document.getElementById('design-description').value = '';
            
            // 标记为已保存
            hasChanges = false;
        }
        
        // 导入设计
        function loadDesign() {
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
                    
                    // 验证数据
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
                    
                    // 更新状态
                    updateStatusBar();
                    updateZoomDisplay();
                    
                    // 关闭模态框
                    closeAllModals();
                    
                    // 标记为已保存
                    hasChanges = false;
                    
                    statusElement.innerHTML = '<i class="fas fa-check-circle"></i> 设计导入成功！';
                } catch (error) {
                    statusElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> 错误: ${error.message}`;
                }
            };
            
            reader.onerror = function() {
                statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> 读取文件时出错';
            };
            
            reader.readAsText(file);
        }
        
        // 预加载所有组件图片
        function preloadResources() {
            // 创建所有组件名称的数组
            const allComponents = getAllComponents();
            
            // 预加载进度跟踪
            const progressBar = document.getElementById('progress-bar');
            const loaderText = document.querySelector('.loader-text');
            let loadedCount = 0;
            const totalCount = allComponents.length;
            
            // 更新进度条
            function updateProgress() {
                loadedCount++;
                const progress = (loadedCount / totalCount) * 100;
                progressBar.style.width = `${progress}%`;
                loaderText.textContent = `正在加载红石组件资源... (${loadedCount}/${totalCount})`;
            }
            
            // 预加载所有图片
            allComponents.forEach(comp => {
                const img = new Image();
                img.onload = () => {
                    images[comp.id] = img;
                    updateProgress();
                    
                    // 当所有资源加载完成
                    if (loadedCount === totalCount) {
                        isResourceLoaded = true;
                        setTimeout(() => {
                            document.getElementById('resource-loader').style.opacity = '0';
                            setTimeout(() => {
                                document.getElementById('resource-loader').style.display = 'none';
                                // 加载组件面板
                                loadComponents();
                                // 初始化画布
                                initCanvas();
                            }, 500);
                        }, 300);
                    }
                };
                
                img.onerror = () => {
                    // 处理资源加载错误
                    console.error(`无法加载资源: assets/${comp.id}.webp`);
                    images[comp.id] = null;
                    updateProgress();
                    
                    // 如果所有资源加载完成但有错误
                    if (loadedCount === totalCount) {
                        isResourceLoaded = true;
                        // 检查是否有资源缺失
                        const missingResources = allComponents.filter(c => !images[c.id]);
                        if (missingResources.length > 0) {
                            document.getElementById('resource-error').style.display = 'flex';
                            document.getElementById('resource-loader').style.display = 'none';
                        } else {
                            setTimeout(() => {
                                document.getElementById('resource-loader').style.opacity = '0';
                                setTimeout(() => {
                                    document.getElementById('resource-loader').style.display = 'none';
                                    loadComponents();
                                    initCanvas();
                                }, 500);
                            }, 300);
                        }
                    }
                };
                
                // 尝试加载本地资源
                img.src = `assets/${comp.id}.webp`;
            });
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
            // 检查本地存储中的主题设置
            loadThemeFromStorage();
            
            // 设置事件监听器
            setupEventListeners();
            
            // 预加载资源
            preloadResources();
            
            // 监听窗口关闭事件
            window.addEventListener('beforeunload', handleBeforeUnload);
            
            // 初始化状态栏
            updateStatusBar();
            
            // 初始重置画布位置
            resetCanvasPosition();
        }
        
        // 页面加载完成后初始化
        window.addEventListener('DOMContentLoaded', init);
