const cards       = document.querySelectorAll('.album-card');
const resultCount = document.getElementById('result-count');
const resetButton = document.getElementById('reset-filters');

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

function inputsOf(group) {
    return document.querySelectorAll('input[name="' + group.name + '"]');
}

// что отмечено в группе сейчас
function checkedValues(group) {
    return [...inputsOf(group)].filter(input => input.checked).map(input => input.value);
}

// подходит ли карточка под группу?
function matchesGroup(card, group) {
    const values = checkedValues(group);
    if (values.length === 0) return true;
    return values.some(value => group.matches(card, value));
}

// сколько альбомов получится, если выбрать вариант value в группе group, при этом остальные группы остаются как выбраны сейчас
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

function update() {
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

    let shown = 0;
    cards.forEach(card => {
        const visible = groups.every(group => matchesGroup(card, group));
        card.classList.toggle('is-hidden', !visible);
        if (visible) shown++;
    });

    resultCount.textContent = 'Найдено: ' + shown + ' из ' + cards.length;
}

document.querySelectorAll('.filters input').forEach(input => {
    input.addEventListener('change', update);
});

resetButton.addEventListener('click', () => {
    document.querySelectorAll('.filters input').forEach(input => {
        input.checked = false;
    });
    update();
});

update();
