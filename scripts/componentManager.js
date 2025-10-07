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

function getAllComponents() {
  try {
    return Object.values(components).flat();
  } catch (error) {
    displayError(`getAllComponents error: ${error.message}`);
    return [];
  }
}

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
