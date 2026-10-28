const mainStyle      = document.getElementById('main-style');   // link на style.css
const printStyle     = document.getElementById('print-style');  // link на print.css
const toggleButton   = document.getElementById('print-toggle');
const printNowButton = document.getElementById('print-now');

let printMode = false;

toggleButton.addEventListener('click', function () {
    printMode = !printMode;

    mainStyle.media  = printMode ? 'not all' : 'all';
    printStyle.media = printMode ? 'all' : 'not all';

    toggleButton.textContent = printMode ? 'обычная версия' : 'версия для печати';
    printNowButton.hidden = !printMode;
});

printNowButton.addEventListener('click', function () {
    window.print();
});
