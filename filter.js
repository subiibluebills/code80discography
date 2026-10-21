// ============================================================
// Фильтрация альбомов на странице «Дискография»
// Три фильтра работают вместе (условие «И»): год, количество
// треков, длительность. Результат обновляется сразу при
// любом изменении, кнопка «применить» не нужна.
// ============================================================

// --- 1. Находим нужные элементы на странице ---
const cards = document.querySelectorAll('.album-card');

const yearSelect     = document.getElementById('f-year');
const tracksSelect   = document.getElementById('f-tracks');
const durationSlider = document.getElementById('f-duration');
const durationLabel  = document.getElementById('duration-value');
const resultCount    = document.getElementById('result-count');
const emptyMessage   = document.getElementById('empty-message');
const resetButton    = document.getElementById('reset-filters');


// --- 2. «Умная» настройка: фильтры подстраиваются под данные ---

// Берём годы из карточек, убираем повторы, сортируем от нового к старому
const years = [...new Set([...cards].map(card => card.dataset.year))]
    .sort((a, b) => b - a);

years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
});

// Максимум слайдера = самый длинный альбом, округлённый вверх до 5 минут
const longestSeconds = Math.max(...[...cards].map(card => Number(card.dataset.duration)));
const maxMinutes = Math.ceil(longestSeconds / 60 / 5) * 5;
durationSlider.max = maxMinutes;
durationSlider.value = maxMinutes;


// --- 3. Главная функция: показать только подходящие карточки ---
function applyFilters() {
    const selectedYear   = yearSelect.value;
    const selectedTracks = tracksSelect.value;        // "all" или "от-до", например "11-25"
    const maxSeconds     = Number(durationSlider.value) * 60;
    const durationIsAny  = Number(durationSlider.value) === maxMinutes;

    // Подпись у слайдера
    durationLabel.textContent = durationIsAny
        ? 'любая'
        : 'до ' + durationSlider.value + ' мин';

    let shown = 0;

    cards.forEach(card => {
        const year     = card.dataset.year;
        const tracks   = Number(card.dataset.tracks);
        const duration = Number(card.dataset.duration);

        // Проверка 1: год
        const yearOk = selectedYear === 'all' || year === selectedYear;

        // Проверка 2: количество треков
        let tracksOk = true;
        if (selectedTracks !== 'all') {
            const [min, max] = selectedTracks.split('-').map(Number);
            tracksOk = tracks >= min && tracks <= max;
        }

        // Проверка 3: длительность (альбом не длиннее выбранного значения)
        const durationOk = duration <= maxSeconds;

        // Карточка видна, только если прошла ВСЕ три проверки
        const visible = yearOk && tracksOk && durationOk;
        card.classList.toggle('is-hidden', !visible);

        if (visible) shown++;
    });

    // Счётчик и сообщение «ничего не найдено»
    resultCount.textContent = 'Найдено: ' + shown + ' из ' + cards.length;
    emptyMessage.hidden = shown !== 0;
}


// --- 4. Сброс всех фильтров ---
function resetFilters() {
    yearSelect.value = 'all';
    tracksSelect.value = 'all';
    durationSlider.value = maxMinutes;
    applyFilters();
}


// --- 5. Подписываемся на действия пользователя ---
yearSelect.addEventListener('change', applyFilters);
tracksSelect.addEventListener('change', applyFilters);
durationSlider.addEventListener('input', applyFilters);   // input = обновляется пока двигаем ползунок
resetButton.addEventListener('click', resetFilters);

// Первый запуск, чтобы сразу показать счётчик
applyFilters();
