let currentOutfit = {
    background: null, chair: null, mountBody: null, mountHead: null,
    back: null, body: null, skin: null, shirt: null, armor: null,
    hairColor: null, hairBase: null, hairBangs: null, hairBeard: null,
    hairMustache: null, hairFlower: null, hairTopHair: null,
    head: null, headAccessory: null, eyewear: null,
    shield: null, weapon: null, pet: null
};
let currentClass = 'all';
let gearDatabase = {};
let missingCategories = {};

async function loadAllGearData() {
    console.log('🔄 Loading gear data...');
    const categories = [
        'weapon', 'armor', 'head', 'shield', 'back', 'body',
        'headAccessory', 'eyewear', 'background', 'skin', 'shirt', 'chair',
        'mount', 'pet',
        'hairColor', 'hairBase', 'hairBangs', 'hairBeard', 'hairMustache', 'hairFlower', 'hairTopHair'
    ];
    categories.forEach(category => {
        gearDatabase[category] = [];
    });
    await loadRealData(categories);
    console.log('✅ Data loaded successfully');
}

async function loadRealData(categories) {
    await Promise.all(categories.map(loadCategory));
}

async function loadCategory(category) {
    const hairMap = {
        hairColor: 'hair/color.json',
        hairBase: 'hair/base.json',
        hairBangs: 'hair/bangs.json',
        hairBeard: 'hair/beard.json',
        hairMustache: 'hair/mustache.json',
        hairFlower: 'hair/flower.json',
        hairTopHair: 'hair/top-hair.json'
    };
    const file = hairMap[category] || `${category}.json`;
    try {
        const response = await fetch(`data/${file}`);
        if (!response.ok) {
            missingCategories[category] = true;
            return;
        }
        const data = await response.json();
        processCategoryData(data, category);
    } catch (error) {
        missingCategories[category] = true;
        console.error(`Error loading ${category}:`, error);
    }
}

function processCategoryData(data, category) {
    if (category.startsWith('hair')) {
        for (const [itemKey, itemData] of Object.entries(data)) {
            const hairType = category.replace('hair', '').toLowerCase();
            const imagePath = itemData.image ? `assets/images/hair/${hairType}/${itemData.image}` : '';
            
            gearDatabase[category].push({
                id: itemKey,
                image: imagePath,
                class: 'all'
            });
        }
    } else if (category === 'mount') {
        for (const [setType, items] of Object.entries(data)) {
            if (!items) continue;
            for (const [itemKey, itemData] of Object.entries(items)) {
                if (!itemData) continue;
                gearDatabase[category].push({
                    id: itemKey,
                    body: itemData.bodyImage ? `assets/images/mounts/body/${itemData.bodyImage}` : `assets/images/mounts/body/${itemKey}.png`,
                    head: itemData.headImage ? `assets/images/mounts/head/${itemData.headImage}` : `assets/images/mounts/head/${itemKey}.png`,
                    icon: itemData.iconImage ? `assets/images/mounts/icon/${itemData.iconImage}` : `assets/images/mounts/icon/${itemKey}.png`,
                    class: setType === 'base' ? 'all' : setType
                });
            }
        }
    } else {
        for (const [setType, items] of Object.entries(data)) {
            if (!items) continue;
            for (const [itemKey, itemData] of Object.entries(items)) {
                if (!itemData) continue;
                
                let imagePath = '';
                if (itemData.image) {
                    if (category === 'background') {
                        imagePath = `assets/images/backgrounds/${itemData.image}`;
                    } else if (category === 'skin') {
                        imagePath = `assets/images/skin/${itemData.image}`;
                    } else if (category === 'shirt') {
                        imagePath = `assets/images/shirts/${itemData.image}`;
                    } else {
                        imagePath = `assets/images/${category}/${itemData.image}`;
                    }
                }
                
                gearDatabase[category].push({
                    id: itemKey,
                    image: imagePath,
                    class: setType === 'base' ? 'all' : setType
                });
            }
        }
    }
    console.log(`✅ ${category}: ${gearDatabase[category].length} items loaded`);
}

function setDefaultOutfit() {
    const categoriesToSet = ['skin', 'head', 'body', 'hairBase'];
    categoriesToSet.forEach(category => {
        if (gearDatabase[category] && gearDatabase[category].length > 0) {
            const defaultItem = filterItemsByClass(gearDatabase[category])[0];
            if (defaultItem) {
                applyItemToAvatar(defaultItem, category);
            }
        }
    });
}

async function init() {
    console.log('🚀 Initializing...');
    await loadAllGearData();
    setDefaultOutfit();
    setupEventListeners();
    showCategory('weapon');
}

function setupEventListeners() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.dataset.category;
            showCategory(category);
        });
    });

    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectClass(btn.dataset.class);
        });
    });

    document.getElementById('randomizeBtn').addEventListener('click', randomizeOutfit);
    document.getElementById('downloadBtn').addEventListener('click', downloadAvatar);
}

function showCategory(category) {
    if (missingCategories[category]) {
        displayMissingCategory(category);
        return;
    }
    const items = gearDatabase[category] || [];
    const filteredItems = filterItemsByClass(items);
    displayItems(filteredItems, category);
}

function displayMissingCategory(category) {
    const grid = document.getElementById('itemsGrid');
    if (!grid) return;
    grid.innerHTML = `<p class="placeholder">No data for this category (missing JSON file): <b>${category}</b></p>`;
}

function filterItemsByClass(items) {
    if (currentClass === 'all') return items;
    return items.filter(item => item.class === 'all' || item.class === currentClass);
}

function displayItems(items, category) {
    const grid = document.getElementById('itemsGrid');
    if (!grid) return;
    if (!items || items.length === 0) {
        grid.innerHTML = '<p class="placeholder">No items found</p>';
        return;
    }
    grid.innerHTML = '';
    
    const noneButton = document.createElement('div');
    noneButton.className = 'item';
    noneButton.innerHTML = `
        <div style="width: 64px; height: 64px; background: rgba(0,0,0,0.3); 
                   display: flex; align-items: center; justify-content: center;
                   border-radius: 5px; margin: 0 auto 5px;">
            <span style="font-size: 24px;">✕</span>
        </div>
        <p>None</p>
    `;
    noneButton.addEventListener('click', () => {
        removeItemFromAvatar(category);
    });
    grid.appendChild(noneButton);
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.title = item.id;
        
        if (category === 'mount') {
            itemElement.innerHTML = `
                <img src="${item.icon}" alt="${item.id}" onerror="this.style.display='none'">
            `;
        } else {
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.id}" onerror="this.style.display='none'">
            `;
        }
        
        itemElement.addEventListener('click', () => {
            selectItem(item, category);
        });
        grid.appendChild(itemElement);
    });
}

function removeItemFromAvatar(category) {
    let layerId = `layer${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    if (category === 'mount') {
        const layerBody = document.getElementById('layerMountBody');
        const layerHead = document.getElementById('layerMountHead');
        if (layerBody) layerBody.style.display = 'none';
        if (layerHead) layerHead.style.display = 'none';
        currentOutfit.mountBody = null;
        currentOutfit.mountHead = null;
    } else {
        const layer = document.getElementById(layerId);
        if (layer) {
            layer.style.display = 'none';
            currentOutfit[category] = null;
        }
    }
}

function selectClass(className) {
    currentClass = className;
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.class === className);
    });
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category;
    if (activeCategory) showCategory(activeCategory);
}

function selectItem(item, category) {
    applyItemToAvatar(item, category);
}

function applyItemToAvatar(item, category) {
    if (category === 'mount') {
        const layerBody = document.getElementById('layerMountBody');
        const layerHead = document.getElementById('layerMountHead');
        if (layerBody && item.body) {
            layerBody.src = item.body;
            layerBody.style.display = 'block';
            currentOutfit.mountBody = item.id;
        }
        if (layerHead && item.head) {
            layerHead.src = item.head;
            layerHead.style.display = 'block';
            currentOutfit.mountHead = item.id;
        }
    } else {
        let layerId = `layer${category.charAt(0).toUpperCase() + category.slice(1)}`;
        const layer = document.getElementById(layerId);
        if (layer && item.image) {
            layer.src = item.image;
            layer.style.display = 'block';
            currentOutfit[category] = item.id;
        }
    }
    
    const placeholder = document.getElementById('avatarPlaceholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
}

function randomizeOutfit() {
    Object.keys(gearDatabase).forEach(category => {
        if (gearDatabase[category] && gearDatabase[category].length > 0) {
            const filteredItems = filterItemsByClass(gearDatabase[category]);
            if (filteredItems.length > 0) {
                const randomItem = filteredItems[Math.floor(Math.random() * filteredItems.length)];
                applyItemToAvatar(randomItem, category);
            }
        }
    });
}

function downloadAvatar() {
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 147;
    const ctx = canvas.getContext('2d');
    
    const layerIds = [
        'layerBackground', 'layerChair', 'layerMountBody', 'layerMountHead',
        'layerBack', 'layerBody', 'layerSkin', 'layerShirt', 'layerArmor',
        'layerHairColor', 'layerHairBase', 'layerHairBangs', 'layerHairBeard',
        'layerHairMustache', 'layerHairFlower', 'layerHairTopHair',
        'layerHead', 'layerHeadAccessory', 'layerEyewear',
        'layerShield', 'layerWeapon', 'layerPet'
    ];
    
    Promise.all(layerIds.map(id => {
        const img = document.getElementById(id);
        return new Promise(resolve => {
            if (img && img.src && img.style.display !== 'none') {
                const tempImg = new Image();
                tempImg.crossOrigin = 'anonymous';
                tempImg.onload = () => resolve(tempImg);
                tempImg.onerror = () => resolve(null);
                tempImg.src = img.src;
            } else {
                resolve(null);
            }
        });
    })).then(images => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        images.forEach(img => {
            if (img) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        });
        
        const link = document.createElement('a');
        link.download = 'habitica-avatar.png';
        link.href = canvas.toDataURL();
        link.click();
    }).catch(error => {
        console.error('Error creating avatar image:', error);
        alert('Error creating avatar image. Please make sure all images are loaded.');
    });
}

document.addEventListener('DOMContentLoaded', init);