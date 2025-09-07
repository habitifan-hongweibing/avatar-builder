// ==================== БАЗОВАЯ СТРУКТУРА ДАННЫХ ====================

// Текущий наряд аватара
let currentOutfit = {
    background: null,
    weapon: null,
    shield: null,
    head: null,
    armor: null,
    back: null,
    mount: null,
    pet: null,
    skin: null,
    hair: null,
    beard: null,
    headAccessory: null,
    eyewear: null,
    flower: null,
    shirt: null,
    wheelchair: null
};

// Текущий выбранный класс для фильтрации
let currentClass = 'all';

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

// Инициализация при загрузке страницы
function init() {
    console.log('🚀 Habitica Dressing Room initialized!');
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
            alert(`Selected: ${item.name}\nImage: ${item.image}`);
            // Здесь будет логика выбора предмета
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

// Случайный подбор outfit (заглушка)
function randomizeOutfit() {
    alert('🎲 Randomize feature coming soon!');
}

// Скачивание аватара (заглушка)
function downloadAvatar() {
    alert('📥 Download feature coming soon!');
}

// ==================== ЗАПУСК ====================

// Запускаем когда страница загружена
document.addEventListener('DOMContentLoaded', init);