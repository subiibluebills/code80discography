// ============================================================
// УМНЫЙ ФИЛЬТР альбомов (три группы чекбоксов: год, треки, длительность)
//
// Правила:
//  - внутри одной группы галочки работают как «ИЛИ»
//    (2025 или 2024), без галочек группа ничего не ограничивает;
//  - между группами работает «И»
//    (год подходит И количество треков подходит И длительность подходит);
//  - «умная» часть: вариант, после выбора которого не осталось бы
//    ни одного альбома, блокируется, а в скобках показывается,
//    сколько альбомов даст каждый вариант.
// ============================================================

const cards       = document.querySelectorAll('.album-card');
const resultCount = document.getElementById('result-count');
const resetButton = document.getElementById('reset-filters');


// --- 1. Годы создаём из карточек (чтобы не писать их в HTML вручную) ---

const years = [...new Set([...cards].map(card => card.dataset.year))]
    .sort((a, b) => b - a);   // от новых к старым

const yearBox = document.getElementById('f-year');
years.forEach(year => {
    yearBox.insertAdjacentHTML('beforeend',
        '<label class="check">' +
            '<input type="checkbox" name="year" value="' + year + '">' +
            '<span>' + year + '</span> <span class="count"></span>' +
        '</label>');
});


// --- 2. Описание трёх групп: как понять, подходит ли карточка под вариант ---

// Проверка «число попадает в диапазон "от-до"» (правая граница не входит)
function inRange(number, range) {
    const [min, max] = range.split('-').map(Number);
    return number >= min && number < max;
}

const groups = [
    {
        name: 'year',
        matches: (card, value) => card.dataset.year === value
    },
    {
        name: 'tracks',
        matches: (card, value) => inRange(Number(card.dataset.tracks), value)
    },
    {
        name: 'duration',
        matches: (card, value) => inRange(Number(card.dataset.duration) / 60, value)  // секунды в минуты
    }
];


// --- 3. Вспомогательные функции ---

// Все чекбоксы одной группы
function inputsOf(group) {
    return document.querySelectorAll('input[name="' + group.name + '"]');
}

// Что отмечено в группе сейчас, например ["2025", "2024"]
function checkedValues(group) {
    return [...inputsOf(group)].filter(input => input.checked).map(input => input.value);
}

// Подходит ли карточка под группу?
function matchesGroup(card, group) {
    const values = checkedValues(group);
    if (values.length === 0) return true;                 // ничего не отмечено: группа не ограничивает
    return values.some(value => group.matches(card, value));
}

// Сколько альбомов получится, если выбрать вариант value в группе group,
// при этом остальные группы остаются как выбраны сейчас
function countFor(group, value) {
    let count = 0;
    cards.forEach(card => {
        const fitsOption = group.matches(card, value);
        const fitsOthers = groups
            .filter(other => other !== group)
            .every(other => matchesGroup(card, other));
        if (fitsOption && fitsOthers) count++;
    });
    return count;
}


// --- 4. Главная функция: пересчитать всё после любого клика ---

function update() {
    // 4.1. Блокируем варианты, которые дали бы пустой результат.
    // Если блокируется уже отмеченный вариант, снимаем с него галочку.
    // Из-за этого могут измениться остальные варианты, поэтому повторяем,
    // пока всё не уляжется.
    let changed = true;
    while (changed) {
        changed = false;
        groups.forEach(group => {
            inputsOf(group).forEach(input => {
                const count = countFor(group, input.value);
                const label = input.parentElement;

                input.disabled = (count === 0);
                label.classList.toggle('is-disabled', count === 0);
                label.querySelector('.count').textContent = '(' + count + ')';

                if (input.disabled && input.checked) {
                    input.checked = false;
                    changed = true;
                }
            });
        });
    }

    // 4.2. Показываем только подходящие карточки
    let shown = 0;
    cards.forEach(card => {
        const visible = groups.every(group => matchesGroup(card, group));
        card.classList.toggle('is-hidden', !visible);
        if (visible) shown++;
    });

    resultCount.textContent = 'Найдено: ' + shown + ' из ' + cards.length;
}


// --- 5. Подписки на действия пользователя ---

document.querySelectorAll('.filters input').forEach(input => {
    input.addEventListener('change', update);
});

resetButton.addEventListener('click', () => {
    document.querySelectorAll('.filters input').forEach(input => {
        input.checked = false;
    });
    update();
});

update();   // первый запуск: показать счётчики сразу при открытии страницы
