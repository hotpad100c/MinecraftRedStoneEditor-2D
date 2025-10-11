// 页面元素
const listEl = document.getElementById('list');

// Three.js
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

const camera = new THREE.PerspectiveCamera(45, (window.innerWidth - 200) / window.innerHeight, 0.1, 1000);
camera.position.set(30, 20, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth - 200, window.innerHeight);
document.getElementById('viewer').appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(30, 40, 30);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// OrbitControls
const orbitControlsUmd = window.ThreeAddons.OrbitControls;
const { OrbitControls } = orbitControlsUmd;
const controls = new OrbitControls(camera, renderer.domElement);

const loader = new THREE.TextureLoader();

Promise.all([
    fetch('mcAssets/models/block/_all.json').then(r => r.json()),
    fetch('mcAssets/blockstates/_all.json').then(r => r.json())
]).then(([models, blockstates]) => {
    console.log('模型数量:', Object.keys(models).length);
    console.log('方块状态数量:', Object.keys(blockstates).length);

    Object.keys(models).forEach(name => {
        const li = document.createElement('li');
        li.textContent = name.replace('minecraft:block/', '');
        li.onclick = () => displayModel(name);
        listEl.appendChild(li);
    });

    let currentGroup = null;

    function getResolvedModel(name, cache = {}, visited = new Set()) {
        if (cache[name]) return JSON.parse(JSON.stringify(cache[name]));
        if (visited.has(name)) { console.warn("循环引用:", name); return null; }
        visited.add(name);

        let m = models[name];
        if (!m) {
            const short = name.replace(/^minecraft:block\//,'').replace(/^block\//,'');
            if (models[short]) return getResolvedModel(short, cache, visited);
            console.warn("模型不存在:", name);
            return null;
        }
        m = JSON.parse(JSON.stringify(m));

        let parentModel = null;
        if (m.parent) {
            const parentName = m.parent.startsWith('minecraft:') ? m.parent : 'minecraft:' + m.parent;
            parentModel = getResolvedModel(parentName, cache, visited);
        }

        m.textures = Object.assign({}, parentModel ? parentModel.textures : {}, m.textures || {});


        if (!m.elements && parentModel && parentModel.elements) {
            m.elements = JSON.parse(JSON.stringify(parentModel.elements));
        }

        if (m.elements) {
            for (const el of m.elements) {
                el.faces = el.faces || {};
                for (const f of ['north','south','east','west','up','down']) {
                    const face = el.faces[f];
                    if (!face) continue;
                    if (face.texture && face.texture.startsWith('#')) {
                        const key = face.texture.slice(1);
                        const tex = m.textures[key];
                        if (tex) face.texture = tex;
                        else {
                            console.warn(`[Texture] ${name}.${f} 找不到 ${face.texture}`);
                        }
                    }
                }
            }
        }

        // fallback: 没有元素生成 16x16 cube
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

        cache[name] = JSON.parse(JSON.stringify(m));
        return m;
    }


    function getBlockStateModel(name, blockstates) {
        const blockName = name.replace('minecraft:block/', '');
        const state = blockstates[blockName];
        if (!state || !state.variants) return { model: name, x: 0, y: 0 };

        const variantKeys = Object.keys(state.variants);
        const firstVariant = state.variants[variantKeys[0]];
        return {
            model: firstVariant.model || name,
            x: firstVariant.x || 0,
            y: firstVariant.y || 0
        };
    }

    function createMeshFromModel(model, rotation = { x: 0, y: 0 }) {
        const group = new THREE.Group();
        const elems = model.elements || [];

        elems.forEach(el => {
            const size = [
                (el.to[0] - el.from[0]) / 16,
                (el.to[1] - el.from[1]) / 16,
                (el.to[2] - el.from[2]) / 16
            ];

            const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
            const faceNames = ['east', 'west', 'up', 'down', 'south', 'north'];
            const materials = faceNames.map(f => {
                const face = el.faces[f];
                if (!face) return new THREE.MeshStandardMaterial({ visible: false });
                let texPath = face.texture;
                texPath = texPath.split("/").pop();
                console.warn(`[Texture] 贴图 ${texPath}`);
                const tex = loader.load(`mcAssets/textures/block/${texPath}.png`);
                tex.magFilter = THREE.NearestFilter;
                tex.minFilter = THREE.NearestFilter;
                return new THREE.MeshStandardMaterial({ map: tex, transparent: true });
            });

            const geomUV = geometry.attributes.uv;
            const uvMap = {
                east: [3, 2, 1, 0],  // Right face
                west: [0, 1, 2, 3],  // Left face
                up: [0, 1, 2, 3],    // Top face
                down: [0, 1, 2, 3],  // Bottom face
                south: [0, 1, 2, 3], // Back face
                north: [0, 1, 2, 3]  // Front face
            };

            faceNames.forEach((fName, idx) => {
                const face = el.faces[fName];
                if (!face || !face.uv) {
                    return;
                }

                let [u1, v1, u2, v2] = face.uv;
                const uScale = 1 / 16;
                const vScale = 1 / 16;
                u1 *= uScale; u2 *= uScale;
                v1 = 1 - (v1 * vScale);
                v2 = 1 - (v2 * vScale);

                if (fName === 'east' || fName === 'west') {
                    const aspect = size[2] / size[1];
                    if (aspect !== 1) {
                        const scale = 1 / aspect;
                        const midU = (u1 + u2) / 2;
                        u1 = midU - (scale * (midU - u1));
                        u2 = midU + (scale * (u2 - midU));
                    }
                } else if (fName === 'up' || fName === 'down') {
                    const aspect = size[0] / size[2];
                    if (aspect !== 1) {
                        const scale = 1 / aspect;
                        const midV = (v1 + v2) / 2;
                        v1 = midV - (scale * (midV - v1));
                        v2 = midV + (scale * (v2 - midV));
                    }
                } else if (fName === 'north' || fName === 'south') {
                    const aspect = size[0] / size[1];
                    if (aspect !== 1) {
                        const scale = 1 / aspect;
                        const midU = (u1 + u2) / 2;
                        u1 = midU - (scale * (midU - u1));
                        u2 = midU + (scale * (u2 - midU));
                    }
                }

                const vertices = uvMap[fName];
                geomUV.setXY(idx * 4 + 1, u1, v1);
                geomUV.setXY(idx * 4 + 0, u2, v1);
                geomUV.setXY(idx * 4 + 2, u2, v2);
                geomUV.setXY(idx * 4 + 3, u1, v2);
            });

            geomUV.needsUpdate = true;

            const cube = new THREE.Mesh(geometry, materials);
            cube.position.set(
                (el.from[0] + el.to[0]) / 32 - 0.5,
                (el.from[1] + el.to[1]) / 32 - 0.5,
                (el.from[2] + el.to[2]) / 32 - 0.5
            );
            group.add(cube);
        });

        group.rotation.x = THREE.MathUtils.degToRad(rotation.x);
        group.rotation.y = THREE.MathUtils.degToRad(rotation.y);

        return group;
    }

    function displayModel(name) {
        if (currentGroup) scene.remove(currentGroup);
        const blockState = getBlockStateModel(name, blockstates);
        const model = getResolvedModel(blockState.model);
        if (!model) return;
        currentGroup = createMeshFromModel(model, { x: blockState.x, y: blockState.y });
        scene.add(currentGroup);
        console.log('展示模型:', name, model);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
});

// 窗口大小调整
window.addEventListener('resize', () => {
    camera.aspect = (window.innerWidth - 200) / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth - 200, window.innerHeight);
});