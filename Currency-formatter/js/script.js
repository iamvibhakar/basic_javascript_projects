const amountEl = document.getElementById('amount');
const usdEl = document.getElementById('usd');
const aedEl = document.getElementById('aed');
const nprEl = document.getElementById('npr');
const pkrEl = document.getElementById('pkr');
const eurEl = document.getElementById('eur');
const jpyEl = document.getElementById('jpy');
const results = document.getElementById('results');

const convertBtn = document.getElementById('convertBtn');
const resetBtn = document.getElementById('resetBtn');

const symbols = {
    USD: "$",
    AED: "د.إ",
    NPR: "रू",
    PKR: "₨",
    EUR: "€",
    JPY: "¥"
};

// ✅ Toast Notification
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;

    const typeStyles = {
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    notification.className += ` ${typeStyles[type] || typeStyles.info}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.remove('translate-x-full'), 100);

    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

async function fetchRates(inrAmount) {
    try {
        const url = `https://open.er-api.com/v6/latest/INR`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.rates) {
            showNotification("Invalid response from currency API", "error");
            return;
        }

        const rates = data.rates;
        usdEl.textContent = symbols.USD + " " + (inrAmount * rates.USD).toFixed(2);
        aedEl.textContent = symbols.AED + " " + (inrAmount * rates.AED).toFixed(2);
        nprEl.textContent = symbols.NPR + " " + (inrAmount * rates.NPR).toFixed(2);
        pkrEl.textContent = symbols.PKR + " " + (inrAmount * rates.PKR).toFixed(2);
        eurEl.textContent = symbols.EUR + " " + (inrAmount * rates.EUR).toFixed(2);
        jpyEl.textContent = symbols.JPY + " " + (inrAmount * rates.JPY).toFixed(2);

        results.classList.remove("hidden");
        showNotification("Conversion successful ✅", "success");
    } catch (err) {
        showNotification("Failed to fetch live rates. Please check internet connection.", "error");
    }
}

convertBtn.addEventListener('click', () => {
    const value = Number(amountEl.value);
    if (isNaN(value) || value <= 0) {
        showNotification("Enter a valid INR amount greater than 0", "error");
        return;
    }
    fetchRates(value);
});

resetBtn.addEventListener('click', () => {
    amountEl.value = '';
    results.classList.add("hidden");
    showNotification("Form reset successfully", "info");
});