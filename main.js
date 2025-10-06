const components = {
    "基础方块": [
        {id: "air", name: "空气", pinyin: "kongqi"},
        {id: "bedrock", name: "基岩", pinyin: "jiyan"},
        {id: "smoothstone", name: "平滑石", pinyin: "pinghuashi"},
        {id: "obsidian", name: "黑曜石", pinyin: "heiyaoshi"},
        {id: "slimeblock", name: "粘液块", pinyin: "nianyekuai"},
        {id: "honeyblock", name: "蜂蜜块", pinyin: "fengmikuai"},
        {id: "ironblock", name: "铁块", pinyin: "tiekuai"},
        {id: "rsblock", name: "红石块", pinyin: "hongshikuai"},
        {id: "scaffolding", name: "脚手架", pinyin: "jiaoshoujia"},
        {id: "powderedsnow", name: "细雪", pinyin: "xixue"},
        {id: "ice", name: "冰", pinyin: "bing"},
        {id: "sand", name: "沙子", pinyin: "shazi"},
        {id: "soulsand", name: "灵魂沙", pinyin: "linghunsha"},
        {id: "magma", name: "岩浆块", pinyin: "yanjiangkuai"},
        {id: "glass", name: "玻璃", pinyin: "boli"},
        {id: "light_blue_stained_glass", name: "淡蓝色玻璃", pinyin: "danlanseboli"},
        {id: "light_blue_stained_glass_pane_top", name: "淡蓝色玻璃板", pinyin: "danlanseboliban"},
        {id: "white_wool", name: "白色羊毛", pinyin: "baiseyangmao"},
        {id: "gray_wool", name: "灰色羊毛", pinyin: "huiseyangmao"},
        {id: "glazedterracotta", name: "釉陶", pinyin: "youtao"},
        {id: "slabt", name: "石台阶", pinyin: "shitaijie"},
        {id: "white_concrete", name: "白色混凝土", pinyin: "baisehunningtu"},
        {id: "polished_deepslate", name: "磨制深板岩", pinyin: "mozhishenbanyan"},
        {id: "polished_diorite", name: "磨制闪长岩", pinyin: "mozhishanchangyan"},
        {id: "polished_granite", name: "磨制花岗岩", pinyin: "mozhihuagangyan"},
        {id: "cactus", name: "仙人掌", pinyin: "xianrenzhang"},
        {id: "dirt_path", name: "草径", pinyin: "caojing"}
    ],
    "机械元件": [
        {id: "duston", name: "红石粉（激活）", pinyin: "hongshifenjihuo"},
        {id: "dustoff", name: "红石粉", pinyin: "hongshifen"},
        {id: "torchon", name: "红石火把（激活）", pinyin: "hongshihuobajihuo"},
        {id: "torchoff", name: "红石火把", pinyin: "hongshihuoba"},
        {id: "torchlon", name: "左侧红石火把（激活）", pinyin: "zuocehongshihuobajihuo"},
        {id: "torchloff", name: "左侧红石火把", pinyin: "zuocehongshihuoba"},
        {id: "torchron", name: "右侧红石火把（激活）", pinyin: "youcehongshihuobajihuo"},
        {id: "torchroff", name: "右侧红石火把", pinyin: "youcehongshihuoba"},
        {id: "repeaterlon", name: "左侧中继器（激活）", pinyin: "zuocezhongjiqijihuo"},
        {id: "repeaterloff", name: "左侧中继器", pinyin: "zuocezhongjiqi"},
        {id: "repeaterron", name: "右侧中继器（激活）", pinyin: "youcezhongjiqijihuo"},
        {id: "repeaterroff", name: "右侧中继器", pinyin: "youcezhongjiqi"},
        {id: "comparatorlon", name: "左侧比较器（激活）", pinyin: "zuocebijiaoqijihuo"},
        {id: "comparatorloff", name: "左侧比较器", pinyin: "zuocebijiaoqi"},
        {id: "comparatorron", name: "右侧比较器（激活）", pinyin: "youcebijiaoqijihuo"},
        {id: "comparatorroff", name: "右侧比较器", pinyin: "youcebijiaoqi"},
        {id: "lampon", name: "红石灯（激活）", pinyin: "hongshidengjihuo"},
        {id: "lampoff", name: "红石灯", pinyin: "hongshideng"},
        {id: "copper_bulb_lit", name: "铜灯（亮）", pinyin: "tongdengliang"},
        {id: "copper_bulb_unlit", name: "铜灯", pinyin: "tongdeng"},
        {id: "pistonu", name: "活塞（上）", pinyin: "huosaishang"},
        {id: "pistond", name: "活塞（下）", pinyin: "huosaixia"},
        {id: "pistonl", name: "活塞（左）", pinyin: "huosaizuo"},
        {id: "pistonr", name: "活塞（右）", pinyin: "huosaiyou"},
        {id: "pistonf", name: "活塞（前）", pinyin: "huosaiqian"},
        {id: "pistonb", name: "活塞（后）", pinyin: "huosaihou"},
        {id: "pistonheadd", name: "活塞头（下）", pinyin: "huosaitouxia"},
        {id: "pistonheadl", name: "活塞头（左）", pinyin: "huosaitouzuo"},
        {id: "pistonheadr", name: "活塞头（右）", pinyin: "huosaitouyou"},
        {id: "pistonheadu", name: "活塞头（上）", pinyin: "huosaitoushang"},
        {id: "pistonbodyd", name: "活塞体（下）", pinyin: "huosaitixia"},
        {id: "pistonbodyl", name: "活塞体（左）", pinyin: "huosaitizuo"},
        {id: "pistonbodyr", name: "活塞体（右）", pinyin: "huosaitiyou"},
        {id: "pistonbodyu", name: "活塞体（上）", pinyin: "huosaitishang"},
        {id: "stickypistonu", name: "粘性活塞（上）", pinyin: "nianxinghuosaishang"},
        {id: "stickypistond", name: "粘性活塞（下）", pinyin: "nianxinghuosaixia"},
        {id: "stickypistonl", name: "粘性活塞（左）", pinyin: "nianxinghuosaizuo"},
        {id: "stickypistonr", name: "粘性活塞（右）", pinyin: "nianxinghuosaiyou"},
        {id: "stickypistonf", name: "粘性活塞（前）", pinyin: "nianxinghuosaiqian"},
        {id: "stickypistonb", name: "粘性活塞（后）", pinyin: "nianxinghuosaihou"},
        {id: "stickypistonheadd", name: "粘性活塞头（下）", pinyin: "nianxinghuosaitouxia"},
        {id: "stickypistonheadl", name: "粘性活塞头（左）", pinyin: "nianxinghuosaitouzuo"},
        {id: "stickypistonheadr", name: "粘性活塞头（右）", pinyin: "nianxinghuosaitouyou"},
        {id: "stickypistonheadu", name: "粘性活塞头（上）", pinyin: "nianxinghuosaitoushang"},
        {id: "observeru", name: "侦测器（上）", pinyin: "zhenceqishang"},
        {id: "observerd", name: "侦测器（下）", pinyin: "zhenceqixia"},
        {id: "observerl", name: "侦测器（左）", pinyin: "zhenceqizuo"},
        {id: "observerr", name: "侦测器（右）", pinyin: "zhenceqiyou"},
        {id: "observerf", name: "侦测器（前）", pinyin: "zhenceqiqian"},
        {id: "observerb", name: "侦测器（后）", pinyin: "zhenceqihou"},
        {id: "dropperu", name: "投掷器（上）", pinyin: "touzhiqishang"},
        {id: "dropperd", name: "投掷器（下）", pinyin: "touzhiqixia"},
        {id: "dropperl", name: "投掷器（左）", pinyin: "touzhiqizuo"},
        {id: "dropperr", name: "投掷器（右）", pinyin: "touzhiqiyou"},
        {id: "dropperf", name: "投掷器（前）", pinyin: "touzhiqiqian"},
        {id: "dropperd", name: "投掷器（后）", pinyin: "touzhiqihou"},
        {id: "crafter", name: "工作台", pinyin: "gongzuotai"},
        {id: "crafteru", name: "工作台（上）", pinyin: "gongzuotaishang"},
        {id: "crafterd", name: "工作台（下）", pinyin: "gongzuotaixia"},
        {id: "crafterl", name: "工作台（左）", pinyin: "gongzuotaizuo"},
        {id: "crafterr", name: "工作台（右）", pinyin: "gongzuotaiyou"},
        {id: "hopperd", name: "漏斗（下）", pinyin: "loudouxia"},
        {id: "hopperl", name: "漏斗（左）", pinyin: "loudouzuo"},
        {id: "hopperr", name: "漏斗（右）", pinyin: "loudouyou"},
        {id: "hopperb", name: "漏斗（后）", pinyin: "loudouhou"},
        {id: "target", name: "标靶", pinyin: "biao"},
        {id: "arail", name: "激活铁轨", pinyin: "jihuotiegui"},
        {id: "arailsl", name: "左激活铁轨", pinyin: "zuojihuotiegui"},
        {id: "arailsr", name: "右激活铁轨", pinyin: "youjihuotiegui"},
        {id: "prail", name: "动力铁轨", pinyin: "donglitiegui"},
        {id: "prailsl", name: "左动力铁轨", pinyin: "zuodonglitiegui"},
        {id: "prailsr", name: "右动力铁轨", pinyin: "youdonglitiegui"},
        {id: "fencegatec", name: "栅栏门（关）", pinyin: "zhanlangmenguan"},
        {id: "fencegateo", name: "栅栏门（开）", pinyin: "zhanlangmenkai"},
        {id: "trapdooru", name: "活板门（上）", pinyin: "huobanmenshang"},
        {id: "trapdoord", name: "活板门（下）", pinyin: "huobanmenxia"},
        {id: "trapdoorl", name: "活板门（左）", pinyin: "huobanmenzuo"},
        {id: "trapdoorr", name: "活板门（右）", pinyin: "huobanmenyou"},
        {id: "wtrapdooru", name: "木活板门（上）", pinyin: "muhuobanmenshang"},
        {id: "wtrapdoord", name: "木活板门（下）", pinyin: "muhuobanmenxia"},
        {id: "wtrapdoorl", name: "木活板门（左）", pinyin: "muhuobanmenzuo"},
        {id: "wtrapdoorr", name: "木活板门（右）", pinyin: "muhuobanmenyou"},
        {id: "noteblock", name: "音符盒", pinyin: "yinfuhe"},
        {id: "daylight_detector", name: "阳光传感器", pinyin: "yangguangchuanganqi"},
        {id: "tnt", name: "TNT", pinyin: "tnt"}
    ],
    "装饰方块": [
        {id: "chest", name: "箱子", pinyin: "xiangzi"},
        {id: "chestdl", name: "双箱子（左）", pinyin: "shuangxiangzizuo"},
        {id: "chestdr", name: "双箱子（右）", pinyin: "shuangxiangziyou"},
        {id: "shulkerboxu", name: "潜影盒（上）", pinyin: "qianyingheshang"},
        {id: "shulkerboxd", name: "潜影盒（下）", pinyin: "qianyinghexia"},
        {id: "shulkerboxl", name: "潜影盒（左）", pinyin: "qianyinghezuo"},
        {id: "shulkerboxr", name: "潜影盒（右）", pinyin: "qianyingheyou"},
        {id: "barrel", name: "木桶", pinyin: "mutong"},
        {id: "cauldron", name: "炼药锅", pinyin: "lianyaoguo"},
        {id: "composter", name: "堆肥桶", pinyin: "duifeitong"},
        {id: "cake", name: "蛋糕", pinyin: "dangao"},
        {id: "beehive", name: "蜂箱", pinyin: "fengxiang"},
        {id: "bee_nest", name: "蜂巢", pinyin: "fengchao"},
        {id: "big_dripleaf_top", name: "大型垂滴叶", pinyin: "daxingchuidiye"},
        {id: "carved_pumpkin", name: "雕刻南瓜", pinyin: "diaokenangua"},
        {id: "pumpkin_lantern", name: "南瓜灯", pinyin: "nanguadeng"},
        {id: "chorus_flower", name: "紫颂花", pinyin: "zisonghua"},
        {id: "chorus_flower_dead", name: "枯萎紫颂花", pinyin: "kuweizisonghua"},
        {id: "cobweb", name: "蜘蛛网", pinyin: "zhizhuwang"},
        {id: "enchanting_table", name: "附魔台", pinyin: "fumotai"},
        {id: "end_portal_frame", name: "末地传送门", pinyin: "modichuansongmen"},
        {id: "furnace", name: "熔炉", pinyin: "ronglu"},
        {id: "blast_furnace", name: "高炉", pinyin: "gaolu"},
        {id: "smoker_front", name: "烟熏炉", pinyin: "yanxunlu"},
        {id: "stonecutter", name: "切石机", pinyin: "qieshiji"},
        {id: "respawn_anchor", name: "重生锚", pinyin: "chongshengmao"},
        {id: "spawner", name: "刷怪笼", pinyin: "shuaguailong"}
    ],
    "特殊方块": [
        {id: "water", name: "水", pinyin: "shui"},
        {id: "lava", name: "熔岩", pinyin: "rongyan"},
        {id: "fire", name: "火", pinyin: "huo"},
        {id: "unknown", name: "未知方块", pinyin: "weizhifangkuai"}
    ]
};

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
