let currentOutfit = {
    background: null, chair: null, mountBody: null, mountHead: null,
    back: null, body: null, skin: null, shirt: null, armor: null,
    hairColor: null, hairBase: null, hairBangs: null, hairBeard: null,
    hairMustache: null, hairFlower: null, hairTopHair: null,
    head: null, headAccessory: null, eyewear: null, flower: null,
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
        'hairColor', 'hairBase', 'hairBangs', 'hairBeard',
        'hairMustache', 'hairFlower', 'hairTopHair'
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
            gearDatabase[category].push({
                id: itemKey,
                image: itemData.image ? `assets/images/hair/${itemData.image}` : ''
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
    } else if (category === 'background') {
        for (const [setType, items] of Object.entries(data)) {
            if (!items) continue;
            items.forEach(itemData => {
                gearDatabase[category].push({
                    id: itemData.key,
                    image: itemData.image ? `assets/images/background/${itemData.image}` : ''
                });
            });
        }
    } else {
        for (const [setType, items] of Object.entries(data)) {
            if (!items) continue;
            for (const [itemKey, itemData] of Object.entries(items)) {
                if (!itemData) continue;
                gearDatabase[category].push({
                    id: itemKey,
                    image: itemData.image ? `assets/images/${category}/${itemData.image}` : '',
                    class: setType === 'base' ? 'all' : setType
                });
            }
        }
    }
    console.log(`✅ ${category}: ${gearDatabase[category].length} items loaded`);
}

async function init() {
    console.log('🚀 Initializing...');
    await loadAllGearData();
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
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        if (category === 'mount') {
            itemElement.innerHTML = `
                <img src="${item.icon}" alt="" onerror="this.style.display='none'">
            `;
        } else {
            itemElement.innerHTML = `
                <img src="${item.image}" alt="" onerror="this.style.display='none'">
            `;
        }
        itemElement.addEventListener('click', () => {
            selectItem(item, category);
        });
        grid.appendChild(itemElement);
    });
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
        if (layerBody) {
            layerBody.src = item.body;
            layerBody.style.display = 'block';
            currentOutfit.mountBody = item.id;
        }
        if (layerHead) {
            layerHead.src = item.head;
            layerHead.style.display = 'block';
            currentOutfit.mountHead = item.id;
        }
    } else {
        let layerId = `layer${category.charAt(0).toUpperCase() + category.slice(1)}`;
        const layer = document.getElementById(layerId);
        if (layer) {
            layer.src = item.image;
            layer.style.display = 'block';
            currentOutfit[category] = item.id;
        }
    }
}

function randomizeOutfit() {
    Object.keys(gearDatabase).forEach(category => {
        if (gearDatabase[category].length > 0) {
            const randomItem = gearDatabase[category][Math.floor(Math.random() * gearDatabase[category].length)];
            applyItemToAvatar(randomItem, category);
        }
    });
}

function downloadAvatar() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
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
                const tempImg = new window.Image();
                tempImg.crossOrigin = 'anonymous';
                tempImg.onload = () => resolve(tempImg);
                tempImg.onerror = () => resolve(null);
                tempImg.src = img.src;
            } else {
                resolve(null);
            }
        });
    })).then(images => {
        images.forEach(img => {
            if (img) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        });
        const link = document.createElement('a');
        link.download = 'avatar.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

document.addEventListener('DOMContentLoaded', init);
