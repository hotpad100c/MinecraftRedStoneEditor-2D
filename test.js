// @ts-check
/**
 * Minecraft 模型/方块渲染器（JSDoc + @ts-check 版本）
 * 纯浏览器端 JS，不使用 class / 模块系统
 *
 * 请确保页面包含：
 *  - <div id="viewer"></div>
 *  - <ul id="list"></ul>
 * 并且 Three.js 与 OrbitControls 已经通过 <script> 注入到全局。
 */

/* ===========================
   类型定义（JSDoc）
   ===========================*/

/**
 * @typedef {Object<string, any>} StringMap
 */

/**
 * @typedef {Object} BlockFace
 * @property {string} [texture]  // e.g. "#all" or "minecraft:block/stone"
 * @property {number[]} [uv]    // [u1,v1,u2,v2] in pixel coords (0..16 scale)
 * @property {string} [cullface]
 * @property {boolean} [tintindex]
 */

/**
 * @typedef {Object} BlockElement
 * @property {number[]} from
 * @property {number[]} to
 * @property {Object<string, BlockFace>} faces
 */

/**
 * @typedef {Object} BlockModel
 * @property {string=} parent
 * @property {StringMap=} textures
 * @property {BlockElement[]=} elements
 */

/**
 * @typedef {Object} BlockStateVariant
 * @property {string} [model]
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [uvlock]
 */

/**
 * @typedef {Object<string, BlockStateVariant[]|BlockStateVariant>} BlockStateEntry
 */

/* ===========================
   配置 & DOM 元素
   ===========================*/

const listEl = /** @type {HTMLUListElement} */ (document.getElementById('list'));
const viewerEl = document.getElementById('viewer');

/* ===========================
   Three.js 初始化
   ===========================*/

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

const camera = new THREE.PerspectiveCamera(
    45,
    (window.innerWidth - 200) / window.innerHeight,
    0.1,
    1000
);
camera.position.set(30, 20, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth - 200, window.innerHeight);
if (viewerEl) viewerEl.appendChild(renderer.domElement);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(30, 40, 30);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const { OrbitControls } = window.ThreeAddons?.OrbitControls || window;
const controls = new OrbitControls(camera, renderer.domElement);
const loader = new THREE.TextureLoader();

/* ===========================
   工具函数：安全 fetch + JSON 解析
   ===========================*/

/**
 * Fetch JSON safely. If response body is empty or not valid JSON, this will log the raw text
 * and return null (or throw if you prefer).
 *
 * @param {string} url
 * @returns {Promise<any|null>}
 */
async function fetchJsonSafe(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
        throw new Error(`Network error ${resp.status} when fetching ${url}`);
    }
    const text = await resp.text();
    if (!text) {
        console.warn(`[fetchJsonSafe] empty response for ${url}`);
        return null;
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error(`[fetchJsonSafe] invalid JSON from ${url}:\n`, text);
        throw e;
    }
}

/* ===========================
   载入 assets（models & blockstates）
   ===========================*/

/**
 * @returns {Promise<{models: Record<string, BlockModel>, blockstates: Record<string, any>}>}
 */
async function loadAssets() {
    const [models, blockstates] = await Promise.all([
        fetchJsonSafe('mcAssets/models/block/_all.json'),
        fetchJsonSafe('mcAssets/blockstates/_all.json')
    ]);
    return {
        models: models || {},
        blockstates: blockstates || {}
    };
}

/* ===========================
   Model 解析（合并 parent & textures、提供 fallback）
   ===========================*/

/**
 * 深度克隆（简单实现）
 * @param {any} v
 * @returns {any}
 */
function deepClone(v) { return JSON.parse(JSON.stringify(v)); }

/**
 * 递归解析模型（处理 parent、textures 继承、elements 继承）
 *
 * @param {string} name - 完整名字，例如 "minecraft:block/stone" 或 "stone"（会尝试补前缀）
 * @param {Record<string, BlockModel>} models
 * @param {Record<string, BlockModel>} [cache]
 * @param {Set<string>} [visited]
 * @returns {BlockModel|null}
 */
function getResolvedModel(name, models, cache = {}, visited = new Set()) {
    if (cache[name]) return deepClone(cache[name]);
    if (visited.has(name)) { console.warn('循环引用', name); return null; }
    visited.add(name);

    let m = models[name];
    if (!m) {
        // 尝试短名
        const short = name
            .replace(/^minecraft:block\//, '')
            .replace(/^block\//, '');
        if (models[short]) return getResolvedModel(short, models, cache, visited);
        console.warn('模型不存在:', name);
        return null;
    }
    m = deepClone(m);

    // 解析 parent
    let parentModel = null;
    if (m.parent) {
        const parentName = m.parent.startsWith('minecraft:') ? m.parent : 'minecraft:' + m.parent;
        parentModel = getResolvedModel(parentName, models, cache, visited);
    }

    // textures 继承
    m.textures = Object.assign({}, parentModel ? parentModel.textures : {}, m.textures || {});

    // elements 继承（若当前没有 elements）
    if (!m.elements && parentModel && parentModel.elements) {
        m.elements = deepClone(parentModel.elements);
    }

    // 解析 faces 的 #texture 引用 -> 真实路径（仅替换字符串）
    if (m.elements) {
        for (const el of m.elements) {
            el.faces = el.faces || {};
            for (const faceName of ['north','south','east','west','up','down']) {
                const face = el.faces[faceName];
                if (!face) continue;
                if (face.texture && typeof face.texture === 'string' && face.texture.startsWith('#')) {
                    const key = face.texture.slice(1);
                    const tex = m.textures ? m.textures[key] : null;
                    if (tex) face.texture = tex;
                    else console.warn(`[Texture] ${name}.${faceName} 找不到 ${face.texture}`);
                }
            }
        }
    }

    // fallback：若没有元素，则用 16x16 立方体，faces 使用 "#all"（后面会取实际贴图）
    if (!m.elements) {
        m.elements = [{
            from: [0,0,0],
            to: [16,16,16],
            faces: {
                north:{texture:"#all"}, south:{texture:"#all"},
                east:{texture:"#all"}, west:{texture:"#all"},
                up:{texture:"#all"}, down:{texture:"#all"}
            }
        }];
    }

    cache[name] = deepClone(m);
    return m;
}

/* ===========================
   BlockState -> Model 与 旋转 获取
   ===========================*/

/**
 * 从 blockstates 中取得用于展示的 model 名称与旋转信息（取第一个 variant）
 * @param {string} name - "minecraft:block/xxx" 或短名
 * @param {Record<string, any>} blockstates
 * @returns {{model:string, x:number, y:number}}
 */
function getBlockStateModel(name, blockstates) {
    const blockName = name.replace(/^minecraft:block\//, '');
    const state = blockstates[blockName];
    if (!state || !state.variants) return { model: name, x: 0, y: 0 };

    const variantKeys = Object.keys(state.variants);
    const first = state.variants[variantKeys[0]];
    // variant 可能是数组或单对象
    const variant = Array.isArray(first) ? first[0] : first;
    return {
        model: variant.model ? (variant.model.startsWith('minecraft:') ? variant.model : 'minecraft:' + variant.model) : name,
        x: variant.x || 0,
        y: variant.y || 0
    };
}

/* ===========================
   构造 THREE.Mesh（处理每个 element 的六个面）
   ===========================*/

/**
 * 将单个 BlockModel 转为 THREE.Group（由若干个小立方体构成）
 * @param {BlockModel} model
 * @param {{x:number,y:number}} rotation - 角度（度）
 * @param {THREE.TextureLoader} texLoader
 * @returns {THREE.Group}
 */
function createMeshFromModel(model, rotation = { x:0, y:0 }, texLoader) {
    const group = new THREE.Group();
    const elems = model.elements || [];

    for (const el of elems) {
        // 尺寸以方块为单元（1 = 16 像素），这里让最终模型单位为 1（立方体边长 1）
        const size = [
            (el.to[0] - el.from[0]) / 16,
            (el.to[1] - el.from[1]) / 16,
            (el.to[2] - el.from[2]) / 16
        ];

        const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);

        // Three.js BoxGeometry 的面顺序：每个面有两个三角形（6 faces, 12 tris），uv 长度为 24 个 uv 点（每顶点一个 uv）
        // 我们要为每个 Box 的面提供对应材质（或透明材质）
        const faceOrder = ['east','west','up','down','south','north']; // 与你原来对应
        const materials = faceOrder.map(fName => {
            const face = (el.faces && el.faces[fName]) || null;
            if (!face) {
                return new THREE.MeshStandardMaterial({ visible: false });
            }
            // 取得纹理路径（把可能的命名简化到文件名）
            let texPath = face.texture || '';
            // 如果是 #all（或其它 key），尝试在 model.textures 中解析为实际路径
            if (texPath && texPath.startsWith('#')) {
                const key = texPath.slice(1);
                texPath = (model.textures && model.textures[key]) || texPath;
            }
            // texPath 可能是 "block/stone" 或 "minecraft:block/stone" 或 "stone"
            // 取最后一段作为文件名
            texPath = texPath.split('/').pop();
            if (!texPath) {
                return new THREE.MeshStandardMaterial({ visible: false });
            }
            const texUrl = `mcAssets/textures/block/${texPath}.png`;
            const tex = texLoader.load(texUrl);
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            return new THREE.MeshStandardMaterial({ map: tex, transparent: true });
        });

        // UV 设置：如果模型在 faces 中提供了 uv（pixel），则将其映射到 BoxGeometry 的 UV
        // geometry.attributes.uv 有 24 个 uv 点（12 三角形顶点对）, 按面分配
        // 我们使用一个简单方案：只要 face.uv 存在，我们会通过索引映射，把此 face 的 uv 写入对应的 geometry.attributes.uv 段
        const geomUV = geometry.attributes.uv; // BufferAttribute
        // 每个面对应 4 个顶点（BoxGeometry 保证顺序），但 BufferAttribute 是按三角形展开的（总长度 24）
        // 我们以 faceIndex -> uvIndexStart 的方式处理（careful: BoxGeometry 的具体布局依赖实现）
        // 下面使用常见的 three.js BoxGeometry uv 布局索引：
        const faceToUvIndex = {
            east: 0,   // right
            west: 4,   // left
            up: 8,     // top
            down: 12,  // bottom
            south: 16, // back
            north: 20  // front
        };

        for (const fName of Object.keys(faceToUvIndex)) {
            const face = (el.faces && el.faces[fName]) || null;
            if (!face || !face.uv) continue;
            const start = faceToUvIndex[fName]; // uv 数组的起点（每面 4 个 uv）
            // face.uv 是 [u1,v1,u2,v2]（像素，0..16）
            let [u1, v1, u2, v2] = face.uv;
            // 归一化到 [0,1]
            const uScale = 1 / 16;
            const vScale = 1 / 16;
            u1 *= uScale; u2 *= uScale;
            v1 *= vScale; v2 *= vScale;
            // 注意：three.js UV y 轴通常是从底到顶，但 Minecraft uv 可能 be top origin; 若发现贴图上下颠倒，请调换 v1/v2
            // 我们写入四个顶点（按 BufferAttribute 的每面 4 个 uv）
            geomUV.setXY(start + 0, u1, 1 - v2);
            geomUV.setXY(start + 1, u2, 1 - v2);
            geomUV.setXY(start + 2, u2, 1 - v1);
            geomUV.setXY(start + 3, u1, 1 - v1);
        }
        geomUV.needsUpdate = true;

        const cube = new THREE.Mesh(geometry, materials);
        // 设置位置：three.js 中 group 单位是 1 个方块，原始 minecraft 坐标以 [0,16]，我们中心对齐 (-0.5..+0.5)
        cube.position.set(
            (el.from[0] + el.to[0]) / 32 - 0.5,
            (el.from[1] + el.to[1]) / 32 - 0.5,
            (el.from[2] + el.to[2]) / 32 - 0.5
        );
        group.add(cube);
    }

    group.rotation.x = THREE.MathUtils.degToRad(rotation.x || 0);
    group.rotation.y = THREE.MathUtils.degToRad(rotation.y || 0);

    return group;
}

/* ===========================
   主流程：加载、生成列表、响应 UI
   ===========================*/

let currentGroup = null;

/**
 * 在左侧列表显示所有模型名并绑定点击事件
 * @param {Record<string, BlockModel>} models
 * @param {Record<string, any>} blockstates
 */
function populateList(models, blockstates) {
    listEl.innerHTML = '';
    Object.keys(models).forEach(fullName => {
        const short = fullName.replace(/^minecraft:block\//, '').replace(/^block\//, '');
        const li = document.createElement('li');
        li.textContent = short;
        li.style.cursor = 'pointer';
        li.onclick = () => displayModel(fullName, models, blockstates);
        listEl.appendChild(li);
    });
}

/**
 * 展示模型：解析 blockstate -> model -> resolved model -> mesh -> 添加到 scene
 * @param {string} name
 * @param {Record<string, BlockModel>} models
 * @param {Record<string, any>} blockstates
 */
function displayModel(name, models, blockstates) {
    if (currentGroup) scene.remove(currentGroup);
    const blockState = getBlockStateModel(name, blockstates);
    const model = getResolvedModel(blockState.model, models);
    if (!model) return;
    currentGroup = createMeshFromModel(model, { x: blockState.x, y: blockState.y }, loader);
    scene.add(currentGroup);
    console.log('展示模型:', name, model);
}

/* ===========================
   动画循环与窗口事件
   ===========================*/

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

/* 调整窗口大小 */
function onWindowResize() {
    camera.aspect = (window.innerWidth - 200) / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth - 200, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

/* ===========================
   入口
   ===========================*/

(async function main() {
    try {
        const { models, blockstates } = await loadAssets();
        console.log('模型数量:', Object.keys(models).length);
        console.log('方块状态数量:', Object.keys(blockstates).length);

        populateList(models, blockstates);
        animate();
    } catch (e) {
        console.error('初始化失败:', e);
    }
})();
