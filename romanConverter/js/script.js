function intToRoman(num) {
    const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const roman = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
    let res = "";
    let i = 0;
    while (num > 0) {
        while (num >= val[i]) {
            num -= val[i];
            res += roman[i];
        }
        i++;
    }
    return res;
}

const form = document.getElementById('converterForm');
const input = document.getElementById('numberInput');
const resultEl = document.getElementById('result');
const resultWrap = document.getElementById('resultWrap');
const errorEl = document.getElementById('errorMsg');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    resultEl.textContent = '';
    resultWrap.classList.add('hidden');

    const raw = input.value;
    const n = Number(raw);

    if (!raw) {
        errorEl.textContent = '⚠️ Please enter a number.';
        return;
    }
    if (!Number.isInteger(n)) {
        errorEl.textContent = '⚠️ Enter a whole integer.';
        return;
    }
    if (n < 1 || n > 3999) {
        errorEl.textContent = '⚠️ Enter a number between 1 and 3999.';
        return;
    }

    const roman = intToRoman(n);
    resultEl.textContent = roman;
    resultWrap.classList.remove('hidden');
    resultEl.classList.remove('animate-fade-in');
    void resultEl.offsetWidth; // restart animation
    resultEl.classList.add('animate-fade-in');
});