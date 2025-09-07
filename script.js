// ==================== БАЗОВАЯ СТРУКТУРА ДАННЫХ ====================

// Текущий наряд аватара
let currentOutfit = {
    background: null,
    chair: null,
    mountBody: null,
    mountHead: null,
    back: null,
    body: null,
    skin: null,
    shirt: null,
    armor: null,
    hair: null,
    beard: null,
    head: null,
    headAccessory: null,
    eyewear: null,
    flower: null,
    shield: null,
    weapon: null,
    pet: null
};

// Текущий выбранный класс для фильтрации
let currentClass = 'all';

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

// Инициализация при загрузке страницы
function init() {
    console.log('🚀 Habitica Avatar Builder initialized!');
    setupEventListeners();
    showCategory('background');
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопки категорий
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            showCategory(category);
        });
    });

    // Кнопки классов
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedClass = btn.dataset.class;
            selectClass(selectedClass);
        });
    });

    // Кнопка случайного набора
    document.getElementById('randomizeBtn').addEventListener('click', randomizeOutfit);

    // Кнопка скачивания
    document.getElementById('downloadBtn').addEventListener('click', downloadAvatar);
}

// Показать предметы категории
function showCategory(category) {
    console.log(`Showing category: ${category}`);
    
    const items = demoItems[category] || [];
    const filteredItems = filterItemsByClass(items);
    displayItems(filteredItems);
}

// Фильтрация предметов по классу
function filterItemsByClass(items) {
    if (currentClass === 'all') return items;
    return items.filter(item => item.class === 'all' || item.class === currentClass);
}

// Отображение предметов в сетке
function displayItems(items) {
    const grid = document.getElementById('itemsGrid');
    
    if (items.length === 0) {
        grid.innerHTML = '<p class="placeholder">No items found</p>';
        return;
    }

    grid.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
            <p>${item.name}</p>
        `;
        itemElement.addEventListener('click', () => {
            selectItem(item, category);
        });
        grid.appendChild(itemElement);
    });
}

// Выбор класса для фильтрации
function selectClass(className) {
    console.log(`Selected class: ${className}`);
    currentClass = className;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.class === className);
    });
    
    // Перефильтровываем текущую категорию
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category;
    if (activeCategory) {
        showCategory(activeCategory);
    }
}

// Выбор предмета (заглушка)
function selectItem(item, category) {
    console.log(`Selected: ${item.name} from ${category}`);
    // Здесь будет логика применения предмета к аватару
}

// Случайный подбор outfit (заглушка)
function randomizeOutfit() {
    console.log('🎲 Randomizing outfit...');
    // Здесь будет логика рандомизации
}

// Скачивание аватара (заглушка)
function downloadAvatar() {
    console.log('📥 Downloading avatar...');
    // Здесь будет логика скачивания
}

// ==================== ЗАПУСК ====================

// Запускаем когда страница загружена
document.addEventListener('DOMContentLoaded', init);