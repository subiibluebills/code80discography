// ============================================================
// Переключение «обычная версия» <-> «версия для печати»
// Страница не перезагружается: скрипт просто включает один файл
// стилей и выключает другой.
// ============================================================

const mainStyle      = document.getElementById('main-style');   // <link> на style.css
const printStyle     = document.getElementById('print-style');  // <link> на print.css
const toggleButton   = document.getElementById('print-toggle');
const printNowButton = document.getElementById('print-now');

let printMode = false;   // сейчас включена обычная версия

toggleButton.addEventListener('click', function () {
    printMode = !printMode;   // было true, станет false, и наоборот

    // media="not all" означает «этот файл стилей ни к чему не применяется»,
    // media="all" означает «применяется всегда»
    mainStyle.media  = printMode ? 'not all' : 'all';
    printStyle.media = printMode ? 'all' : 'not all';

    // Подпись кнопки и кнопка «напечатать» подстраиваются под режим
    toggleButton.textContent = printMode ? 'обычная версия' : 'версия для печати';
    printNowButton.hidden = !printMode;
});

// Кнопка «напечатать» открывает окно печати браузера
printNowButton.addEventListener('click', function () {
    window.print();
});
